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

async function loadSection(section) {
    if (!(await checkToken())) return;

    const pageMap = {
        'auth': 'usuarios/usuarios.html',
        'auditoria': 'auditorias/auditorias.html',
        'emisiones': 'emisiones/emisiones.html',
        'fuentes': 'fuentes/fuentes.html',
        'gei': 'tiposGas/tiposGas.html',
        'ubicaciones': 'ubicaciones/ubicaciones.html'
    };

    if (pageMap[section]) {
        window.location.href = pageMap[section];
    } else {
        console.error("Sección no válida:", section);
    }
}

async function logout() {
    try {
        await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            credentials: 'include' // Asegura que las cookies se envíen
        });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }

    window.location.href = "../login/login.html";
}


