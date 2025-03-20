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

// Obtener todos los usuarios
async function fetchUsuarios() {
    if (!(await checkToken())) return;

    try {
        const response = await fetch('http://localhost:5000/api/usuarios/', {
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

// Buscar usuario por ID
async function searchUsuario() {
    if (!(await checkToken())) return;

    const id = document.getElementById("searchId").value;
    if (!id) {
        alert("Ingrese un ID válido");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/usuarios/${id}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error(`Usuario con ID ${id} no encontrado`);

        const usuario = await response.json();
        alert(`Usuario encontrado: \nNombre: ${usuario.nombre}\nCorreo: ${usuario.correo}\nRol: ${usuario.rol}`);
    } catch (error) {
        console.error("Error al buscar usuario:", error);
        alert("Error al buscar usuario. Verifique el ID.");
    }
}

// Agregar un nuevo usuario
async function saveUsuario() {
    if (!(await checkToken())) return;

    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const password = document.getElementById("password").value;
    const rol = document.getElementById("rol").value;

    if (!nombre || !correo || !password || !rol) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/usuarios/', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, clave: password, rol })
        });

        if (!response.ok) throw new Error('Error al agregar usuario');

        alert("Usuario agregado con éxito");
        fetchUsuarios();
    } catch (error) {
        console.error("Error al agregar usuario:", error);
        alert("No se pudo agregar el usuario");
    }
}

// Editar usuario por ID
async function editUsuario() {
    if (!(await checkToken())) return;

    const id = document.getElementById("updateId").value;
    const nombre = document.getElementById("newNombre").value;
    const correo = document.getElementById("newCorreo").value;
    const clave = document.getElementById("newClave").value;
    const rol = document.getElementById("newRol").value;

    if (!id) {
        alert("Ingrese un ID válido");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/usuarios/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, clave, rol })
        });

        if (!response.ok) throw new Error('Error al actualizar usuario');

        alert("Usuario actualizado con éxito");
        fetchUsuarios();
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        alert("No se pudo actualizar el usuario");
    }
}

// Eliminar usuario por ID
async function deleteUsuario() {
    if (!(await checkToken())) return;

    const id = document.getElementById("deleteId").value;
    if (!id) {
        alert("Ingrese un ID válido");
        return;
    }

    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/usuarios/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Error al eliminar usuario');

        alert("Usuario eliminado con éxito");
        fetchUsuarios();
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alert("No se pudo eliminar el usuario");
    }
}

// Renderizar tabla de usuarios
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

// Cargar usuarios al iniciar
fetchUsuarios();
