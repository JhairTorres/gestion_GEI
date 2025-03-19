async function checkSession() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/session', {
            method: 'GET',
            credentials: 'include' // Permite enviar cookies en la petición
        });

        if (response.ok) {
            const data = await response.json();
            return data.authenticated; // true si el usuario está autenticado, false si no
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

async function fetchUsuarios() {
    if (!(await checkToken())) return;

    try {
        const response = await fetch('http://localhost:5000/api/auth/', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al obtener los usuarios');

        const usuarios = await response.json();
        renderUsuarios(usuarios);
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
    }
}

function renderUsuarios(usuarios) {
    const tabla = document.getElementById("usuarios-table");
    tabla.innerHTML = ""; // Limpiar contenido previo

    usuarios.forEach(usuario => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.correo}</td>
            <td>${usuario.rol}</td>
            <td>
                <button onclick="editarUsuario(${usuario.id})">Editar</button>
                <button onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
            </td>
        `;
        tabla.appendChild(row);
    });
}

async function agregarUsuario(datos) {
    if (!(await checkToken())) return;

    try {
        const response = await fetch('http://localhost:5000/api/auth/', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (!response.ok) throw new Error('Error al agregar usuario');
        
        fetchUsuarios(); // Recargar lista de usuarios
    } catch (error) {
        console.error("Error al agregar usuario:", error);
    }
}

async function editarUsuario(id) {
    if (!(await checkToken())) return;

    const nuevoRol = prompt("Ingrese el nuevo rol:");
    if (!nuevoRol) return;

    try {
        const response = await fetch(`http://localhost:5000/api/auth/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rol: nuevoRol })
        });

        if (!response.ok) throw new Error('Error al actualizar usuario');

        fetchUsuarios(); // Recargar lista
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
    }
}

async function eliminarUsuario(id) {
    if (!(await checkToken())) return;

    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/auth/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al eliminar usuario');

        fetchUsuarios(); // Recargar lista
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
    }
}

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

// Cargar usuarios al iniciar
fetchUsuarios();

