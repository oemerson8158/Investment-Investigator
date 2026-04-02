///////////////////////////////////////////////////////////////////////////
// investigator_helpers.js
//  This file contains helper functions for the Investment Investigator 
// project, including graph drawing and AppLab-like utility functions for 
// screen management and text handling.
//
//  Oliver Emerson - 2026
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
// Datatables Helper Functions
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
//  Function: renderStandardAccountsTable
//  Inputs: None
//  Outputs: Renders a full HTML table inside the Standard Accounts table
//  Summary: Builds an HTML table containing all standard savings account
//    data, including bank name, account name, interest rate, compounding
//    frequency, monthly fees, and minimum deposit. It loops through the
//    global standard‑account arrays, constructs each table row, and then
//    injects the completed HTML into the standardAccountsTable element.
///////////////////////////////////////////////////////////////////////////
function renderStandardAccountsTable() {
  const table = document.getElementById("standardAccountsTable");

  let html = `
    <tr>
      <th>Bank</th>
      <th>Account Name</th>
      <th>Interest (Decimal)</th>
      <th>Compoundings/Year</th>
      <th>Monthly Fees</th>
      <th>Minimum Deposit</th>
    </tr>
  `;

  for (let i = 0; i < standardAccountsBankNames.length; i++) {
    html += `
      <tr>
        <td>${standardAccountsBankNames[i]}</td>
        <td>${standardAccountsBankAccounts[i]}</td>
        <td>${standardAccountsBankRates[i]}</td>
        <td>${standardAccountsBankCompoundings[i]}</td>
        <td>${standardAccountsBankFees[i]}</td>
        <td>${standardAccountsMinimumDeposits[i]}</td>
      </tr>
    `;
  }

  table.innerHTML = html;
}

///////////////////////////////////////////////////////////////////////////
//  Function: renderCDAccountsTable
//  Inputs: None
//  Outputs: Renders a full HTML table inside the CD Accounts table
//  Summary: Builds an HTML table containing all CD account data, including
//    bank name, account name, interest rate, compounding frequency,
//    monthly fees, and minimum deposit. It loops through the global CD
//    account arrays, constructs each table row, and injects the completed
//    HTML into the cdAccountsTable element.
///////////////////////////////////////////////////////////////////////////
function renderCDAccountsTable() {
  const table = document.getElementById("cdAccountsTable");

  let html = `
    <tr>
      <th>Bank</th>
      <th>Account Name</th>
      <th>Interest (Decimal)</th>
      <th>Compoundings/Year</th>
      <th>Monthly Fees</th>
      <th>Minimum Deposit</th>
    </tr>
  `;

  for (let i = 0; i < cDAccountsBankNames.length; i++) {
    html += `
      <tr>
        <td>${cDAccountsBankNames[i]}</td>
        <td>${cDAccountsBankAccounts[i]}</td>
        <td>${cDAccountsBankRates[i]}</td>
        <td>${cDAccountsBankCompoundings[i]}</td>
        <td>${cDAccountsBankFees[i]}</td>
        <td>${cDAccountsMinimumDeposits[i]}</td>
      </tr>
    `;
  }

  table.innerHTML = html;
}

///////////////////////////////////////////////////////////////////////////
//  Function: renderAllAccountsTables
//  Inputs: None
//  Outputs: Renders both the Standard Accounts and CD Accounts tables
//  Summary: A convenience wrapper that calls renderStandardAccountsTable
//    and renderCDAccountsTable in sequence, ensuring that both tables on
//    the All Accounts screen are refreshed and displayed with the most
//    up‑to‑date account data.
///////////////////////////////////////////////////////////////////////////
function renderAllAccountsTables() {
  renderStandardAccountsTable();
  renderCDAccountsTable();
}


///////////////////////////////////////////////////////////////////////////
// Search Helper Functions
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
//  Function: levenshtein
//  Inputs: a - First string
//          b - Second string
//  Outputs: Number - The Levenshtein distance between the two strings
//  Error Checking: None
//  Summary: Calculates the Levenshtein distance between two strings, 
// which is the minimum number of single-character edits 
// (insertions, deletions or substitutions) required to change one string 
// into the other.
///////////////////////////////////////////////////////////////////////////
function levenshtein(a, b) {
  const matrix = [];
  // Create an empty 2D matrix that will store all edit‑distance values

  //Fills matrix by iterating through all rows and columns using parameters a and b
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {

      const cost = b[i - 1].toLowerCase() === a[j - 1].toLowerCase() ? 0 : 1;
      // Cost is 0 if characters match (case‑insensitive), otherwise 1

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      
        matrix[i][j - 1] + 1,        
        matrix[i - 1][j - 1] + cost  
      );
      // Chooses the cheapest edit and store it in the matrix
    }
  }

  // Returns the cell containing the minimum number of edits needed
  return matrix[b.length][a.length];
}


///////////////////////////////////////////////////////////////////////////
// Drawing Helper Functions
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
//  Function: roundUp
//  Inputs: value - A numeric value to round up to a "nice" axis maximum
//  Outputs: Number - The rounded value
//  Error Checking: None
//  Summary: Rounds a number up to the nearest "nice" value (1, 2, 5, or 10
//    times a power of 10). Used for graph axis scaling so the Y-axis labels
//    look clean and professional.
///////////////////////////////////////////////////////////////////////////
function roundUp(value) {
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;

  let rounded;
  if (normalized <= 1) {
    rounded = 1;
  } else if (normalized <= 2) {
    rounded = 2;
  } else if (normalized <= 5) {
    rounded = 5;
  } else {
    rounded = 10;
  }

  return rounded * magnitude;
}

///////////////////////////////////////////////////////////////////////////
//  Function: drawGraph
//  Inputs: points - Array of numeric values representing account growth
//  Outputs: None
//  Error Checking: None
//  Summary: Draws a line graph on the canvas showing account value over
//    time. The graph includes axes, tick marks, labels, and start/end
//    dollar values. The Y-axis uses a rounded maximum for clean scaling.
///////////////////////////////////////////////////////////////////////////
function drawGraph(points) {
  const canvas = document.getElementById(chosenCanvas);
  const ctx = canvas.getContext("2d");

  // Clear previous drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fill background with white
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  // Graph boundaries to fit in html canvas
  const left = 50;
  const right = 550;
  const bottom = 350;
  const top = 50;

  // Use rounded max value to scale tick labels
  const rawMax = Math.max.apply(null, points);
  const maxValue = roundUp(rawMax);

  const scaleY = (bottom - top) / maxValue;
  const scaleX = (right - left) / (points.length - 1);

  //Draw axes
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(right, bottom); // X-axis
  ctx.lineTo(right, top);    // Y-axis
  ctx.stroke();

  // Draw the graph line
  ctx.beginPath();
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;

  for (let i = 0; i < points.length; i++) {
    const x = left + i * scaleX;
    const y = bottom - points[i] * scaleY;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();

  //Lable star and end points with dollar values
  ctx.font = "14px Arial";
  ctx.fillStyle = "black";

  // Start point
  const startX = left;
  const startY = bottom - points[0] * scaleY;
  ctx.fillText("$" + points[0].toFixed(0), startX - 10, startY - 10);

  // End point
  const endX = left + (points.length - 1) * scaleX;
  const endY = bottom - points[points.length - 1] * scaleY;
  ctx.fillText("$" + points[points.length - 1].toFixed(0), endX - 20, endY - 10);

  //X-axis label
  ctx.font = "16px Arial";
  ctx.fillText("Years", (left + right) / 2 - 20, bottom + 40);

  //Y-axis label
  ctx.save();
  ctx.translate(left - 40, (top + bottom) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Account Value ($)", -60, 0);
  ctx.restore();

  //Y-axis ticks
  ctx.font = "12px Arial";
  const steps = 5;

  for (let i = 0; i <= steps; i++) {
    const val = Math.round((maxValue / steps) * i);
    const y = bottom - val * scaleY;
    ctx.fillText(val, left - 40, y + 4);
  }

  //X-axis ticks
  for (let i = 0; i < points.length; i++) {
    const x = left + i * scaleX;
    ctx.fillText(i, x - 3, bottom + 15);
  }
}

///////////////////////////////////////////////////////////////////////////
//  Function: drawDualGraph
//  Inputs: pointsA, pointsB (growth values for each account),
//          nameA, nameB (the account names to label the lines)
//  Outputs: Draws a two‑line comparison graph on the Compare Rates canvas
//  Summary: Plots both accounts on the same graph so users can visually
//    compare how each one grows over time. It draws the axes, scales the
//    graph, plots both lines in different colors, labels the start and end
//    values, and adds a small legend showing which line belongs to which
//    account.
///////////////////////////////////////////////////////////////////////////
function drawDualGraph(pointsA, pointsB, nameA, nameB) {
  const canvas = document.getElementById("compareRatesCanvas");
  const ctx = canvas.getContext("2d");

  // Clear previous drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Graph boundaries to fit inside html canvas
  const left = 50;
  const right = 550;
  const bottom = 350;
  const top = 50;

  // Shared max for both account curves
  const rawMax = Math.max(
    Math.max.apply(null, pointsA),
    Math.max.apply(null, pointsB)
  );

  //Rounds tick labels to even numbers
  const maxValue = roundUp(rawMax);

  const scaleY = (bottom - top) / maxValue;
  const scaleX = (right - left) / (pointsA.length - 1);

  // Axes
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.lineTo(right, top);
  ctx.strokeStyle = "black";
  ctx.stroke();

  // Draw line helper
  function drawLine(points, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    for (let i = 0; i < points.length; i++) {
      const x = left + i * scaleX;
      const y = bottom - points[i] * scaleY;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
  }

  // Draw both lines
  drawLine(pointsA, "#0a84ff");
  drawLine(pointsB, "#2ecc71");

  // Label endpoints
  function labelEndpoints(points, color) {
    ctx.fillStyle = color;
    ctx.font = "14px Arial";

    const startX = left;
    const startY = bottom - points[0] * scaleY;
    ctx.fillText("$" + points[0].toFixed(0), startX - 10, startY - 10);

    const endX = left + (points.length - 1) * scaleX;
    const endY = bottom - points[points.length - 1] * scaleY;
    ctx.fillText("$" + points[points.length - 1].toFixed(0), endX - 20, endY - 10);

    ctx.beginPath();
    ctx.arc(endX, endY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  labelEndpoints(pointsA, "#0a84ff");
  labelEndpoints(pointsB, "#2ecc71");

  // Axis labels
  ctx.fillStyle = "black";
  ctx.font = "16px Arial";
  ctx.fillText("Years", (left + right) / 2 - 20, bottom + 40);

  ctx.save();
  ctx.translate(left - 40, (top + bottom) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Account Value ($)", -60, 0);
  ctx.restore();

  // Y-axis ticks
  ctx.font = "12px Arial";
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const val = Math.round((maxValue / steps) * i);
    const y = bottom - val * scaleY;
    ctx.fillText(val, left - 40, y + 4);
  }

  // X-axis ticks
  for (let i = 0; i < pointsA.length; i++) {
    const x = left + i * scaleX;
    ctx.fillText(i, x - 3, bottom + 15);
  }

  // Legend (Account Name Labels)
  const legendX = right - 180;
  const legendY = top + 10;

  ctx.fillStyle = "white";
  ctx.fillRect(legendX, legendY, 160, 50);
  ctx.strokeStyle = "#ccc";
  ctx.strokeRect(legendX, legendY, 160, 50);

  ctx.font = "14px Arial";

  // Blue line label
  ctx.fillStyle = "#0a84ff";
  ctx.fillRect(legendX + 10, legendY + 10, 20, 4);
  ctx.fillStyle = "black";
  ctx.fillText(nameA, legendX + 40, legendY + 14);

  // Green line label
  ctx.fillStyle = "#2ecc71";
  ctx.fillRect(legendX + 10, legendY + 30, 20, 4);
  ctx.fillStyle = "black";
  ctx.fillText(nameB, legendX + 40, legendY + 34);
}

///////////////////////////////////////////////////////////////////////////
//  Function: computeGrowth
//  Inputs: principal - Starting amount
//          rate - Annual interest rate (decimal)
//          n - Compoundings per year
//          years - Total number of years
//  Outputs: Array of values representing account growth over time
//  Error Checking: None
//  Summary: Computes compound interest growth for each year and returns
//    an array of values suitable for graphing.
///////////////////////////////////////////////////////////////////////////
function computeGrowth(principal, rate, n, years) {
  const arr = [];
  for (let t = 0; t <= years; t++) {
    const amount = principal * Math.pow(1 + rate / n, n * t);
    arr.push(amount);
  }
  return arr;
}

///////////////////////////////////////////////////////////////////////////
//  Function: computeGrowthAdvanced
//  Inputs: principal - Starting amount
//          rate - Annual interest rate (decimal)
//          n - Compoundings per year
//          years - Total number of years
//          depositAmount - Recurring deposit amount
//          depositFrequency - Recurring deposit frequency
//  Outputs: Array of values representing account growth over time
//  Error Checking: None
//  Summary: Computes compound interest growth for each year and returns
//    an array of values suitable for graphing, accounts for recurring deposits.
///////////////////////////////////////////////////////////////////////////
function computeGrowthAdvanced(principal, rate, n, years, depositAmount, depositFrequency) {
  const arr = [];
  let currentBalance = principal;

  // Add the starting balance for Year 0
  arr.push(currentBalance);

  for (let t = 1; t <= years; t++) {
    // 1. Grow the existing balance for one year using compound interest
    // Formula: A = P(1 + r/n)^n
    currentBalance = currentBalance * Math.pow(1 + rate / n, n);

    // 2. Add the recurring deposits made during that year
    // Note: This assumes deposits are added at the end of the compounding periods
    const annualDepositTotal = depositAmount * depositFrequency;
    currentBalance += annualDepositTotal;

    // 3. Push the new total at the end of the year
    arr.push(currentBalance);
  }
  
  return arr;
}

///////////////////////////////////////////////////////////////////////////
// Savings Plan Graph Helper Functions
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
//  Function: drawInteractiveSavingsPlan
//  Inputs: investmentGoal, investmentLength, finalRate, finalCompounding,
//          depositFrequency, onSelectCallback
//  Outputs: Draws an interactive graph on the Savings Plan canvas
//  Summary: Creates a graph that shows the trade‑off between starting
//    principal and recurring deposit amounts needed to reach a savings
//    goal. It draws the axes, scales the graph, plots the relationship
//    line, and lets the user click anywhere on the graph to choose a
//    custom principal‑to‑deposit combination. The selected point is
//    highlighted and passed back through a callback function.
///////////////////////////////////////////////////////////////////////////
function drawInteractiveSavingsPlan(investmentGoal, investmentLength, finalRate, finalCompounding, depositFrequency, onSelectCallback) {
  const canvas = document.getElementById("savingsPlanCanvas");
  const ctx = canvas.getContext("2d");

  // Store inputs in shorter variables for easier math
  const r = finalRate;
  const t = investmentLength;
  const n = finalCompounding;
  const m = depositFrequency;

  // Growth factors used to calculate the relationship between principal and deposits
  const A = Math.pow(1 + r / n, n * t);        // Growth of a single lump‑sum principal
  const i_m = Math.pow(1 + r / n, n / m) - 1;  // Effective rate per deposit period
  const B = (Math.pow(1 + i_m, m * t) - 1) / i_m; // Growth factor for recurring deposits

  // Maximum principal and deposit values that still reach the goal
  const rawMaxP = investmentGoal / A;
  const rawMaxD = investmentGoal / B;

  // Round values for cleaner axis labels
  const maxPrincipal = roundUp(rawMaxP);
  const maxDeposit = roundUp(rawMaxD);

  // Graph boundaries inside the canvas
  const left = 100;
  const right = 530;
  const bottom = 330;
  const top = 50;

  // Convert dollars → pixels
  const scaleX = (right - left) / maxPrincipal;
  const scaleY = (bottom - top) / maxDeposit;

  // Stores the user’s selected point on the graph
  let selectedPoint = null;

  // Draws the full graph, including axes, labels, and selected point
  function render(hoverPoint = null) {
    // Clear the canvas and fill with white
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the X and Y axes
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);   // Y-axis
    ctx.lineTo(right, bottom);  // X-axis
    ctx.stroke();

    // Draw the main blue line showing the principal/deposit trade‑off
    ctx.beginPath();
    ctx.strokeStyle = "#0a84ff";
    ctx.lineWidth = 3;
    ctx.moveTo(left, bottom - (rawMaxD * scaleY));            // Top-left point
    ctx.lineTo(left + (rawMaxP * scaleX), bottom);            // Bottom-right point
    ctx.stroke();

    // Draw axis labels and tick marks
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    const steps = 5;

    // Y-axis ticks (deposit amounts)
    for (let i = 0; i <= steps; i++) {
      const val = Math.round((maxDeposit / steps) * i);
      const y = bottom - (val * scaleY);
      ctx.fillText("$" + val, left - 60, y + 4);

      ctx.beginPath();
      ctx.moveTo(left - 5, y);
      ctx.lineTo(left, y);
      ctx.stroke();
    }

    // X-axis ticks (principal amounts)
    for (let i = 0; i <= steps; i++) {
      const val = Math.round((maxPrincipal / steps) * i);
      const x = left + (val * scaleX);
      ctx.fillText("$" + val, x - 15, bottom + 20);

      ctx.beginPath();
      ctx.moveTo(x, bottom);
      ctx.lineTo(x, bottom + 5);
      ctx.stroke();
    }

    // Axis titles
    ctx.font = "16px Arial";
    ctx.fillText("Initial Principal ($)", (left + right) / 2 - 50, bottom + 50);

    ctx.save();
    ctx.translate(left - 65, (top + bottom) / 2 + 50);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Periodic Deposit ($)", 0, 0);
    ctx.restore();

    // Draw the selected or hovered point
    const point = hoverPoint || selectedPoint;
    if (point) {
      ctx.beginPath();
      ctx.fillStyle = "#ff4757";
      ctx.arc(point.canvasX, point.canvasY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "bold 12px Arial";
      ctx.fillText(`P: $${point.principal.toFixed(2)}`, point.canvasX + 10, point.canvasY - 10);
      ctx.fillText(`D: $${point.deposit.toFixed(2)}`, point.canvasX + 10, point.canvasY + 5);
    }
  }

  // Handles user clicks on the graph
  canvas.onmousedown = function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Only allow clicks inside the graph area
    if (x >= left && x <= right) {
      const p = (x - left) / scaleX;  // Convert pixel → principal

      // Only allow valid principal values
      if (p <= rawMaxP) {
        const d = (investmentGoal - (p * A)) / B; // Solve for deposit
        const y = bottom - (d * scaleY);          // Convert deposit → pixel

        // Store the selected point
        selectedPoint = { 
          principal: p, 
          deposit: d, 
          canvasX: x, 
          canvasY: y 
        };

        // Redraw with the selected point
        render();

        // Send the selected point back to the caller
        if (typeof onSelectCallback === "function") {
          onSelectCallback(selectedPoint);
        }
      }
    }
  };

  // Draw the initial graph
  render();
}


///////////////////////////////////////////////////////////////////////////
// AppLab helper functions
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
//  Function: getColumn
//  Inputs: rows - Array of objects representing rows in a CSV file
//          columnName - Name of the column to extract
//  Outputs: Array of values from the specified column
//  Error Checking: None
//  Summary: Extracts a column of values from an array of objects. Each 
//   object is expected to have a key corresponding to the column name, 
//   and the function returns an array of the values for that key across 
//   all objects.
///////////////////////////////////////////////////////////////////////////
function getColumn(rows, columnName) {
  // Map each row to the value in the specified column 
  return rows.map(row => row[columnName]);
}

///////////////////////////////////////////////////////////////////////////
//  Function: setScreen
//  Inputs: screenId - ID of the screen to display
//  Outputs: None
//  Error Checking: None
//  Summary: Displays the screen with the specified ID and hides all 
//    other screens.
///////////////////////////////////////////////////////////////////////////
function setScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add("active");
  } else {
    console.warn(`setScreen: Screen "${screenId}" not found`);
  }
}

///////////////////////////////////////////////////////////////////////////
//  Function: getText
//  Inputs: textID - ID of the text element to read
//  Outputs: String - The text content of the element
//  Error Checking: None
//  Summary: Reads the text content from the element with the specified ID.
///////////////////////////////////////////////////////////////////////////
function getText(id) {
  const el = document.getElementById(id);
  if (!el) return "";
  return el.value ?? el.textContent ?? "";
}

///////////////////////////////////////////////////////////////////////////
//  Function: setText
//  Inputs: textID - ID of the text element to set
//  Outputs: None
//  Error Checking: None
//  Summary: Sets the text content of the element with the specified ID.
///////////////////////////////////////////////////////////////////////////
function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  if ("value" in el) el.value = value;
  else el.textContent = value;
}

///////////////////////////////////////////////////////////////////////////
//  Function: getNumber
//  Inputs: textID - ID of the text element to read
//  Outputs: Number - The numeric value of the element
//  Error Checking: None
//  Summary: Reads the text content from the element with the specified ID and converts it to a number.
///////////////////////////////////////////////////////////////////////////
function getNumber(id) {
  return Number(getText(id));
}

///////////////////////////////////////////////////////////////////////////
//  Function: appendItem
//  Inputs: list - The list to which the item will be added
//          value - The value to add to the list
//  Outputs: None
//  Error Checking: None
//  Summary: Adds a value to the end of the specified list.
///////////////////////////////////////////////////////////////////////////
function appendItem(list, value) {
  list.push(value);
}

///////////////////////////////////////////////////////////////////////////
//  Function: hideElement
//  Inputs: elementID- Id of the element to hide
//  Outputs: None
//  Error Checking: None
//  Summary: Hides the specified element
///////////////////////////////////////////////////////////////////////////
function hideElement(id) {
  document.getElementById(id).style.display = "none";
}

///////////////////////////////////////////////////////////////////////////
//  Function: showElement
//  Inputs: elementID- Id of the element to hide
//  Outputs: None
//  Error Checking: None
//  Summary: Shows the specified element
///////////////////////////////////////////////////////////////////////////
function showElement(id) {
  document.getElementById(id).style.display = "block";

}

///////////////////////////////////////////////////////////////////////////
//  Function: getScreen
//  Inputs: None
//  Outputs: elementID of current screen
//  Error Checking: None
//  Summary: Returns the element ID of the current screen
///////////////////////////////////////////////////////////////////////////
function getScreen() {
  const active = document.querySelector(".screen.active");
  return active ? active.id : null;
}


// onEvent(id, event, callback)
///////////////////////////////////////////////////////////////////////////
//  Function: onEvent
//  Inputs: id - ID of the element to attach event to
//          event - The event to listen for
//          callback - The function to call when the event occurs
//  Outputs: None
//  Error Checking: None
//  Summary: Attaches an event listener to the element with the specified ID.
///////////////////////////////////////////////////////////////////////////
function onEvent(id, event, callback) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`onEvent: Element with id "${id}" not found`);
    return;
  }
  el.addEventListener(event, callback);
}