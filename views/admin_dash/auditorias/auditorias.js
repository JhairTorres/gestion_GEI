async function checkSession() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/session', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            return data.authenticated;
        } else {
            return false;
        }
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

// Obtener todos los registros de auditoría
async function fetchAuditorias() {
    if (!(await checkToken())) return;

    try {
        const response = await fetch('http://localhost:5000/api/auditoria/', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al obtener las auditorías');

        const auditorias = await response.json();
        renderAuditorias(auditorias);
    } catch (error) {
        console.error("Error al cargar auditorías:", error);
    }
}

// Buscar una auditoría por ID
async function searchAuditoria() {
    if (!(await checkToken())) return;

    const id = document.getElementById("searchId").value;
    if (!id) {
        alert("Ingrese un ID válido");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/auditoria/${id}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error(`Registro de auditoría con ID ${id} no encontrado`);

        const auditoria = await response.json();
        alert(`Registro encontrado:\nUsuario ID: ${auditoria.usuario_id}\nAcción: ${auditoria.accion}\nDescripción: ${auditoria.descripcion}\nFecha: ${auditoria.fecha}`);
    } catch (error) {
        console.error("Error al buscar auditoría:", error);
        alert("Error al buscar auditoría. Verifique el ID.");
    }
}

// Agregar un nuevo registro de auditoría
async function saveAuditoria() {
    if (!(await checkToken())) return;

    const usuario_id = document.getElementById("usuarioId").value;
    const accion = document.getElementById("accion").value;
    const fecha = document.getElementById("fecha").value;

    if (!usuario_id || !accion  || !fecha) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auditoria/', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id, accion, fecha })
        });

        if (!response.ok) throw new Error('Error al agregar auditoría');

        alert("Registro de auditoría agregado con éxito");
        fetchAuditorias();
    } catch (error) {
        console.error("Error al agregar auditoría:", error);
        alert("No se pudo agregar el registro de auditoría");
    }
}
// Actualizar un registro de auditoría por ID
async function updateAuditoria() {
    if (!(await checkToken())) return;

    const id = document.getElementById("updateId").value;
    const usuario_id = document.getElementById("updateUsuarioId").value;
    const accion = document.getElementById("updateAccion").value;
    const fecha = document.getElementById("updateFecha").value;

    if (!id || !usuario_id || !accion || !fecha) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/auditoria/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id, accion, fecha })
        });

        if (!response.ok) throw new Error('Error al actualizar auditoría');

        alert("Registro de auditoría actualizado con éxito");
        fetchAuditorias();
    } catch (error) {
        console.error("Error al actualizar auditoría:", error);
        alert("No se pudo actualizar el registro de auditoría");
    }
}


// Eliminar un registro de auditoría por ID
async function deleteAuditoria() {
    if (!(await checkToken())) return;

    const id = document.getElementById("deleteId").value;
    if (!id) {
        alert("Ingrese un ID válido");
        return;
    }

    if (!confirm("¿Seguro que deseas eliminar este registro de auditoría?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/auditoria/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al eliminar auditoría');

        alert("Registro de auditoría eliminado con éxito");
        fetchAuditorias();
    } catch (error) {
        console.error("Error al eliminar auditoría:", error);
        alert("No se pudo eliminar el registro de auditoría");
    }
}

// Renderizar tabla de auditorías
function renderAuditorias(auditorias) {
    const tabla = document.getElementById("auditorias-table");
    tabla.innerHTML = "";

    auditorias.forEach(auditoria => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${auditoria.id}</td>
            <td>${auditoria.usuario_id}</td>
            <td>${auditoria.accion}</td>
            <td>${auditoria.fecha}</td>
        `;
        tabla.appendChild(row);
    });
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

// Cargar auditorías al iniciar
fetchAuditorias();
