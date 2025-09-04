const API_URL = "http://localhost:5000/employees";

const form = document.getElementById("employeeForm");
const employeeList = document.getElementById("employeeList");

// Fetch employees and display them
async function fetchEmployees() {
  try {
    const res = await fetch(API_URL);
    const employees = await res.json();

    employeeList.innerHTML = "";
    employees.forEach(emp => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <span class="emp-id">#${emp.id}</span>
        <h3>${emp.name}</h3>
        <p><strong>Email:</strong> ${emp.email}</p>
        <p><strong>Position:</strong> ${emp.position}</p>
        <p><strong>Salary:</strong> ₹${emp.salary}</p>
        <button class="btn-edit" onclick="editEmployee(${emp.id})">✏ Edit</button>
        <button class="btn-delete" onclick="deleteEmployee(${emp.id})">🗑 Delete</button>
      `;

      employeeList.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching employees:", err);
  }
}

// Handle form submit (Add or Update)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const employee = {
    id: document.getElementById("empId").value,
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    position: document.getElementById("position").value,
    salary: document.getElementById("salary").value
  };

  try {
    // Check if employee with this ID exists
    const checkRes = await fetch(`${API_URL}/${employee.id}`);
    if (checkRes.ok) {
      // Employee exists → UPDATE
      const res = await fetch(`${API_URL}/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee)
      });

      if (!res.ok) throw new Error("Update failed");
    } else {
      // Employee does not exist → CREATE new
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee)
      });

      if (!res.ok) throw new Error("Create failed");
    }

    fetchEmployees();
    form.reset();
  } catch (err) {
    console.error("Error saving employee:", err);
    alert("Could not save employee. Check backend logs.");
  }
});

// Delete employee
async function deleteEmployee(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchEmployees();
  } catch (err) {
    console.error("Error deleting employee:", err);
  }
}

// Edit employee → fill form with values
async function editEmployee(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Employee not found");
    const emp = await res.json();

    document.getElementById("empId").value = emp.id;
    document.getElementById("name").value = emp.name;
    document.getElementById("email").value = emp.email;
    document.getElementById("position").value = emp.position;
    document.getElementById("salary").value = emp.salary;
  } catch (err) {
    console.error("Error editing employee:", err);
  }
}

// Initial load
fetchEmployees();