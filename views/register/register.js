async function register() {
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const password = document.getElementById('password').value.trim();
    const rol = document.getElementById('rol').value;
    const errorMsg = document.getElementById('register-error');
    
    errorMsg.textContent = '';
    
    if (!nombre || !correo || !password || !rol) {
        errorMsg.textContent = 'Todos los campos son obligatorios.';
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, clave: password, rol })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            errorMsg.textContent = data.message || 'Error en el registro';
            return;
        }
        
        alert('Registro exitoso. Redirigiendo al inicio de sesión.');
        window.location.href = '../login/login.html';
    } catch (error) {
        errorMsg.textContent = 'Error al conectar con el servidor.';
        console.error('Error:', error);
    }
}
