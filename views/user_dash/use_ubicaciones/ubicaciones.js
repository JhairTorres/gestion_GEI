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

// Obtener todos los registros de ubicaciones
async function fetchUbicaciones() {
    if (!(await checkToken())) return;

    try {
        const response = await fetch('http://localhost:5000/api/ubicaciones/', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al obtener las ubicaciones');

        const ubicaciones = await response.json();
        renderUbicaciones(ubicaciones);
    } catch (error) {
        console.error("Error al cargar ubicaciones:", error);
    }
}

// Buscar una ubicación por ID
async function searchUbicacion() {
    if (!(await checkToken())) return;

    const id = document.getElementById("searchId").value;
    if (!id) {
        alert("Ingrese un ID válido");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/ubicaciones/${id}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error(`Ubicación con ID ${id} no encontrada`);

        const ubicacion = await response.json();
        alert(`Registro encontrado:\nID: ${ubicacion.id}\nPaís: ${ubicacion.pais}\nRegión: ${ubicacion.region}\nCiudad: ${ubicacion.ciudad}`);
    } catch (error) {
        console.error("Error al buscar ubicación:", error);
        alert("Error al buscar ubicación. Verifique el ID.");
    }
}

// Agregar una nueva ubicación
async function saveUbicacion() {
    if (!(await checkToken())) return;

    const pais = document.getElementById("pais").value;
    const region = document.getElementById("region").value;
    const ciudad = document.getElementById("ciudad").value;

    if (!pais || !region || !ciudad) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/ubicaciones/', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pais, region, ciudad })
        });

        if (!response.ok) throw new Error('Error al agregar ubicación');

        alert("Ubicación agregada con éxito");
        fetchUbicaciones();
    } catch (error) {
        console.error("Error al agregar ubicación:", error);
        alert("No se pudo agregar la ubicación");
    }
}

// Actualizar una ubicación por ID
async function updateUbicacion() {
    if (!(await checkToken())) return;

    const id = document.getElementById("updateId").value;
    const pais = document.getElementById("updatePais").value;
    const region = document.getElementById("updateRegion").value;
    const ciudad = document.getElementById("updateCiudad").value;

    if (!id || !pais || !region || !ciudad) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/ubicaciones/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pais, region, ciudad })
        });

        if (!response.ok) throw new Error('Error al actualizar ubicación');

        alert("Ubicación actualizada con éxito");
        fetchUbicaciones();
    } catch (error) {
        console.error("Error al actualizar ubicación:", error);
        alert("No se pudo actualizar la ubicación");
    }
}
// Renderizar tabla de ubicaciones
function renderUbicaciones(ubicaciones) {
    const tabla = document.getElementById("ubicaciones-table");
    tabla.innerHTML = "";

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
        await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
    window.location.href = "../../login/login.html";
}

// Cargar ubicaciones al iniciar
fetchUbicaciones();