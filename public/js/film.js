document.addEventListener('DOMContentLoaded', () => {
    checkUserLogin();
    loadFilmDetails();
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
                                alert('Logout berhasil');
                                window.location.reload();
                            } else {
                                alert('Logout gagal');
                            }
                        })
                        .catch(error => {
                            console.error('Error logging out:', error);
                            alert('Terjadi kesalahan saat logout');
                        });
                };
            }
        })
        .catch(error => console.error('Error checking user login:', error));
}

function loadFilmDetails() {
    const filmId = getCookie('filmId');

    if (!filmId) {
        document.getElementById('film-details').innerHTML = '<p>Film ID not provided</p>';
        return;
    }

    fetch(`/api/film/${filmId}`)
        .then(response => response.json())
        .then(film => {
            if (film) {
                // Simpan informasi film ke dalam cookies
                setCookie('filmTitle', film.judul, 1);
                setCookie('schedule', film.jadwal[0].tanggal + ' ' + film.jadwal[0].waktu, 1);
                setCookie('ticketPrice', film.harga_tiket, 1);
                setCookie('filmId', film.id, 1);

                document.getElementById('film-details').innerHTML = `
                    <img src="asset/img/${film.poster_filename}" alt="${film.judul}">
                    <div class="details-content">
                        <h2>${film.judul}</h2>
                        <p>${film.deskripsi}</p>
                        <p><strong>Durasi:</strong> ${film.durasi} menit</p>
                        <p><strong>Rilis:</strong> ${new Date(film.rilis).toLocaleDateString('id-ID')}</p>
                        <p><strong>Harga Tiket:</strong> Rp ${film.harga_tiket.toLocaleString('id-ID')}</p>
                        <div class="schedule">
                            <h3>Jadwal:</h3>
                            ${generateScheduleHTML(film.jadwal)}
                        </div>
                        <div class="ticket-section">
                            <label for="ticket-quantity">Jumlah Tiket:</label>
                            <input type="number" id="ticket-quantity" min="1" value="1">
                            <button class="buy-ticket" onclick="redirectToSeatSelection(${film.id})">Beli Tiket</button>
                        </div>
                    </div>
                `;
            } else {
                document.getElementById('film-details').innerHTML = '<p>Film tidak ditemukan</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching film details:', error);
            document.getElementById('film-details').innerHTML = '<p>Gagal memuat detail film</p>';
        });
}

function generateScheduleHTML(schedules) {
    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
        return '<p>Jadwal tidak tersedia</p>';
    }
    return schedules.map(schedule => `<p>${new Date(schedule.tanggal).toLocaleDateString('id-ID')} ${schedule.waktu}</p>`).join('');
}

function redirectToSeatSelection(filmId) {
    const ticketQuantity = document.getElementById('ticket-quantity').value;
    if (ticketQuantity < 1) {
        alert('Jumlah tiket harus lebih dari 0');
        return;
    }
    // Simpan jumlah tiket ke dalam cookies
    setCookie('ticketQuantity', ticketQuantity, 1);
    window.location.href = `/seat.html`;
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
