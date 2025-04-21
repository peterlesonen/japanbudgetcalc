let totalBudget = 0;
let fixedCosts = 0;
let expenses = [];

const totalBudgetInput = document.getElementById("total-budget");
const setBudgetBtn = document.getElementById("set-budget-btn");
const flightInput = document.getElementById("flight-cost");
const accommodationInput = document.getElementById("accommodation-cost");
const addFixedBtn = document.getElementById("add-fixed-btn");

const expanseDate = document.getElementById("expanse-date");
const expanseCategory = document.getElementById("expanse-category");
const expanseNotes = document.getElementById("notes-expanse");
const expanseAmount = document.getElementById("expanse-amount");
const addExpanseBtn = document.getElementById("add-expanse-btn");

const remainingBudgetDisplay = document.getElementById("remaining-budget");
const expenseEntries = document.getElementById("expense-entries");

const yenAmountInput = document.getElementById("yen-amount");
const convertToSelect = document.getElementById("convert-to");
const conversionResult = document.getElementById("conversion-result");
const convertedBudgetDisplay = document.getElementById("converted-budget");

const resetBtn = document.getElementById("reset-btn");

// --- SET BUDGET ---
setBudgetBtn.addEventListener("click", () => {
  const value = parseFloat(totalBudgetInput.value);
  if (!isNaN(value) && value > 0) {
    totalBudget = value;
    updateRemainingBudget();
    saveData();
  } else {
    alert("Please enter a valid total budget.");
  }
});

// --- ADD FIXED COSTS ---
addFixedBtn.addEventListener("click", () => {
  const flight = parseFloat(flightInput.value) || 0;
  const accommodation = parseFloat(accommodationInput.value) || 0;
  fixedCosts = flight + accommodation;
  updateRemainingBudget();
  saveData();
});

// --- ADD EXPENSE ---
addExpanseBtn.addEventListener("click", () => {
  const date = expanseDate.value;
  const category = expanseCategory.value;
  const notes = expanseNotes ? expanseNotes.value : "";
  const amount = parseFloat(expanseAmount.value);

  if (!date || isNaN(amount) || amount <= 0) {
    alert("Please enter valid expense data.");
    return;
  }

  expenses.push({ date, category, notes, amount });
  updateRemainingBudget();
  displayExpenses();
  saveData();
});

// --- UPDATE REMAINING BUDGET ---
function updateRemainingBudget() {
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = totalBudget - fixedCosts - totalExpenses;
  remainingBudgetDisplay.innerText = `Remaining Budget: ¥${remaining.toFixed(2)}`;
}

// --- DISPLAY EXPENSES ---
function displayExpenses() {
  expenseEntries.innerHTML = "";
  expenses.forEach((exp) => {
    const li = document.createElement("li");
    li.textContent = `${exp.date} - ${exp.category} - Notes: ${exp.notes || "N/A"}: ¥${exp.amount.toFixed(2)}`;
    expenseEntries.appendChild(li);
  });
}

// --- CURRENCY CONVERTER ---
document.getElementById("convert-btn").addEventListener("click", async () => {
  const amount = parseFloat(yenAmountInput.value);
  const targetCurrency = convertToSelect.value;

  if (isNaN(amount) || amount <= 0) {
    conversionResult.innerText = "Please enter a valid amount.";
    return;
  }

  const apiKey = "d98eceaac30d8bd27445914c";
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/JPY`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data || !data.conversion_rates) {
      conversionResult.innerText = "Failed to get exchange rates.";
      return;
    }

    const rate = data.conversion_rates[targetCurrency];
    const converted = (amount * rate).toFixed(2);

    conversionResult.innerText = `${amount} JPY = ${converted} ${targetCurrency}`;

    // Show full budget in selected currency too
    if (totalBudget > 0) {
      const totalConverted = (totalBudget * rate).toFixed(2);
      convertedBudgetDisplay.innerText = `${totalConverted} ${targetCurrency}`;
    }
  } catch (err) {
    console.error(err);
    conversionResult.innerText = "Error getting conversion.";
  }
});

// --- SAVE TO LOCAL STORAGE ---
function saveData() {
  const data = {
    totalBudget,
    fixedCosts,
    expenses
  };
  localStorage.setItem("japanBudgetData", JSON.stringify(data));
}

// --- LOAD DATA ON PAGE LOAD ---
window.addEventListener("load", () => {
  const saved = localStorage.getItem("japanBudgetData");
  if (saved) {
    const data = JSON.parse(saved);
    totalBudget = data.totalBudget || 0;
    fixedCosts = data.fixedCosts || 0;
    expenses = data.expenses || [];

    totalBudgetInput.value = totalBudget;
    displayExpenses();
    updateRemainingBudget();
  }
});

// --- RESET BUTTON ---
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    localStorage.removeItem("japanBudgetData");
    totalBudget = 0;
    fixedCosts = 0;
    expenses = [];

    // Clear inputs
    totalBudgetInput.value = "";
    flightInput.value = "";
    accommodationInput.value = "";
    expanseDate.value = "";
    expanseAmount.value = "";
    if (expanseNotes) expanseNotes.value = "";

    // Clear currency fields
    yenAmountInput.value = "";
    conversionResult.innerText = "";
    convertedBudgetDisplay.innerText = "0";

    // Reset UI
    updateRemainingBudget();
    displayExpenses();
  });
}
