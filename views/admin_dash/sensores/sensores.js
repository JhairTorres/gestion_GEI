// Variables globales para los modales
let currentSensorId = null;

// Verificar sesión del usuario
async function checkSession() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/session', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            return data.authenticated;
        }
        return false;
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        return false;
    }
}

// Verificar token y redirigir si no está autenticado
async function checkToken() {
    const isAuthenticated = await checkSession();
    if (!isAuthenticated) {
        alert("Sesión expirada o inválida. Redirigiendo al login.");
        window.location.href = "../login/login.html";
        return false;
    }
    return true;
}

// Obtener todos los sensores
async function fetchSensores() {
    if (!(await checkToken())) return;

    try {
        const response = await fetch('http://localhost:5000/api/sensores/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener sensores');
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('Formato de datos inesperado');
        }

        renderSensores(data);
    } catch (error) {
        console.error("Error al cargar sensores:", error);
        showAlert("error", error.message || "Error al cargar sensores. Verifique su conexión.");
    }
}

async function searchSensor() {
    console.log("Función searchSensor ejecutada"); // Debug
    
    if (!(await checkToken())) {
        console.log("Token no válido"); // Debug
        return;
    }

    const idInput = document.getElementById("searchId");
    if (!idInput) {
        console.error("Elemento searchId no encontrado"); // Debug
        showAlert("error", "Error interno: campo de búsqueda no encontrado");
        return;
    }

    const id = idInput.value.trim();
    console.log("ID ingresado:", id); // Debug

    if (!id) {
        showAlert("warning", "Por favor ingrese un ID para buscar");
        return;
    }

    if (isNaN(id)) {
        showAlert("warning", "El ID debe ser un número");
        return;
    }

    try {
        console.log(`Buscando sensor con ID: ${id}`); // Debug
        const response = await fetch(`http://localhost:5000/api/sensores/${id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log("Respuesta del servidor:", response); // Debug

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Error del servidor:", errorData); // Debug
            throw new Error(errorData.message || `Error al buscar sensor con ID ${id}`);
        }

        const sensor = await response.json();
        console.log("Datos del sensor:", sensor); // Debug
        
        if (!sensor || !sensor.id) {
            throw new Error(`Sensor con ID ${id} no encontrado`);
        }

        showSensorDetails(sensor);
        displaySensorData(sensor)
    } catch (error) {
        console.error("Error en searchSensor:", error); // Debug
        showAlert("error", error.message || "Error al buscar el sensor");
    }
}
function displaySensorData(sensor) {
    document.getElementById('sensorResult').style.display = 'block';
    document.getElementById('displayId').textContent = sensor.id;
    document.getElementById('displayNombre').textContent = sensor.nombre_sensor;
    document.getElementById('displayUbicacion').textContent = sensor.id_ubicacion;
    document.getElementById('displayCoordenadas').textContent = sensor.ubicacion_geografica;
    document.getElementById('displayCreadoPor').textContent = sensor.creado_por;
    document.getElementById('displayFechaCreacion').textContent = sensor.fecha_creacion;
    document.getElementById('displayUltimaCalibracion').textContent = sensor.ultima_calibracion;
}
// Mostrar detalles del sensor en un modal
function showSensorDetails(sensor) {
    let coords = "Sin datos";
    if (sensor.ubicacion_geografica) {
        const match = sensor.ubicacion_geografica.match(/POINT\(([^)]+)\)/);
        if (match) {
            const [longitud, latitud] = match[1].split(' ');
            coords = `Lat: ${latitud}, Long: ${longitud}`;
        }
    }

    const modalContent = `
        <h3>Detalles del Sensor</h3>
        <p><strong>ID:</strong> ${sensor.id}</p>
        <p><strong>Nombre:</strong> ${sensor.nombre_sensor}</p>
        <p><strong>Ubicación:</strong> ${coords}</p>
        <p><strong>Creado por:</strong> ${sensor.creado_por || 'N/A'}</p>
        <p><strong>Fecha creación:</strong> ${new Date(sensor.fecha_creacion).toLocaleString()}</p>
        ${sensor.ultima_calibracion ? `<p><strong>Última calibración:</strong> ${new Date(sensor.ultima_calibracion).toLocaleString()}</p>` : ''}
    `;

    showModal("Detalles del Sensor", modalContent);
}

// Mostrar modal de edición
function showEditModal(sensorId) {
    currentSensorId = sensorId;
    document.getElementById('modalSensorId').value = sensorId;
    
    // Buscar los datos del sensor para prellenar el formulario
    const sensorRow = document.querySelector(`tr[data-id="${sensorId}"]`);
    if (sensorRow) {
        document.getElementById('modalNombreSensor').value = sensorRow.cells[1].textContent;
        document.getElementById('modalIdUbicacion').value = sensorRow.cells[2].textContent === 'N/A' ? '' : sensorRow.cells[2].textContent;
        
        const coordsText = sensorRow.cells[3].textContent;
        if (coordsText.includes('Lat:') && coordsText.includes('Long:')) {
            const lat = coordsText.match(/Lat: ([\d.-]+)/)[1];
            const long = coordsText.match(/Long: ([\d.-]+)/)[1];
            document.getElementById('modalLatitud').value = lat;
            document.getElementById('modalLongitud').value = long;
        }
    }
    
    document.getElementById('editModal').style.display = 'block';
}

// Enviar edición del sensor
async function submitEdit() {
    const nombre_sensor = document.getElementById('modalNombreSensor').value.trim();
    const id_ubicacion = document.getElementById('modalIdUbicacion').value.trim();
    const latitud = document.getElementById('modalLatitud').value.trim();
    const longitud = document.getElementById('modalLongitud').value.trim();
    const id = currentSensorId;

    if (!nombre_sensor || !latitud || !longitud) {
        showAlert("warning", "Nombre, latitud y longitud son obligatorios");
        return;
    }

    if (isNaN(latitud) || isNaN(longitud)) {
        showAlert("warning", "Latitud y longitud deben ser valores numéricos");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/sensores/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre_sensor,
                id_ubicacion: id_ubicacion || null,
                latitud: parseFloat(latitud),
                longitud: parseFloat(longitud)
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al actualizar sensor');
        }

        showAlert("success", "Sensor actualizado con éxito");
        closeModal();
        fetchSensores();
    } catch (error) {
        console.error("Error al actualizar sensor:", error);
        showAlert("error", error.message || "No se pudo actualizar el sensor");
    }
}

// Mostrar modal de confirmación de eliminación
function showDeleteModal(sensorId) {
    currentSensorId = sensorId;
    document.getElementById('deleteModalText').textContent = `¿Estás seguro de que deseas marcar como eliminado el sensor con ID ${sensorId}?`;
    document.getElementById('deleteModal').style.display = 'block';
}

// Confirmar eliminación del sensor
async function confirmDelete() {
    try {
        const response = await fetch(`http://localhost:5000/api/sensores/${currentSensorId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al eliminar sensor');
        }

        showAlert("success", "Sensor marcado como eliminado correctamente");
        closeModal();
        fetchSensores();
    } catch (error) {
        console.error("Error al eliminar sensor:", error);
        showAlert("error", error.message || "No se pudo eliminar el sensor");
    }
}

// Cerrar modal
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('deleteModal').style.display = 'none';
    currentSensorId = null;
}

// Agregar nuevo sensor
async function saveSensor() {
    if (!(await checkToken())) return;

    const nombre_sensor = document.getElementById("nombre_sensor").value.trim();
    const id_ubicacion = document.getElementById("id_ubicacion").value.trim();
    const latitud = document.getElementById("latitud").value.trim();
    const longitud = document.getElementById("longitud").value.trim();

    if (!nombre_sensor || !latitud || !longitud) {
        showAlert("warning", "Nombre, latitud y longitud son obligatorios");
        return;
    }

    if (isNaN(latitud) || isNaN(longitud)) {
        showAlert("warning", "Latitud y longitud deben ser valores numéricos");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/sensores/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre_sensor,
                id_ubicacion: id_ubicacion || null,
                latitud: parseFloat(latitud),
                longitud: parseFloat(longitud)
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al agregar sensor');
        }

        const result = await response.json();
        showAlert("success", `Sensor agregado con éxito - ID: ${result.sensorId}`);
        document.getElementById("nombre_sensor").value = "";
        document.getElementById("id_ubicacion").value = "";
        document.getElementById("latitud").value = "";
        document.getElementById("longitud").value = "";
        fetchSensores();
    } catch (error) {
        console.error("Error al agregar sensor:", error);
        showAlert("error", error.message || "No se pudo agregar el sensor");
    }
}

// Renderizar tabla de sensores
function renderSensores(sensores) {
    const tabla = document.getElementById("sensores-table");
    tabla.innerHTML = "";

    if (!sensores || sensores.length === 0) {
        tabla.innerHTML = '<tr><td colspan="5" class="text-center">No se encontraron sensores</td></tr>';
        return;
    }

    // Crear encabezados
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
        <th>ID</th>
        <th>Nombre</th>
        <th>ID Ubicación</th>
        <th>Coordenadas</th>
        <th>Acciones</th>
    `;
    tabla.appendChild(headerRow);

    // Agregar filas para cada sensor
    sensores.forEach(sensor => {
        const row = document.createElement("tr");
        row.setAttribute('data-id', sensor.id);
        
        let coords = "Sin datos";
        if (sensor.ubicacion_geografica) {
            const match = sensor.ubicacion_geografica.match(/POINT\(([^)]+)\)/);
            if (match) {
                const [longitud, latitud] = match[1].split(' ');
                coords = `Lat: ${latitud}<br>Long: ${longitud}`;
            }
        }

        row.innerHTML = `
            <td>${sensor.id}</td>
            <td>${sensor.nombre_sensor}</td>
            <td>${sensor.id_ubicacion || 'N/A'}</td>
            <td>${coords}</td>
            <td class="action-buttons">
                <button onclick="showEditModal(${sensor.id})" class="btn-edit">✏️</button>
                <button onclick="showDeleteModal(${sensor.id})" class="btn-delete">🗑️</button>
            </td>
        `;
        tabla.appendChild(row);
    });
}

// Funciones auxiliares
function showAlert(type, message) {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.body.prepend(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function showModal(title, content) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>${title}</h3>
            <div>${content}</div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Cerrar sesión
async function logout() {
    try {
        await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = "../../login/login.html";
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        showAlert("error", "Error al cerrar sesión");
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    fetchSensores();
    
    // Cerrar modal al hacer clic fuera de él
    window.onclick = function(event) {
        if (event.target.className === 'modal') {
            closeModal();
        }
    };
});