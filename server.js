const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

const app = express();
const port = 3000;

// Memulai koneksi ke database menggunakan pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport.js configuration
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
    try {
        const [results] = await pool.query('SELECT * FROM user WHERE id = ?', [id]);
        done(null, results[0]);
    } catch (err) {
        done(err);
    }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
    },
    async function(accessToken, refreshToken, profile, done) {
        try {
            const [results] = await pool.query('SELECT * FROM user WHERE google_id = ?', [profile.id]);
            if (results.length > 0) {
                return done(null, results[0]);
            } else {
                const newUser = {
                    username: profile.displayName,
                    google_id: profile.id,
                    first_name: profile.name.givenName,
                    last_name: profile.name.familyName,
                    email: profile.emails[0].value,
                    type: 'user'
                };
                const [result] = await pool.query('INSERT INTO user SET ?', newUser);
                newUser.id = result.insertId;
                return done(null, newUser);
            }
        } catch (err) {
            return done(err);
        }
    }
));

// Menyajikan file statis dari folder 'public'
app.use(express.static('public'));
app.use(express.static('admin'));
app.use('/asset', express.static('asset'));

// Endpoint untuk login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt with username: ${username}`);
    const query = 'SELECT * FROM user WHERE username = ? AND password = ?';

    try {
        const [results] = await pool.query(query, [username, password]);
        console.log(`Query results: ${JSON.stringify(results)}`);

        if (results.length > 0) {
            req.session.user = results[0];
            if (results[0].type === 'admin') {
                res.send('/admin');
            } else {
                res.send('/');
            }
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
});

// Endpoint untuk mendapatkan nama admin
app.get('/api/admin-name', async (req, res) => {
    if (req.session.user && req.session.user.type === 'admin') {
        res.json({ name: req.session.user.username });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

// Endpoint untuk mendapatkan semua data dari tabel tertentu
app.get('/api/:table', async (req, res) => {
    const table = req.params.table;
    try {
        const [results] = await pool.query(`SELECT * FROM ??`, [table]);
        res.json(results);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
});

// Endpoint untuk memperbarui data di tabel tertentu berdasarkan ID
app.put('/api/:table/:id', async (req, res) => {
    const table = req.params.table;
    const id = req.params.id;
    const updateData = req.body;
    try {
        const [result] = await pool.query(`UPDATE ?? SET ? WHERE id = ?`, [table, updateData, id]);
        res.json({ affectedRows: result.affectedRows });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
});

// Endpoint untuk menghapus referensi dari tabel book berdasarkan user_id
app.delete('/api/book/user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const [result] = await pool.query('DELETE FROM book WHERE user_id = ?', [userId]);
        res.json({ affectedRows: result.affectedRows });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
});

// Endpoint untuk menghapus data dari tabel tertentu berdasarkan ID
app.delete('/api/:table/:id', async (req, res) => {
    const table = req.params.table;
    const id = req.params.id;
    try {
        const [result] = await pool.query(`DELETE FROM ?? WHERE id = ?`, [table, id]);
        res.json({ affectedRows: result.affectedRows });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
});

// Endpoint untuk registrasi
app.post('/register', async (req, res) => {
    const { username, password, first_name, last_name, email } = req.body;
    const type = 'user'; // Default type is 'user'
    const query = 'INSERT INTO user (username, password, type, first_name, last_name, email) VALUES (?, ?, ?, ?, ?, ?)';

    try {
        const [result] = await pool.query(query, [username, password, type, first_name, last_name, email]);
        res.status(201).send('User registered successfully');
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
});

// Endpoint for logging out
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to logout');
        }
        res.clearCookie('connect.sid');
        res.sendStatus(200);
    });
});

// Endpoint for getting current user
app.get('/api/user', (req, res) => {
    if (req.session.user) {
        res.json({ username: req.session.user.username });
    } else {
        res.status(401).send('Not authenticated');
    }
});

// Endpoint untuk mendapatkan jumlah penonton harian
app.get('/api/stats/daily-audience', async (req, res) => {
    const query = `
        SELECT DATE(tanggal_booking) as date, COUNT(*) as count 
        FROM book 
        GROUP BY DATE(tanggal_booking)
        ORDER BY DATE(tanggal_booking)
    `;
    try {
        const [results] = await pool.query(query);
        res.json(results);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
});

// Endpoint untuk mendapatkan jumlah penonton per film
app.get('/api/stats/film-audience', async (req, res) => {
    const query = `
        SELECT f.judul as film, COUNT(*) as count 
        FROM book b
        JOIN jadwal j ON b.jadwal_id = j.id
        JOIN film f ON j.film_id = f.id
        GROUP BY f.judul
    `;
    try {
        const [results] = await pool.query(query);
        res.json(results);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
});

// Endpoint untuk mendapatkan pertumbuhan revenue
app.get('/api/stats/revenue-growth', async (req, res) => {
    const query = `
        SELECT DATE_FORMAT(tanggal_booking, '%Y-%m') as month, SUM(j.harga_tiket * b.jumlah_tiket) as revenue
        FROM book b
        JOIN jadwal j ON b.jadwal_id = j.id
        GROUP BY DATE_FORMAT(tanggal_booking, '%Y-%m')
        ORDER BY DATE_FORMAT(tanggal_booking, '%Y-%m')
    `;
    try {
        const [results] = await pool.query(query);
        res.json(results);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
});

// Endpoint untuk menambahkan data baru ke tabel tertentu
app.post('/api/:table', async (req, res) => {
    const table = req.params.table;
    const newData = req.body;
    try {
        const [result] = await pool.query(`INSERT INTO ?? SET ?`, [table, newData]);
        res.json({ affectedRows: result.affectedRows });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
});

// Endpoint untuk mendapatkan detail film beserta jadwalnya
app.get('/api/film', async (req, res) => {
    try {
        const [films] = await pool.query('SELECT * FROM film');
        const filmData = await Promise.all(films.map(async film => {
            const [jadwals] = await pool.query('SELECT * FROM jadwal WHERE film_id = ?', [film.id]);
            return { ...film, jadwal: jadwals };
        }));
        res.json(filmData);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
});

// Endpoint untuk mendapatkan detail film berdasarkan ID
app.get('/api/film/:id', async (req, res) => {
    const filmId = req.params.id;
    try {
        const [films] = await pool.query('SELECT * FROM film WHERE id = ?', [filmId]);
        if (films.length > 0) {
            const [jadwals] = await pool.query('SELECT * FROM jadwal WHERE film_id = ?', [filmId]);
            res.json({ ...films[0], jadwal: jadwals });
        } else {
            res.status(404).send('Film not found');
        }
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
});

// Endpoint untuk booking tiket
app.post('/api/book', async (req, res) => {
    const { user_id, jadwal_id, jumlah_tiket } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO book (user_id, jadwal_id, jumlah_tiket) VALUES (?, ?, ?)', [user_id, jadwal_id, jumlah_tiket]);
        res.json({ id: result.insertId });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Internal server error');
    }
});

// Middleware untuk proteksi halaman admin
app.use('/admin', (req, res, next) => {
    if (req.session.user && req.session.user.type === 'admin') {
        next();
    } else {
        res.redirect('/login');
    }
});

// Route untuk halaman utama
app.get('/', (req, res) => {
    if (req.session.user && req.session.user.type === 'user') {
        res.sendFile(__dirname + '/public/index.html');
    } else if (req.session.user && req.session.user.type === 'admin') {
        res.redirect('/admin');
    } else {
        res.redirect('/login');
    }
});

// Route untuk halaman admin
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/admin/index.html');
});

// Route untuk halaman login
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// Route untuk halaman registrasi
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

// Google OAuth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
