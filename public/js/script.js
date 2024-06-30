document.addEventListener('DOMContentLoaded', () => {
    checkUserLogin();
    loadMovies();
});

function checkUserLogin() {
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            if (data && data.username) {
                const loginButton = document.getElementById('login-button');
                loginButton.textContent = data.username;
                loginButton.onclick = () => {
                    fetch('/api/logout', { method: 'POST' })
                        .then(response => {
                            if (response.ok) {
                                window.location.reload();
                            }
                        })
                        .catch(error => console.error('Error logging out:', error));
                };
            }
        })
        .catch(error => console.error('Error checking user login:', error));
}

function loadMovies() {
    const movieList = document.getElementById('movie-list');
    movieList.innerHTML = '<p>Loading movies...</p>';

    fetch('/api/film')
        .then(response => response.json())
        .then(data => {
            if (data && Array.isArray(data) && data.length > 0) {
                movieList.innerHTML = ''; // Clear loading message
                data.forEach(movie => {
                    const movieCard = document.createElement('div');
                    movieCard.classList.add('movie-card');

                    // Check if the movie object has the required properties
                    const posterFilename = movie.poster_filename || 'default.jpg';
                    const title = movie.judul || 'No Title';
                    const description = movie.deskripsi || 'No Description';
                    const schedule = movie.jadwal ? generateScheduleHTML(movie.jadwal) : '<p>No schedule available</p>';

                    movieCard.innerHTML = `
                        <img src="asset/img/${posterFilename}" alt="${title}">
                        <h2>${title}</h2>
                        <p>${description}</p>
                        <div class="schedule">
                            <h3>Jadwal:</h3>
                            ${schedule}
                        </div>
                        <button onclick="viewMovieDetails(${movie.id}, '${title}', '${schedule}')">Beli Tiket</button>
                    `;
                    movieList.appendChild(movieCard);
                });
            } else {
                movieList.innerHTML = '<p>No movies found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
            movieList.innerHTML = '<p>Failed to load movies.</p>';
        });
}

function generateScheduleHTML(schedules) {
    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
        return '<p>No schedule available</p>';
    }
    return schedules.map(schedule => `<p>${schedule.tanggal} ${schedule.waktu}</p>`).join('');
}

function viewMovieDetails(movieId, movieTitle, schedule) {
    setCookie('filmId', movieId, 1);
    setCookie('filmTitle', movieTitle, 1);
    setCookie('schedule', schedule, 1);
    window.location.href = `/film.html`;
}

// Set a cookie
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

// Get a cookie
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

// Erase a cookie
function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}
