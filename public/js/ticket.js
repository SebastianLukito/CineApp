document.addEventListener('DOMContentLoaded', () => {
    loadTicketDetails();
    document.getElementById('download-button').addEventListener('click', downloadTicket);
});

function loadTicketDetails() {
    const filmTitle = getCookie('filmTitle');
    const schedule = getCookie('schedule');
    const seatNumbers = getCookie('selectedSeats');
    const ticketPrice = getCookie('ticketPrice');
    const ticketQuantity = getCookie('ticketQuantity');

    if (filmTitle && schedule && seatNumbers && ticketPrice && ticketQuantity) {
        const totalPrice = parseInt(ticketPrice) * parseInt(ticketQuantity);
        document.getElementById('film-title').textContent = filmTitle;
        document.getElementById('schedule').textContent = schedule;
        document.getElementById('seat-numbers').textContent = seatNumbers;
        document.getElementById('ticket-price').textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
    } else {
        alert('Detail tiket tidak lengkap.');
    }
}

function downloadTicket() {
    const ticketElement = document.getElementById('ticket');
    html2canvas(ticketElement).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'ticket.png';
        link.click();
    }).catch(error => {
        console.error('Error generating ticket image:', error);
        alert('Gagal mengunduh tiket. Silakan coba lagi.');
    });
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
