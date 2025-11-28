import express from 'express';
import db from '../config/db.js';  // Now in src/config/
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware for auth
const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

const authorizeRecruiter = (req, res, next) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ message: 'Access denied' });
  next();
};

// Get Jobs (with filters)
router.get('/', (req, res) => {
  const { q, location, salary_min, salary_max, employment_type, experience_level, sort, page = 1, limit = 10 } = req.query;
  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];
  if (q) { query += ' AND (job_title LIKE ? OR description LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  if (location) { query += ' AND location LIKE ?'; params.push(`%${location}%`); }
  // Add more filters as needed
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Get Job by ID
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM jobs WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0]);
  });
});

// Post Job (Recruiter only)
router.post('/', authenticate, authorizeRecruiter, (req, res) => {
  const job = { ...req.body, recruiter_id: req.user.id };
  db.query('INSERT INTO jobs SET ?', job, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Job posted' });
  });
});

// Apply to Job
router.post('/apply/:jobId', authenticate, (req, res) => {
  const { resume_url } = req.body;
  db.query('INSERT INTO applications SET ?', { user_id: req.user.id, job_id: req.params.jobId, resume_url }, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Applied' });
  });
});

// Add more routes (update, delete, applicants) as needed

export default router;
