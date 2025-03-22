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
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al obtener los sensores');

        const sensores = await response.json();
        renderSensores(sensores);
    } catch (error) {
        console.error("Error al cargar sensores:", error);
    }
}

// Buscar sensor por ID
async function searchSensor() {
    if (!(await checkToken())) return;

    const id = document.getElementById("searchId").value;
    if (!id) {
        alert("Ingrese un ID válido");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/sensores/${id}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error(`Sensor con ID ${id} no encontrado`);

        const sensor = await response.json();
        alert(`Sensor encontrado: \nNombre: ${sensor.nombre_sensor}\nID Ubicación: ${sensor.id_ubicacion}\nUbicación: ${sensor.ubicacion_geografica}`);
    } catch (error) {
        console.error("Error al buscar sensor:", error);
        alert("Error al buscar sensor. Verifique el ID.");
    }
}

// Agregar un nuevo sensor
async function saveSensor() {
    if (!(await checkToken())) return;

    const nombre_sensor = document.getElementById("nombre_sensor").value;
    const id_ubicacion = document.getElementById("id_ubicacion").value;
    const latitud = document.getElementById("latitud").value;
    const longitud = document.getElementById("longitud").value;

    if (!nombre_sensor || !latitud || !longitud) {
        alert("Nombre, latitud y longitud son obligatorios");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/sensores/', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre_sensor,
                id_ubicacion: id_ubicacion || null,
                latitud,
                longitud
            })
        });

        if (!response.ok) throw new Error('Error al agregar sensor');

        alert("Sensor agregado con éxito");
        fetchSensores();
    } catch (error) {
        console.error("Error al agregar sensor:", error);
        alert("No se pudo agregar el sensor");
    }
}

// Editar sensor por ID
async function editSensor() {
    if (!(await checkToken())) return;

    const id = document.getElementById("updateId").value;
    const nombre_sensor = document.getElementById("newNombreSensor").value;
    const id_ubicacion = document.getElementById("newIdUbicacion").value;
    const latitud = document.getElementById("newLatitud").value;
    const longitud = document.getElementById("newLongitud").value;

    if (!id) {
        alert("Ingrese un ID válido");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/sensores/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre_sensor,
                id_ubicacion: id_ubicacion || null,
                latitud,
                longitud
            })
        });

        if (!response.ok) throw new Error('Error al actualizar sensor');

        alert("Sensor actualizado con éxito");
        fetchSensores();
    } catch (error) {
        console.error("Error al actualizar sensor:", error);
        alert("No se pudo actualizar el sensor");
    }
}

// Eliminar sensor por ID
async function deleteSensor() {
    if (!(await checkToken())) return;

    const id = document.getElementById("deleteId").value;
    if (!id) {
        alert("Ingrese un ID válido");
        return;
    }

    if (!confirm("¿Seguro que deseas eliminar este sensor?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/sensores/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al eliminar sensor');

        alert("Sensor eliminado con éxito");
        fetchSensores();
    } catch (error) {
        console.error("Error al eliminar sensor:", error);
        alert("No se pudo eliminar el sensor");
    }
}

// Renderizar tabla de sensores
function renderSensores(sensores) {
    const tabla = document.getElementById("sensores-table");
    tabla.innerHTML = ""; // Limpiar contenido previo

    sensores.forEach(sensor => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${sensor.id}</td>
            <td>${sensor.nombre_sensor}</td>
            <td>${sensor.id_ubicacion ?? 'Sin asignar'}</td>
            <td>${sensor.ubicacion_geografica}</td>
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

// Cargar sensores al iniciar
fetchSensores();
