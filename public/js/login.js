document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3000/login', { // Pastikan URL mengarah ke server yang benar
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.ok) {
            return response.text();
        } else {
            throw new Error('Invalid credentials');
        }
    })
    .then(data => {
        window.location.href = data;
    })
    .catch(error => {
        document.getElementById('error-message').textContent = error.message;
    });
});
