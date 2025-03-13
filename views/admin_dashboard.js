async function checkToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        logout();
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.newToken); // Guardar nuevo token
        } else {
            logout();
        }
    } catch (error) {
        console.error('Error al renovar el token:', error);
        logout();
    }
}

async function loadSection(section) {
    await checkToken();
    
    const container = document.getElementById('data-container');
    container.innerHTML = '<p>Cargando datos...</p>';

    try {
        const response = await fetch(`http://localhost:5000/api/${section}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }
        });

        if (response.status === 401) {
            alert('Sesión expirada. Inicia sesión nuevamente.');
            logout();
            return;
        }

        const data = await response.json();
        renderTable(section, data);
    } catch (error) {
        container.innerHTML = '<p>Error al conectar con el servidor.</p>';
        console.error('Error:', error);
    }
}

function renderTable(section, data) {
    const container = document.getElementById('data-container');
    container.innerHTML = '';
    
    if (data.length === 0) {
        container.innerHTML = '<p>No hay datos disponibles.</p>';
        return;
    }
    
    let table = `<table border="1">
                    <thead>
                        <tr>
                            ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => `
                            <tr>
                                ${Object.values(item).map(value => `<td>${value}</td>`).join('')}
                                <td>
                                    <button onclick="editItem('${section}', ${item.id})">Editar</button>
                                    <button onclick="deleteItem('${section}', ${item.id})">Eliminar</button>
                                </td>
                            </tr>`).join('')}
                    </tbody>
                </table>
                <button onclick="showAddForm('${section}')">Agregar Nuevo</button>
                <div id="form-container"></div>`;
    
    container.innerHTML = table;
}

function showAddForm(section) {
    document.getElementById('form-container').innerHTML = `
        <h3>Agregar Nuevo Registro</h3>
        <form onsubmit="addItem(event, '${section}')">
            <input type="text" id="new-data" placeholder="Ingrese datos" required>
            <button type="submit">Guardar</button>
        </form>`;
}

async function addItem(event, section) {
    event.preventDefault();
    const value = document.getElementById('new-data').value;
    
    try {
        const response = await fetch(`http://localhost:5000/api/${section}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: value })
        });
        
        if (response.ok) loadSection(section);
    } catch (error) {
        console.error('Error al agregar:', error);
    }
}

async function editItem(section, id) {
    const newValue = prompt('Ingrese el nuevo valor:');
    if (!newValue) return;
    
    try {
        await fetch(`http://localhost:5000/api/${section}/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newValue })
        });
        
        loadSection(section);
    } catch (error) {
        console.error('Error al editar:', error);
    }
}

async function deleteItem(section, id) {
    if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
    
    try {
        await fetch(`http://localhost:5000/api/${section}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        loadSection(section);
    } catch (error) {
        console.error('Error al eliminar:', error);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    window.location.href = 'index.html';
}