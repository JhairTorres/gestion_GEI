document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "http://localhost:5000/api/auditoria";
    const token =localStorage.getItem("token");
    if (!token) {
        alert("No tienes permiso para acceder a esta página.");
        window.location.href = "../../login/login.html";
        return;
    }
    console.log("Token encontrado:", token);

    const tableBody = document.getElementById("auditorias-table");
    const searchResult = document.getElementById("resultadoBusqueda");
    const errorMsg = document.createElement("p");
    document.body.appendChild(errorMsg);

    let data = null

    async function fetchAuditoria() {
        try {
            const response = await fetch(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Error al obtener registros");

            const data = await response.json();
            tableBody.innerHTML = "";
            data.forEach(item => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${item.id}</td>
                    <td>${item.usuario_id}</td>
                    <td>${item.accion}</td>
                    <td>${new Date(item.fecha).toLocaleString()}</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            errorMsg.textContent = error.message;
        }
    }

    window.searchById = async function () {
        let data = null
        const id = document.getElementById("buscarId").value.trim();
        const resultadoBusqueda = document.getElementById("resultadoBusqueda");
    
        if (!id) {
            resultadoBusqueda.textContent = "Ingrese un ID válido.";
            return;
        }
    
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token",data.token)}`,
                    "Content-Type": "application/json"
                }
            });
    
            if (!response.ok) {
                throw new Error("Error al obtener los datos");
            }
    
            const data = await response.json(); // Asegurar que data se define correctamente
    
            resultadoBusqueda.textContent = `Resultado: ${JSON.stringify(data)}`;
        } catch (error) {
            resultadoBusqueda.textContent = "No se pudo obtener la auditoría.";
            console.error("Error:", error);
        }
    };
    
    
    window.saveAuditoria = async function () {
        const usuario_id = document.getElementById("usuarioId").value.trim();
        const accion = document.getElementById("accion").value.trim();
        const fecha = document.getElementById("fecha").value.trim();
        const errorMsg = document.getElementById("errorMsg"); // Asegúrate de que exista este elemento
    
        if (!usuario_id || !accion || !fecha) {
            errorMsg.textContent = "Todos los campos son obligatorios.";
            return;
        }
    
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ usuario_id, accion, fecha })
            });
    
            if (!response.ok) throw new Error("Error al agregar registro");
    
            alert("Registro agregado correctamente");
            window.fetchAuditoria();
        } catch (error) {
            errorMsg.textContent = error.message;
        }
    };
    
    window.editAuditoria = async function () {
        const id = document.getElementById("updateId").value.trim();
        const accion = document.getElementById("nuevaAccion").value.trim();
        const fecha = document.getElementById("fecha").value.trim();
        const errorMsg = document.getElementById("errorMsg");
    
        if (!id || !accion || !fecha) {
            errorMsg.textContent = "Todos los campos son obligatorios.";
            return;
        }
    
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ accion, fecha })
            });
    
            if (!response.ok) throw new Error("Error al actualizar registro");
    
            alert("Registro actualizado correctamente");
            window.fetchAuditoria();
        } catch (error) {
            errorMsg.textContent = error.message;
        }
    };
    
    window.deleteAuditoria = async function () {
        const id = document.getElementById("deleteId").value.trim();
        if (!id) {
            alert("Ingrese un ID válido.");
            return;
        }
    
        if (!confirm("¿Seguro que quieres eliminar este registro?")) return;
    
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (!response.ok) throw new Error("Error al eliminar registro");
    
            alert("Registro eliminado correctamente");
            window.fetchAuditoria();
        } catch (error) {
            errorMsg.textContent = error.message;
        }
    };
    

fetchAuditoria();
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('rol');
    alert('Tu sesión ha expirado. Serás redirigido al login.');
    window.location.href = '../../login/login.html';
}
