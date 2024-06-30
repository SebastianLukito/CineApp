document.addEventListener('DOMContentLoaded', () => {
    checkUserLogin();
    generateSeatingChart();

    const ticketQuantity = parseInt(getCookie('ticketQuantity'), 10);

    document.getElementById('confirm-button').addEventListener('click', () => {
        const selectedSeats = Array.from(document.querySelectorAll('.seat.selected')).map(seat => seat.dataset.seat);
        if (selectedSeats.length === ticketQuantity) {
            const filmTitle = getCookie('filmTitle');
            const schedule = getCookie('schedule');
            const seatNumbers = selectedSeats.join(', ');

            setCookie('selectedSeats', seatNumbers, 1);
            window.location.href = `bayar.html`;
        } else {
            alert(`Silakan pilih ${ticketQuantity} kursi.`);
        }
    });
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

function generateSeatingChart() {
    const ticketQuantity = parseInt(getCookie('ticketQuantity'), 10); // Ensure ticketQuantity is accessible here

    const seatingChartContainer = document.createElement('div');
    seatingChartContainer.classList.add('seating-chart-container');

    const seatingChart = document.createElement('div');
    seatingChart.classList.add('seating-chart');

    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerSection = 11; // Menetapkan jumlah kursi per section
    const sections = 3; // Menetapkan jumlah section

    rows.forEach((row) => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');

        const rowLabel = document.createElement('div');
        rowLabel.textContent = row;
        rowLabel.classList.add('row-label');
        rowDiv.appendChild(rowLabel);

        for (let section = 0; section < sections; section++) {
            const sectionDiv = document.createElement('div');
            sectionDiv.classList.add('section');

            for (let i = 1; i <= seatsPerSection; i++) {
                const seatDiv = document.createElement('div');
                seatDiv.classList.add('seat');
                seatDiv.textContent = i + section * seatsPerSection;
                seatDiv.dataset.seat = `${row}${i + section * seatsPerSection}`;
                seatDiv.dataset.row = row;
                seatDiv.dataset.index = i + section * seatsPerSection;
                sectionDiv.appendChild(seatDiv);
            }

            rowDiv.appendChild(sectionDiv);
        }

        seatingChart.appendChild(rowDiv);
    });

    seatingChartContainer.appendChild(seatingChart);

    document.querySelector('main').insertBefore(seatingChartContainer, document.getElementById('confirm-button'));

    document.querySelectorAll('.seat').forEach(seat => {
        seat.addEventListener('click', () => handleSeatSelection(seat, ticketQuantity));
    });
}

function handleSeatSelection(selectedSeat, ticketQuantity) {
    const selectedSeats = document.querySelectorAll('.seat.selected');
    if (selectedSeats.length < ticketQuantity || selectedSeat.classList.contains('selected')) {
        selectedSeat.classList.toggle('selected');
    } else {
        alert(`Anda hanya bisa memilih ${ticketQuantity} kursi.`);
    }

    if (document.querySelectorAll('.seat.selected').length === ticketQuantity) {
        const selected = Array.from(document.querySelectorAll('.seat.selected')).map(seat => parseInt(seat.dataset.index, 10));
        selected.sort((a, b) => a - b);
        const isConsecutive = selected.every((num, i, arr) => !i || num === arr[i - 1] + 1);
        if (!isConsecutive) {
            selectedSeat.classList.remove('selected');
            alert('Kursi harus bersebelahan.');
        }
    }
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
