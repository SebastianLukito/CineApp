document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('table-select').addEventListener('change', loadTable);
    document.querySelector('button').addEventListener('click', loadTable);
    getCurrentUser();
});

function getCurrentUser() {
    fetch('/api/user')
        .then(response => response.json())
        .then(user => {
            document.getElementById('admin-name').textContent = `Admin: ${user.username}`;
        })
        .catch(error => console.error('Error fetching current user:', error));
}

function loadTable() {
    const tableSelect = document.getElementById('table-select');
    const tableName = tableSelect.value;
    const tableContainer = document.getElementById('table-container');

    fetch(`/api/${tableName}`)
        .then(response => response.json())
        .then(data => {
            tableContainer.innerHTML = generateTableHTML(data, tableName);
            document.getElementById('new-entry-container').style.display = 'block';
        })
        .catch(error => console.error('Error fetching table data:', error));
}

function generateTableHTML(data, tableName) {
    if (data.length === 0) {
        return '<p>No data available</p>';
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = Object.keys(data[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    headerRow.appendChild(document.createElement('th')); // Add empty header for actions
    thead.appendChild(headerRow);

    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header];
            tr.appendChild(td);
        });
        const actionTd = document.createElement('td');
        actionTd.innerHTML = `
            <button onclick="editRow(${row.id}, '${tableName}', '${headers.join(',')}')">Edit</button>
            <button onclick="deleteRow(${row.id}, '${tableName}')">Delete</button>
        `;
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    return table.outerHTML;
}

function editRow(id, tableName, headers) {
    const row = document.querySelector(`button[onclick="editRow(${id}, '${tableName}', '${headers}')"]`).parentNode.parentNode;
    const values = headers.split(',').map(header => row.querySelector(`td:nth-child(${headers.split(',').indexOf(header) + 1})`).textContent);

    const form = document.createElement('form');
    form.classList.add('edit-form');

    headers.split(',').forEach((header, index) => {
        const fieldWrapper = document.createElement('div');
        fieldWrapper.classList.add('field-wrapper');

        const label = document.createElement('label');
        label.textContent = header;
        label.htmlFor = header;

        const input = document.createElement('input');
        if (header === 'tanggal') {
            input.type = 'date';
        } else if (header === 'waktu') {
            input.type = 'time';
        } else {
            input.type = 'text';
        }
        input.name = header;
        input.id = header;
        input.value = values[index];

        fieldWrapper.appendChild(label);
        fieldWrapper.appendChild(input);
        form.appendChild(fieldWrapper);
    });

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('button-group');

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.textContent = 'Save';
    saveButton.classList.add('save-button');
    saveButton.onclick = () => saveEdit(id, tableName, form);
    buttonGroup.appendChild(saveButton);

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add('cancel-button');
    cancelButton.onclick = loadTable;
    buttonGroup.appendChild(cancelButton);

    form.appendChild(buttonGroup);

    row.innerHTML = '';
    const td = document.createElement('td');
    td.colSpan = headers.split(',').length + 1;
    td.appendChild(form);
    row.appendChild(td);
}

function saveEdit(id, tableName, form) {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch(`/api/${tableName}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.affectedRows > 0) {
            loadTable();
        } else {
            console.error('Error updating row:', result);
        }
    })
    .catch(error => console.error('Error updating row:', error));
}

function deleteRow(id, tableName) {
    fetch(`/api/${tableName}/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.affectedRows > 0) {
            loadTable();
        } else {
            console.error('Error deleting row:', result);
        }
    })
    .catch(error => console.error('Error deleting row:', error));
}

function showNewEntryForm() {
    const tableSelect = document.getElementById('table-select');
    const tableName = tableSelect.value;
    const container = document.getElementById('new-entry-container');

    fetch(`/api/${tableName}`)
        .then(response => response.json())
        .then(data => {
            const headers = Object.keys(data[0]);
            const form = document.createElement('form');
            form.classList.add('new-entry-form');

            headers.forEach(header => {
                const fieldWrapper = document.createElement('div');
                fieldWrapper.classList.add('field-wrapper');

                const label = document.createElement('label');
                label.textContent = header;
                label.htmlFor = header;

                const input = document.createElement('input');
                if (header === 'tanggal') {
                    input.type = 'date';
                } else if (header === 'waktu') {
                    input.type = 'time';
                } else {
                    input.type = 'text';
                }
                input.name = header;
                input.id = header;

                fieldWrapper.appendChild(label);
                fieldWrapper.appendChild(input);
                form.appendChild(fieldWrapper);
            });

            const buttonGroup = document.createElement('div');
            buttonGroup.classList.add('button-group');

            const saveButton = document.createElement('button');
            saveButton.type = 'button';
            saveButton.textContent = 'Save';
            saveButton.classList.add('save-button');
            saveButton.onclick = () => saveNewEntry(tableName, form);
            buttonGroup.appendChild(saveButton);

            const cancelButton = document.createElement('button');
            cancelButton.type = 'button';
            cancelButton.textContent = 'Cancel';
            cancelButton.classList.add('cancel-button');
            cancelButton.onclick = () => container.innerHTML = '';
            buttonGroup.appendChild(cancelButton);

            form.appendChild(buttonGroup);

            container.innerHTML = '';
            container.appendChild(form);
        })
        .catch(error => console.error('Error fetching table data:', error));
}

function saveNewEntry(tableName, form) {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch(`/api/${tableName}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.id) {
            loadTable();
            document.getElementById('new-entry-container').innerHTML = '';
        } else {
            console.error('Error adding new entry:', result);
        }
    })
    .catch(error => console.error('Error adding new entry:', error));
}

function logout() {
    fetch('/api/logout', {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/login';
        } else {
            console.error('Error logging out');
        }
    })
    .catch(error => console.error('Error logging out:', error));
}

function loadStats() {
    const statsSelect = document.getElementById('stats-select');
    const statsType = statsSelect.value;
    const statsContainer = document.getElementById('stats-container');

    fetch(`/api/stats/${statsType}`)
        .then(response => response.json())
        .then(data => {
            renderChart(data, statsType);
        })
        .catch(error => console.error('Error fetching stats data:', error));
}

function renderChart(data, statsType) {
    const ctx = document.getElementById('stats-chart').getContext('2d');

    let chartData;
    let chartOptions;

    if (statsType === 'daily-audience') {
        chartData = {
            labels: data.map(item => item.date),
            datasets: [{
                label: 'Jumlah Penonton Harian',
                data: data.map(item => item.count),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };
        chartOptions = {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        };
    } else if (statsType === 'film-audience') {
        chartData = {
            labels: data.map(item => item.film),
            datasets: [{
                label: 'Jumlah Penonton per Film',
                data: data.map(item => item.count),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };
        chartOptions = {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        };
    } else if (statsType === 'revenue-growth') {
        chartData = {
            labels: data.map(item => item.month),
            datasets: [{
                label: 'Pertumbuhan Revenue Bioskop',
                data: data.map(item => item.revenue),
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        };
        chartOptions = {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        };
    }

    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: chartOptions
    });
}
