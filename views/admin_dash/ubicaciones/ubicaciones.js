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
        showError('Error de conexión con el servidor');
        return false;
    }
}

async function checkToken() {
    const isAuthenticated = await checkSession();

    if (!isAuthenticated) {
        showError('Sesión inválida o expirada. Redirigiendo...');
        setTimeout(() => window.location.href = "../../login/login.html", 2000);
        return false;
    }
    return true;
}

// Mostrar notificación de error
function showError(message, duration = 5000) {
    const errorDiv = document.getElementById('error-notification') || createNotificationElement('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, duration);
}

// Mostrar notificación de éxito
function showSuccess(message, duration = 3000) {
    const successDiv = document.getElementById('success-notification') || createNotificationElement('success');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, duration);
}

// Crear elemento de notificación
function createNotificationElement(type) {
    const div = document.createElement('div');
    div.id = `${type}-notification`;
    div.className = `notification ${type}`;
    document.body.appendChild(div);
    return div;
}

// Obtener todos los registros de ubicaciones
async function fetchUbicaciones() {
    if (!(await checkToken())) return;

    try {
        showLoading(true);
        const response = await fetch('http://localhost:5000/api/ubicaciones/', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al obtener ubicaciones');
        }

        const ubicaciones = await response.json();
        renderUbicaciones(ubicaciones);
    } catch (error) {
        console.error("Error al cargar ubicaciones:", error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Buscar una ubicación por ID
async function searchUbicacion() {
    if (!(await checkToken())) return;

    const id = document.getElementById("searchId").value.trim();
    if (!id) {
        showError("Por favor ingrese un ID válido");
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`http://localhost:5000/api/ubicaciones/${id}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Ubicación con ID ${id} no encontrada`);
        }

        const ubicacion = await response.json();
        showSuccess(`Ubicación encontrada: ${ubicacion.pais}, ${ubicacion.region}, ${ubicacion.ciudad}`);
        
        // Resaltar en la tabla
        highlightRow(id);
    } catch (error) {
        console.error("Error al buscar ubicación:", error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Resaltar fila en la tabla
function highlightRow(id) {
    const rows = document.querySelectorAll("#ubicaciones-table tr");
    rows.forEach(row => {
        row.style.backgroundColor = '';
        if (row.cells[0].textContent === id) {
            row.style.backgroundColor = '#ffeb3b';
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

// Agregar una nueva ubicación
async function saveUbicacion() {
    if (!(await checkToken())) return;

    const pais = document.getElementById("pais").value.trim();
    const region = document.getElementById("region").value.trim();
    const ciudad = document.getElementById("ciudad").value.trim();

    if (!pais || !region || !ciudad) {
        showError("Todos los campos son obligatorios");
        return;
    }

    try {
        showLoading(true);
        const response = await fetch('http://localhost:5000/api/ubicaciones/', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pais, region, ciudad })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al agregar ubicación');
        }

        const result = await response.json();
        showSuccess(`Ubicación agregada con éxito (ID: ${result.id})`);
        
        // Limpiar formulario y actualizar tabla
        document.getElementById("pais").value = '';
        document.getElementById("region").value = '';
        document.getElementById("ciudad").value = '';
        
        fetchUbicaciones();
    } catch (error) {
        console.error("Error al agregar ubicación:", error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Actualizar una ubicación por ID
async function updateUbicacion() {
    if (!(await checkToken())) return;

    const id = document.getElementById("updateId").value.trim();
    const pais = document.getElementById("updatePais").value.trim();
    const region = document.getElementById("updateRegion").value.trim();
    const ciudad = document.getElementById("updateCiudad").value.trim();

    if (!id || !pais || !region || !ciudad) {
        showError("Todos los campos son obligatorios");
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`http://localhost:5000/api/ubicaciones/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pais, region, ciudad })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al actualizar ubicación');
        }

        showSuccess("Ubicación actualizada con éxito");
        
        // Limpiar formulario y actualizar tabla
        document.getElementById("updateId").value = '';
        document.getElementById("updatePais").value = '';
        document.getElementById("updateRegion").value = '';
        document.getElementById("updateCiudad").value = '';
        
        fetchUbicaciones();
    } catch (error) {
        console.error("Error al actualizar ubicación:", error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Eliminar una ubicación por ID
async function deleteUbicacion() {
    if (!(await checkToken())) return;

    const id = document.getElementById("deleteId").value.trim();
    if (!id) {
        showError("Por favor ingrese un ID válido");
        return;
    }

    try {
        // Confirmación personalizada
        const confirmed = await showConfirmation(
            `¿Está seguro que desea eliminar la ubicación con ID ${id}?`,
            'Esta acción no se puede deshacer'
        );
        
        if (!confirmed) return;

        showLoading(true);
        const response = await fetch(`http://localhost:5000/api/ubicaciones/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al eliminar ubicación');
        }

        showSuccess("Ubicación eliminada con éxito");
        
        // Limpiar campo y actualizar tabla
        document.getElementById("deleteId").value = '';
        fetchUbicaciones();
    } catch (error) {
        console.error("Error al eliminar ubicación:", error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Mostrar diálogo de confirmación personalizado
function showConfirmation(title, message) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'confirmation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="modal-buttons">
                    <button id="confirm-yes">Sí, eliminar</button>
                    <button id="confirm-no">Cancelar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('confirm-yes').addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(true);
        });
        
        document.getElementById('confirm-no').addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(false);
        });
    });
}

// Mostrar/ocultar indicador de carga
function showLoading(show) {
    const loadingDiv = document.getElementById('loading-indicator') || createLoadingIndicator();
    loadingDiv.style.display = show ? 'flex' : 'none';
}

// Crear indicador de carga
function createLoadingIndicator() {
    const div = document.createElement('div');
    div.id = 'loading-indicator';
    div.innerHTML = '<div class="spinner"></div><p>Cargando...</p>';
    document.body.appendChild(div);
    return div;
}

// Renderizar tabla de ubicaciones
function renderUbicaciones(ubicaciones) {
    const tabla = document.getElementById("ubicaciones-table");
    tabla.innerHTML = "";

    if (ubicaciones.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="4" class="no-data">No se encontraron ubicaciones</td>`;
        tabla.appendChild(row);
        return;
    }

    ubicaciones.forEach(ubicacion => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${ubicacion.id}</td>
            <td>${ubicacion.pais}</td>
            <td>${ubicacion.region}</td>
            <td>${ubicacion.ciudad}</td>
        `;
        tabla.appendChild(row);
    });
}

// Cerrar sesión
async function logout() {
    try {
        showLoading(true);
        await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = "../../login/login.html";
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        showError("Error al cerrar sesión");
    } finally {
        showLoading(false);
    }
}

// Cargar ubicaciones al iniciar
document.addEventListener('DOMContentLoaded', () => {
    fetchUbicaciones();
});