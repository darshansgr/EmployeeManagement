// routes/employees.js
import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Get all employees
router.get("/", (req, res) => {
  db.query("SELECT * FROM employees", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

export default router;