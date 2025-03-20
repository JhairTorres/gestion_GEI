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

// Obtener todos los registros de gei
async function fetchGei() {
    if (!(await checkToken())) return;

    try {
        const response = await fetch('http://localhost:5000/api/gei/', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al obtener los GEI');

        const gei = await response.json();
        renderGei(gei);
    } catch (error) {
        console.error("Error al cargar GEI:", error);
    }
}

// Buscar un GEI por ID
async function searchGei() {
    if (!(await checkToken())) return;

    const id = document.getElementById("searchId").value;
    if (!id) {
        alert("Ingrese un ID válido");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/gei/${id}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error(`GEI con ID ${id} no encontrado`);

        const gei = await response.json();
        alert(`Registro encontrado:\nID: ${gei.id}\nNombre: ${gei.nombre}\nPotencial de Calentamiento Global: ${gei.potencial_calentamiento_global}`);
    } catch (error) {
        console.error("Error al buscar GEI:", error);
        alert("Error al buscar GEI. Verifique el ID.");
    }
}

// Agregar un nuevo GEI
async function saveGei() {
    if (!(await checkToken())) return;

    const nombre = document.getElementById("nombre").value;
    const potencial_calentamiento_global = document.getElementById("potencialCalentamientoGlobal").value;

    if (!nombre || !potencial_calentamiento_global) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/gei/', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, potencial_calentamiento_global })
        });

        if (!response.ok) throw new Error('Error al agregar GEI');

        alert("GEI agregado con éxito");
        fetchGei();
    } catch (error) {
        console.error("Error al agregar GEI:", error);
        alert("No se pudo agregar el GEI");
    }
}

// Actualizar un GEI por ID
async function updateGei() {
    if (!(await checkToken())) return;

    const id = document.getElementById("updateId").value;
    const nombre = document.getElementById("updateNombre").value;
    const potencial_calentamiento_global = document.getElementById("updatePotencialCalentamientoGlobal").value;

    if (!id || !nombre || !potencial_calentamiento_global) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/gei/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, potencial_calentamiento_global })
        });

        if (!response.ok) throw new Error('Error al actualizar GEI');

        alert("GEI actualizado con éxito");
        fetchGei();
    } catch (error) {
        console.error("Error al actualizar GEI:", error);
        alert("No se pudo actualizar el GEI");
    }
}

// Eliminar un GEI por ID
async function deleteGei() {
    if (!(await checkToken())) return;

    const id = document.getElementById("deleteId").value;
    if (!id) {
        alert("Ingrese un ID válido");
        return;
    }

    if (!confirm("¿Seguro que deseas eliminar este GEI?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/gei/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al eliminar GEI');

        alert("GEI eliminado con éxito");
        fetchGei();
    } catch (error) {
        console.error("Error al eliminar GEI:", error);
        alert("No se pudo eliminar el GEI");
    }
}

// Renderizar tabla de GEI
function renderGei(gei) {
    const tabla = document.getElementById("gei-table");
    tabla.innerHTML = "";

    gei.forEach(ge => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${ge.id}</td>
            <td>${ge.nombre}</td>
            <td>${ge.potencial_calentamiento_global}</td>
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

// Cargar GEI al iniciar
fetchGei();