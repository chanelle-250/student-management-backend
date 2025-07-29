const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database with tables and seed data
function initializeDatabase() {
    // Create users table
    const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
      profile_picture TEXT,
      course_of_study TEXT,
      enrollment_year INTEGER,
      status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Graduated', 'Dropped')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

    db.run(createUsersTable, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('✅ Users table ready');
            insertSeedData();
        }
    });
}

// Insert seed data
function insertSeedData() {
    const bcrypt = require('bcryptjs');

    // Check if data already exists
    db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
        if (err) {
            console.error('Error checking existing data:', err.message);
            return;
        }

        if (row.count === 0) {
            console.log('📝 Inserting seed data...');

            const hashedPassword = await bcrypt.hash('password123', 10);

            const seedUsers = [
                {
                    full_name: 'Admin User',
                    email: 'admin@test.com',
                    phone: '1234567890',
                    password: hashedPassword,
                    role: 'admin',
                    course_of_study: null,
                    enrollment_year: null
                },
                {
                    full_name: 'John Doe',
                    email: 'john@test.com',
                    phone: '1234567891',
                    password: hashedPassword,
                    role: 'student',
                    course_of_study: 'Computer Science',
                    enrollment_year: 2023
                },
                {
                    full_name: 'Jane Smith',
                    email: 'jane@test.com',
                    phone: '1234567892',
                    password: hashedPassword,
                    role: 'student',
                    course_of_study: 'Software Engineering',
                    enrollment_year: 2024
                }
            ];

            const insertUser = `
        INSERT INTO users (full_name, email, phone, password, role, course_of_study, enrollment_year)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

            seedUsers.forEach((user, index) => {
                db.run(insertUser, [
                    user.full_name,
                    user.email,
                    user.phone,
                    user.password,
                    user.role,
                    user.course_of_study,
                    user.enrollment_year
                ], (err) => {
                    if (err) {
                        console.error(`Error inserting user ${index + 1}:`, err.message);
                    } else {
                        console.log(`✅ Inserted user: ${user.email}`);
                    }
                });
            });

            console.log('🎯 Seed data inserted! Test credentials:');
            console.log('   Admin: admin@test.com / password123');
            console.log('   Student: john@test.com / password123');
        }
    });
}

module.exports = db;