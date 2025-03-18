document.addEventListener('DOMContentLoaded', () => {
    fetchAuditorias(); // Cargar todas las auditorías al iniciar la página
});

// Obtener todas las auditorías
async function fetchAuditorias() {
    try {
        const response = await fetch('http://localhost:5000/api/auditoria/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error al obtener auditorías: ${response.statusText}`);
        }

        const data = await response.json();
        mostrarAuditorias(data);
    } catch (error) {
        console.error(error.message);
    }
}

// Mostrar auditorías en la tabla
function mostrarAuditorias(auditorias) {
    const tableBody = document.getElementById('auditorias-table');
    tableBody.innerHTML = '';

    auditorias.forEach(auditoria => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${auditoria.id}</td>
            <td>${auditoria.usuario_id}</td>
            <td>${auditoria.accion}</td>
            <td>${auditoria.descripcion}</td>
            <td>${new Date(auditoria.fecha).toLocaleString()}</td>
            <td>
                <button onclick="buscarAuditoria(${auditoria.id})" class="btn btn-info">Buscar</button>
                <button onclick="eliminarAuditoria(${auditoria.id})" class="btn btn-danger">Eliminar</button>
                <button onclick="cargarFormulario(${auditoria.id}, '${auditoria.usuario_id}', '${auditoria.accion}', '${auditoria.descripcion}', '${auditoria.fecha}')" class="btn btn-warning">Editar</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Buscar auditoría por ID
async function buscarAuditoria() {
    const id = document.getElementById('buscar-id').value;
    if (!id) {
        alert('Ingresa un ID para buscar.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/auditoria/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al buscar auditoría');
        }

        mostrarAuditorias([data]); // Muestra solo el resultado buscado
    } catch (error) {
        alert(error.message);
    }
}

// Eliminar auditoría por ID
async function eliminarAuditoria(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro de auditoría?')) return;

    try {
        const response = await fetch(`http://localhost:5000/api/auditoria/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al eliminar la auditoría');
        }

        alert(data.message);
        fetchAuditorias(); // Recargar la lista después de la eliminación
    } catch (error) {
        alert(error.message);
    }
}

// Cargar datos en el formulario para actualizar
function cargarFormulario(id, usuario_id, accion, descripcion, fecha) {
    document.getElementById('id-editar').value = id;
    document.getElementById('usuario-id').value = usuario_id;
    document.getElementById('accion').value = accion;
    document.getElementById('descripcion').value = descripcion;
    document.getElementById('fecha').value = fecha;
}

// Actualizar auditoría por ID
async function actualizarAuditoria() {
    const id = document.getElementById('id-editar').value;
    const usuario_id = document.getElementById('usuario-id').value;
    const accion = document.getElementById('accion').value;
    const descripcion = document.getElementById('descripcion').value;
    const fecha = document.getElementById('fecha').value;

    if (!id || !usuario_id || !accion || !descripcion || !fecha) {
        alert('Todos los campos son obligatorios.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/auditoria/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario_id, accion, descripcion, fecha })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al actualizar la auditoría');
        }

        alert(data.message);
        fetchAuditorias(); // Recargar la lista después de la actualización
    } catch (error) {
        alert(error.message);
    }
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('token');
    window.location.href = '../../login/login.html';
}
