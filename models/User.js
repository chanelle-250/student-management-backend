const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Create user
    static async create(userData) {
        return new Promise(async (resolve, reject) => {
            try {
                const { full_name, email, phone, password, role, course_of_study, enrollment_year } = userData;
                const hashedPassword = await bcrypt.hash(password, 10);

                const query = `
          INSERT INTO users (full_name, email, phone, password, role, course_of_study, enrollment_year)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

                const values = [full_name, email, phone, hashedPassword, role || 'student', course_of_study, enrollment_year];

                db.run(query, values, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        // Get the created user
                        User.findById(this.lastID).then(resolve).catch(reject);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Find user by email
    static async findByEmail(email) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE email = ?';
            db.get(query, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Find user by ID
    static async findById(id) {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT id, full_name, email, phone, role, course_of_study, 
               enrollment_year, status, profile_picture, created_at 
        FROM users WHERE id = ?
      `;
            db.get(query, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Update user
    static async update(id, userData) {
        return new Promise((resolve, reject) => {
            const { full_name, email, phone, course_of_study, enrollment_year } = userData;

            const query = `
        UPDATE users 
        SET full_name = ?, email = ?, phone = ?, course_of_study = ?, 
            enrollment_year = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

            const values = [full_name, email, phone, course_of_study, enrollment_year, id];

            db.run(query, values, function(err) {
                if (err) {
                    reject(err);
                } else {
                    User.findById(id).then(resolve).catch(reject);
                }
            });
        });
    }

    // Get all students
    static async getAllStudents() {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT id, full_name, email, phone, course_of_study, 
               enrollment_year, status, created_at 
        FROM users WHERE role = ? ORDER BY created_at DESC
      `;
            db.all(query, ['student'], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Update student status
    static async updateStatus(id, status) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            db.run(query, [status, id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    User.findById(id).then(resolve).catch(reject);
                }
            });
        });
    }

    // Update user role
    static async updateRole(id, role) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            db.run(query, [role, id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    User.findById(id).then(resolve).catch(reject);
                }
            });
        });
    }

    // Delete user
    static async delete(id) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM users WHERE id = ?';
            db.run(query, [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ deletedRows: this.changes });
                }
            });
        });
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;