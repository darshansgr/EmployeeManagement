const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",      // 👈 change if your MySQL user is different
  password: "12345678", // 👈 put your MySQL root password
  database: "employee_db"
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL Database");
});

// ==================== ROUTES ====================

// Get all employees
app.get("/employees", (req, res) => {
  db.query("SELECT * FROM employees", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get single employee
app.get("/employees/:id", (req, res) => {
  db.query("SELECT * FROM employees WHERE id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Employee not found" });
    res.json(results[0]);
  });
});

// Add employee
app.post("/employees", (req, res) => {
  const { id, name, email, position, salary } = req.body;

  const query = "INSERT INTO employees (id, name, email, position, salary) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [id, name, email, position, salary], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Employee ID already exists" });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id, name, email, position, salary });
  });
});
// Update (or Insert if not found) employee
app.put("/employees/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, position, salary } = req.body;

  // First, check if employee exists
  const checkSql = "SELECT * FROM employees WHERE id = ?";
  db.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.length > 0) {
      // Employee exists → update
      const updateSql =
        "UPDATE employees SET name=?, email=?, position=?, salary=? WHERE id=?";
      db.query(updateSql, [name, email, position, salary, id], (err2) => {
        if (err2) return res.status(500).send(err2);
        res.json({ message: "✅ Employee updated successfully" });
      });
    } else {
      // Employee not found → insert new
      const insertSql =
        "INSERT INTO employees (id, name, email, position, salary) VALUES (?, ?, ?, ?, ?)";
      db.query(insertSql, [id, name, email, position, salary], (err3) => {
        if (err3) return res.status(500).send(err3);
        res.json({ message: "✅ Employee created successfully" });
      });
    }
  });
});
// Delete employee
app.delete("/employees/:id", (req, res) => {
  db.query("DELETE FROM employees WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Employee not found" });
    res.json({ message: "Employee deleted successfully" });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(" Server running at http://localhost:${PORT}");
});