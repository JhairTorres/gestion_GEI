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

// Obtener todos los registros de fuentes
async function fetchFuentes() {
    if (!(await checkToken())) return;

    try {
        const response = await fetch('http://localhost:5000/api/fuentes/', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al obtener las fuentes');

        const fuentes = await response.json();
        renderFuentes(fuentes);
    } catch (error) {
        console.error("Error al cargar fuentes:", error);
    }
}

// Buscar una fuente por ID
async function searchFuente() {
    if (!(await checkToken())) return;

    const id = document.getElementById("searchId").value;
    if (!id) {
        alert("Ingrese un ID válido");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/fuentes/${id}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error(`Fuente con ID ${id} no encontrada`);

        const fuente = await response.json();
        alert(`Registro encontrado:\nID: ${fuente.id}\nNombre: ${fuente.nombre}\nSector: ${fuente.sector}`);
    } catch (error) {
        console.error("Error al buscar fuente:", error);
        alert("Error al buscar fuente. Verifique el ID.");
    }
}

// Agregar una nueva fuente
async function saveFuente() {
    if (!(await checkToken())) return;

    const nombre = document.getElementById("nombre").value;
    const sector = document.getElementById("sector").value;

    if (!nombre || !sector) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/fuentes/', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, sector })
        });

        if (!response.ok) throw new Error('Error al agregar fuente');

        alert("Fuente agregada con éxito");
        fetchFuentes();
    } catch (error) {
        console.error("Error al agregar fuente:", error);
        alert("No se pudo agregar la fuente");
    }
}

// Actualizar una fuente por ID
async function updateFuente() {
    if (!(await checkToken())) return;

    const id = document.getElementById("updateId").value;
    const nombre = document.getElementById("updateNombre").value;
    const sector = document.getElementById("updateSector").value;

    if (!id || !nombre || !sector) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/fuentes/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, sector })
        });

        if (!response.ok) throw new Error('Error al actualizar fuente');

        alert("Fuente actualizada con éxito");
        fetchFuentes();
    } catch (error) {
        console.error("Error al actualizar fuente:", error);
        alert("No se pudo actualizar la fuente");
    }
}

// Eliminar una fuente por ID
async function deleteFuente() {
    if (!(await checkToken())) return;

    const id = document.getElementById("deleteId").value;
    if (!id) {
        alert("Ingrese un ID válido");
        return;
    }

    if (!confirm("¿Seguro que deseas eliminar esta fuente?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/fuentes/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al eliminar fuente');

        alert("Fuente eliminada con éxito");
        fetchFuentes();
    } catch (error) {
        console.error("Error al eliminar fuente:", error);
        alert("No se pudo eliminar la fuente");
    }
}

// Renderizar tabla de fuentes
function renderFuentes(fuentes) {
    const tabla = document.getElementById("fuentes-table");
    tabla.innerHTML = "";

    fuentes.forEach(fuente => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${fuente.id}</td>
            <td>${fuente.nombre}</td>
            <td>${fuente.sector}</td>
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

// Cargar fuentes al iniciar
fetchFuentes();