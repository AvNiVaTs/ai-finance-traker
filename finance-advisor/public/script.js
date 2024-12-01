// Initialize variables
let totalSavings = 0;
let totalExpenses = 0;

// DOM Elements
const savingsInput = document.getElementById("savings-input");
const expensesInput = document.getElementById("expenses-input");
const dashboardForm = document.getElementById("dashboard-form");
const savingsDisplay = document.getElementById("savings-display");
const expensesDisplay = document.getElementById("expenses-display");
const getAdviceBtn = document.getElementById("get-advice");
const adviceTextEl = document.getElementById("advice-text");

// Update Dashboard
function updateDashboard() {
  savingsDisplay.textContent = `$${totalSavings}`;
  expensesDisplay.textContent = `$${totalExpenses}`;
}

// Handle Dashboard Form Submission
dashboardForm.addEventListener("submit", (e) => {
  e.preventDefault();
  totalSavings = parseFloat(savingsInput.value);
  totalExpenses = parseFloat(expensesInput.value);
  updateDashboard();
});

// Get Advice Button Click
getAdviceBtn.addEventListener("click", async () => {
  try {
    adviceTextEl.textContent = "Generating advice...";
    const response = await fetch("http://localhost:3000/advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ savings: totalSavings, expenses: totalExpenses }),
    });
    const data = await response.json();
    adviceTextEl.textContent = data.advice || "Could not generate advice. Try again.";
  } catch (error) {
    adviceTextEl.textContent = "Error fetching advice. Please try later.";
    console.error(error);
  }
});