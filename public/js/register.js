document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('registerForm').reset();
    console.log("Clearing input fields on register page load");
});

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const first_name = document.getElementById('first_name').value;
    const last_name = document.getElementById('last_name').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const type = 'user'; // Set default type as 'user'

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ first_name, last_name, email, username, password, type })
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/login';
        } else {
            throw new Error('Registration failed');
        }
    })
    .catch(error => {
        document.getElementById('error-message').textContent = error.message;
    });
});
