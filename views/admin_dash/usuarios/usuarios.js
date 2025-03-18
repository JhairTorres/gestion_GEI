const API_URL = 'http://localhost:5000/api/auth';
const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '../login/login.html';
}

// Función para cargar usuarios
async function loadUsuarios() {
    try {
        const response = await fetch(`${API_URL}/`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        const tableBody = document.getElementById('usuarios-table');
        tableBody.innerHTML = '';

        data.forEach(user => {
            const row = `<tr>
                <td>${user.id}</td>
                <td>${user.nombre}</td>
                <td>${user.correo}</td>
                <td>${user.rol}</td>
                <td>
                    <button onclick="editUsuario(${user.id}, '${user.nombre}', '${user.correo}', '${user.rol}')">Editar</button>
                    <button onclick="deleteUsuario(${user.id})">Eliminar</button>
                </td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

// Función para mostrar formulario de agregar usuario
function showAddForm() {
    document.getElementById('form-container').innerHTML = `
        <h3>Agregar Usuario</h3>
        <form onsubmit="addUsuario(event)">
            <input type="text" id="nombre" placeholder="Nombre" required>
            <input type="email" id="correo" placeholder="Correo" required>
            <input type="password" id="clave" placeholder="Contraseña" required>
            <select id="rol">
                <option value="Administrador">Administrador</option>
                <option value="Usuario">Usuario</option>
                <option value="Auditor">Auditor</option>
            </select>
            <button type="submit">Guardar</button>
        </form>`;
}

// Función para agregar usuario
async function addUsuario(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const clave = document.getElementById('clave').value;
    const rol = document.getElementById('rol').value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, clave, rol })
        });

        if (response.ok) {
            loadUsuarios();
        }
    } catch (error) {
        console.error('Error al agregar usuario:', error);
    }
}

// Función para mostrar formulario de edición
function editUsuario(id, nombre, correo, rol) {
    document.getElementById('form-container').innerHTML = `
        <h3>Editar Usuario</h3>
        <form onsubmit="updateUsuario(event, ${id})">
            <input type="text" id="edit-nombre" value="${nombre}" required>
            <input type="email" id="edit-correo" value="${correo}" required>
            <select id="edit-rol">
                <option value="Administrador" ${rol === 'Administrador' ? 'selected' : ''}>Administrador</option>
                <option value="Usuario" ${rol === 'Usuario' ? 'selected' : ''}>Usuario</option>
                <option value="Auditor" ${rol === 'Auditor' ? 'selected' : ''}>Auditor</option>
            </select>
            <button type="submit">Actualizar</button>
        </form>`;
}

// Función para actualizar usuario
async function updateUsuario(event, id) {
    event.preventDefault();
    
    const nombre = document.getElementById('edit-nombre').value;
    const correo = document.getElementById('edit-correo').value;
    const rol = document.getElementById('edit-rol').value;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, rol })
        });

        if (response.ok) {
            loadUsuarios();
        }
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
    }
}

// Función para eliminar usuario
async function deleteUsuario(id) {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            loadUsuarios();
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    window.location.href = "../login/login.html";
}

// Cargar usuarios al inicio
loadUsuarios();
