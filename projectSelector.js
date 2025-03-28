// ==============================
// projectSelector.js
// ==============================

// 1) List your CSV files here.
//    By convention, we'll show "links.csv" as default and strip off
//    "project_" from the others.
const CSV_FILES = [
  "links.csv",
  "project_Example.csv",
  "project_Sandbox.csv"
  // Add more as needed
];

// 2) Once DOM is loaded, build the dropdown, figure out the chosen CSV, load it.
document.addEventListener("DOMContentLoaded", () => {
  buildCSVDropdown(CSV_FILES);

  // By default we use "links.csv".
  // If you want to read from a ?csv= param, do so here:
  const params = new URLSearchParams(window.location.search);
  let chosenCSV = params.get("csv");
  if (!chosenCSV || !CSV_FILES.includes(chosenCSV)) {
    chosenCSV = "links.csv";
  }

  // Set dropdown
  const csvSelect = document.getElementById("csvSelect");
  csvSelect.value = chosenCSV;

  // Fetch & process
  loadAndProcessCSV(chosenCSV);

  // (Optional) Set year, timestamp, etc. here if you like
  document.getElementById("year").textContent = new Date().getFullYear();
  const timestamp = document.getElementById("timestamp");
  const now = new Date();
  timestamp.textContent = `Refreshed: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
});

// 3) Build the dropdown menu in the navbar.
function buildCSVDropdown(fileList) {
  const csvSelect = document.getElementById("csvSelect");

  // Clear existing options, in case we reload
  csvSelect.innerHTML = "";

  fileList.forEach(filename => {
    const option = document.createElement("option");

    if (filename === "links.csv") {
      // Label it default or "links"
      option.value = filename;
      option.textContent = "links (default)";
    } else if (filename.startsWith("project_")) {
      // remove "project_" and ".csv" for display
      const displayName = filename
        .replace(/^project_/, "")
        .replace(/\.csv$/i, "");
      option.value = filename;
      option.textContent = displayName;
    } else {
      // fallback if there's another pattern
      option.value = filename;
      option.textContent = filename;
    }

    csvSelect.appendChild(option);
  });

  // Listen for changes (when the user picks a new file)
  csvSelect.addEventListener("change", (e) => {
    const newCSV = e.target.value;
    // Option A: reload page with ?csv= param
    window.location.search = `?csv=${encodeURIComponent(newCSV)}`;

    // Option B: do it purely client-side 
    // (Comment out the above line, then uncomment below)
    // loadAndProcessCSV(newCSV);
  });
}

// 4) Load the CSV file from the server, then call processCSVData from parser.js
function loadAndProcessCSV(csvFile) {
  fetch(csvFile + "?t=" + Date.now())
    .then(response => response.text())
    .then(csvText => {
      // processCSVData is defined in parser.js
      processCSVData(csvText);
    })
    .catch(err => console.error("Error loading CSV:", err));
}
