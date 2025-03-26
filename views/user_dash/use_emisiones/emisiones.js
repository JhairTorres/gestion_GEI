let currentUserId = null;

// Función para mostrar alertas estilizadas
function showAlert(type, message) {
    const alertContainer = document.getElementById('alertContainer');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    alertContainer.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

async function checkSession() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/session', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            currentUserId = data.userId;
            return data.authenticated;
        }
        return false;
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        return false;
    }
}

async function checkToken() {
    const isAuthenticated = await checkSession();

    if (!isAuthenticated) {
        console.warn("Sesión inválida, redirigiendo al login.");
        window.location.href = "../../login/login.html";
        return false;
    }
    return true;
}

// Obtener todas las emisiones
async function fetchEmisiones() {
    if (!(await checkToken())) return;

    try {
        const response = await fetch('http://localhost:5000/api/emisiones/', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener las emisiones');
        }

        const emisiones = await response.json();
        renderEmisiones(emisiones);
    } catch (error) {
        console.error("Error al cargar emisiones:", error);
        showAlert('error', `Error al cargar emisiones: ${error.message}`);
    }
}

// Buscar una emisión por ID
async function searchEmision() {
    if (!(await checkToken())) return;

    const id = document.getElementById("searchId").value.trim();
    if (!id) {
        showAlert('warning', "Por favor ingrese un ID válido");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/emisiones/${id}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Emisión con ID ${id} no encontrada`);
        }

        const emision = await response.json();
        displayEmisionDetails(emision);
    } catch (error) {
        console.error("Error al buscar emisión:", error);
        showAlert('error', error.message);
    }
}

// Mostrar detalles de la emisión buscada
function displayEmisionDetails(emision) {
    const resultDiv = document.getElementById('emisionResult');
    const canEdit = emision.creado_por === currentUserId;
    
    const periodoDate = new Date(emision.periodo);
    const formattedPeriodo = periodoDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    resultDiv.innerHTML = `
        <h4>Detalles de la Emisión</h4>
        <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${emision.id}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Fuente:</span>
            <span class="detail-value">${emision.fuente_nombre || emision.fuente_id}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Gas:</span>
            <span class="detail-value">${emision.gas_nombre || emision.gas_id}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Ubicación:</span>
            <span class="detail-value">${emision.ciudad || emision.ubicacion_id}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Cantidad (ton):</span>
            <span class="detail-value">${emision.cantidad_emision.toFixed(2)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Periodo:</span>
            <span class="detail-value">${formattedPeriodo}</span>
        </div>
        ${canEdit ? `
        <div class="action-buttons">
            <button class="btn-edit" onclick="loadForEdit(${emision.id})">Editar</button>
        </div>
        ` : ''}
    `;
    resultDiv.style.display = 'block';
}

// Función unificada para guardar o actualizar emisión
async function saveOrUpdateEmision() {
    if (!(await checkToken())) return;

    const id = document.getElementById("emisionId").value;
    const isEditMode = !!id;
    
    const fuente_id = document.getElementById("fuenteId").value.trim();
    const gas_id = document.getElementById("gasId").value.trim();
    const ubicacion_id = document.getElementById("ubicacionId").value.trim();
    const cantidad_emision = parseFloat(document.getElementById("cantidadEmision").value);
    const periodo = document.getElementById("periodo").value.trim();

    // Validación de campos
    if (!fuente_id || !gas_id || !ubicacion_id || isNaN(cantidad_emision) || !periodo) {
        showAlert('warning', "Todos los campos son obligatorios y deben ser válidos");
        return;
    }

    try {
        const url = isEditMode ? `http://localhost:5000/api/emisiones/${id}` : 'http://localhost:5000/api/emisiones/';
        const method = isEditMode ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                fuente_id, 
                gas_id, 
                ubicacion_id, 
                cantidad_emision, 
                periodo 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error al ${isEditMode ? 'actualizar' : 'agregar'} la emisión`);
        }

        showAlert('success', `Emisión ${isEditMode ? 'actualizada' : 'agregada'} correctamente`);
        cancelEdit();
        fetchEmisiones();
    } catch (error) {
        console.error(`Error al ${isEditMode ? 'actualizar' : 'agregar'} emisión:`, error);
        showAlert('error', error.message);
    }
}

// Renderizar tabla de emisiones
function renderEmisiones(emisiones) {
    const tabla = document.getElementById("emisiones-table");
    tabla.innerHTML = "";

    if (!emisiones || emisiones.length === 0) {
        tabla.innerHTML = '<tr><td colspan="7" class="no-data">No hay emisiones registradas</td></tr>';
        return;
    }

    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
        <th>ID</th>
        <th>Fuente</th>
        <th>Gas</th>
        <th>Ubicación</th>
        <th>Cantidad (ton)</th>
        <th>Periodo</th>
        <th>Acciones</th>
    `;
    tabla.appendChild(headerRow);

    emisiones.forEach(emision => {
        const row = document.createElement("tr");
        const canEdit = emision.creado_por === currentUserId;
        const periodoDate = new Date(emision.periodo);
        const formattedPeriodo = periodoDate.toLocaleDateString('es-ES');
        
        row.innerHTML = `
            <td>${emision.id}</td>
            <td>${emision.fuente_nombre || emision.fuente_id}</td>
            <td>${emision.gas_nombre || emision.gas_id}</td>
            <td>${emision.ciudad || emision.ubicacion_id}</td>
            <td>${emision.cantidad_emision.toFixed(2)}</td>
            <td>${formattedPeriodo}</td>
            <td class="actions">
                <button onclick="${canEdit ? `loadForEdit(${emision.id})` : ''}" 
                    class="btn-edit ${!canEdit ? 'disabled-action' : ''}" 
                    title="${canEdit ? 'Editar' : 'Solo puedes editar tus propias emisiones'}"
                    ${!canEdit ? 'disabled' : ''}>
                    ✏️
                </button>
            </td>
        `;
        tabla.appendChild(row);
    });

    updateCharts();
}

// Cargar datos para edición
async function loadForEdit(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/emisiones/${id}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al cargar emisión');
        }

        const emision = await response.json();
        
        // Verificar que el usuario es el creador
        if (emision.creado_por !== currentUserId) {
            throw new Error('Solo puedes editar las emisiones que has creado');
        }

        // Configurar formulario en modo edición
        document.getElementById("formTitle").textContent = "Editar Emisión";
        document.getElementById("submitButtonText").textContent = "Actualizar Emisión";
        document.getElementById("emisionId").value = emision.id;
        document.getElementById("fuenteId").value = emision.fuente_id;
        document.getElementById("gasId").value = emision.gas_id;
        document.getElementById("ubicacionId").value = emision.ubicacion_id;
        document.getElementById("cantidadEmision").value = emision.cantidad_emision;
        document.getElementById("periodo").value = emision.periodo.split('T')[0];
        document.getElementById("cancelButton").style.display = "inline-block";
        
        document.querySelector(".card h2").scrollIntoView();
    } catch (error) {
        console.error("Error al cargar emisión:", error);
        showAlert('error', error.message);
    }
}

// Cancelar modo edición
function cancelEdit() {
    document.getElementById("formTitle").textContent = "Agregar Nueva Emisión";
    document.getElementById("submitButtonText").textContent = "Guardar Emisión";
    document.getElementById("emisionId").value = "";
    document.getElementById("fuenteId").value = "";
    document.getElementById("gasId").value = "";
    document.getElementById("ubicacionId").value = "";
    document.getElementById("cantidadEmision").value = "";
    document.getElementById("periodo").value = new Date().toISOString().split('T')[0];
    document.getElementById("cancelButton").style.display = "none";
}

// Actualizar gráficas
function updateCharts() {
    const currentDate = new Date().toISOString().split('T')[0];
    document.getElementById('chart-gas').src = `/graficas/emisiones_por_gas.html?t=${currentDate}`;
    document.getElementById('chart-sector').src = `/graficas/emisiones_por_sector.html?t=${currentDate}`;
    document.getElementById('chart-map').src = `/graficas/mapa_emisiones.html?t=${currentDate}`;
    document.getElementById('chart-evolution').src = `/graficas/evolucion_emisiones.html?t=${currentDate}`;
}

// Cerrar sesión
async function logout() {
    try {
        await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
    window.location.href = "../../login/login.html";
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    fetchEmisiones();
    
    // Configurar fecha actual por defecto
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("periodo").value = today;
});