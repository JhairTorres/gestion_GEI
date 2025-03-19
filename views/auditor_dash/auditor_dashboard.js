async function checkToken() {
    const token = localStorage.getItem('token');

    if (!token) {
        console.warn("No hay token en localStorage, redirigiendo al login.");
        window.location.href = "../../login/login.html";
        return false;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.newToken);
            return true;
        } else {
            console.warn("Error en la renovación del token:", data);
            window.location.href = "../../login/login.html";
            return false;
        }
    } catch (error) {
        console.error('Error al renovar el token:', error);
        window.location.href = "../../login/login.html";
        return false;
    }
}

async function loadSection(section) {
    const valid = await checkToken();
    if (!valid) logout();

    const pageMap = {
        'auditoria': 'auditor/auditor.html'
    };

    if (pageMap[section]) {
        window.location.href = pageMap[section];
    } else {
        console.error("Sección no válida:", section);
    }
}
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    window.location.href = "../login/login.html";
}
