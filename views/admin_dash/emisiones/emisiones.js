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

// Obtener todas las emisiones
async function fetchEmisiones() {
    if (!(await checkToken())) return;

    try {
        const response = await fetch('http://localhost:5000/api/emisiones/', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al obtener las emisiones');

        const emisiones = await response.json();
        renderEmisiones(emisiones);
    } catch (error) {
        console.error("Error al cargar emisiones:", error);
    }
}

// Buscar una emisión por ID
async function searchEmision() {
    if (!(await checkToken())) return;

    const id = document.getElementById("searchId").value;
    if (!id) {
        alert("Ingrese un ID válido");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/emisiones/${id}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error(`Emisión con ID ${id} no encontrada`);

        const emision = await response.json();
        alert(`Registro encontrado:\nID: ${emision.id}\nFuente ID: ${emision.fuente_id}\nGas ID: ${emision.gas_id}\nUbicación ID: ${emision.ubicacion_id}\nCantidad de Emisión: ${emision.cantidad_emision}\nPeriodo: ${emision.periodo}`);
    } catch (error) {
        console.error("Error al buscar emisión:", error);
        alert("Error al buscar emisión. Verifique el ID.");
    }
}

// Agregar una nueva emisión
async function saveEmision() {
    if (!(await checkToken())) return;

    const fuente_id = document.getElementById("fuenteId").value;
    const gas_id = document.getElementById("gasId").value;
    const ubicacion_id = document.getElementById("ubicacionId").value;
    const cantidad_emision = document.getElementById("cantidadEmision").value;
    const periodo = document.getElementById("periodo").value;

    if (!fuente_id || !gas_id || !ubicacion_id || !cantidad_emision || !periodo) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/emisiones/', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fuente_id, gas_id, ubicacion_id, cantidad_emision, periodo })
        });

        if (!response.ok) throw new Error('Error al agregar la emisión');

        alert("Emisión agregada con éxito");
        fetchEmisiones();
    } catch (error) {
        console.error("Error al agregar emisión:", error);
        alert("No se pudo agregar la emisión");
    }
}

// Actualizar una emisión por ID
async function updateEmision() {
    if (!(await checkToken())) return;

    const id = document.getElementById("updateId").value;
    const fuente_id = document.getElementById("updateFuenteId").value;
    const gas_id = document.getElementById("updateGasId").value;
    const ubicacion_id = document.getElementById("updateUbicacionId").value;
    const cantidad_emision = document.getElementById("updateCantidadEmision").value;
    const periodo = document.getElementById("updatePeriodo").value;

    if (!id || !fuente_id || !gas_id || !ubicacion_id || !cantidad_emision || !periodo) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/emisiones/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fuente_id, gas_id, ubicacion_id, cantidad_emision, periodo })
        });

        if (!response.ok) throw new Error('Error al actualizar la emisión');

        alert("Emisión actualizada con éxito");
        fetchEmisiones();
    } catch (error) {
        console.error("Error al actualizar emisión:", error);
        alert("No se pudo actualizar la emisión");
    }
}

// Eliminar una emisión por ID
async function deleteEmision() {
    if (!(await checkToken())) return;

    const id = document.getElementById("deleteId").value;
    if (!id) {
        alert("Ingrese un ID válido");
        return;
    }

    if (!confirm("¿Seguro que deseas eliminar esta emisión?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/emisiones/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al eliminar emisión');

        alert("Emisión eliminada con éxito");
        fetchEmisiones();
    } catch (error) {
        console.error("Error al eliminar emisión:", error);
        alert("No se pudo eliminar la emisión");
    }
}

// Renderizar tabla de emisiones
function renderEmisiones(emisiones) {
    const tabla = document.getElementById("emisiones-table");
    tabla.innerHTML = "";

    emisiones.forEach(emision => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${emision.id}</td>
            <td>${emision.fuente_id}</td>
            <td>${emision.gas_id}</td>
            <td>${emision.ubicacion_id}</td>
            <td>${emision.cantidad_emision}</td>
            <td>${emision.periodo}</td>
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

// Cargar emisiones al iniciar
fetchEmisiones();