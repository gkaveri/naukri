import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

export const register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check user already exists
  const checkQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkQuery, [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", err });

    if (result.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert new user
    const insertQuery = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(insertQuery, [name, email, hashedPassword], (err2) => {
      if (err2) return res.status(500).json({ message: "Error inserting user", err2 });

      res.json({ message: "User registered successfully" });
    });
  });
};

export const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const user = result[0];

    // Compare password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      "mysupersecretkey",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  });
};
