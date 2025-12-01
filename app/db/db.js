import mysql from 'mysql2';

// Kita gunakan createPool (bukan createConnection)
// Agar koneksi tidak putus-nyambung saat banyak yang akses
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 4000, // Port standar TiDB
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Settingan SSL (WAJIB untuk TiDB Cloud)
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
});

export default db;