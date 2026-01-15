document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if(result.success) {
            // Redirect to admin dashboard after successful login
            localStorage.setItem('adminToken', result.token);
            window.location.href = 'dashboard.html';
        } else {
            document.getElementById('errorMessage').innerText = result.message;
        }
    } catch(error) {
        document.getElementById('errorMessage').innerText = 'Terjadi kesalahan saat login. Silakan coba lagi.';
        console.error('Login error:', error);
    }
});