
async function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('login-error');
    
    if (!email || !password) {
        errorMsg.textContent = 'Por favor, complete todos los campos.';
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: email, clave: password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            errorMsg.textContent = data.message || 'Error en la autenticación';
            return;
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('rol', data.rol);
        
        switch (data.rol) {
            case 'Administrador':
                window.location.href = '../admin_dash/admin_dashboard.html';
                break;
            case 'Usuario':
                window.location.href = '../user_dash/user_dashboard.html';
                break;
            case 'Auditor':
                window.location.href = '../auditor_dash/auditor_dashboard.html';
                break;
            default:
                errorMsg.textContent = 'Rol no reconocido'+ data.rol;
        }
    } catch (error) {
        errorMsg.textContent = 'Error.'+ error;
        console.log('Error:', error);
    }
}
