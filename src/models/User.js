import db from "../config/db.js";

const User = {
  create: (name, email, password, callback) => {
    const query = `
      INSERT INTO users (name, email, password)
      VALUES (?, ?, ?)
    `;
    db.query(query, [name, email, password], callback);
  },

  findByEmail: (email, callback) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    db.query(query, [email], callback);
  }
};

export default User;
