// ==============================
// parser.js
// ==============================
/**
 * A CSV-to-array function.
 * This regex handles basic CSV formatting including quoted fields.
 */
function csvToArray(strData, strDelimiter) {
  strDelimiter = strDelimiter || ",";
  const objPattern = new RegExp(
    // Delimiters.
    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
      // Quoted fields.
      "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
      // Standard fields.
      "([^\"\\" + strDelimiter + "\\r\\n]*))",
    "gi"
  );

  const arrData = [[]];
  let arrMatches = null;

  while ((arrMatches = objPattern.exec(strData))) {
    const matchedDelimiter = arrMatches[1];
    if (matchedDelimiter.length && matchedDelimiter !== strDelimiter) {
      // Start a new row if the delimiter is a newline.
      arrData.push([]);
    }
    let matchedValue;
    if (arrMatches[2]) {
      // Quoted value – unescape any double quotes.
      matchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
    } else {
      // Non-quoted value.
      matchedValue = arrMatches[3];
    }
    arrData[arrData.length - 1].push(matchedValue);
  }
  return arrData;
}

/**
 * Processes the CSV text:
 *  - Converts CSV rows to objects using the header row.
 *  - Groups items by section.
 *  - Sorts sections by sectionOrder (or alphabetically) and links by linkOrder (or alphabetically).
 *  - Calls functions to build the navigation and content.
 *
 * Usage: 
 *   1) Fetch or otherwise load the CSV text in another script.
 *   2) Pass the CSV text to this function, e.g. processCSVData(csvText).
 */
function processCSVData(csvText) {
  const rows = csvToArray(csvText);
  if (rows.length < 2) {
    console.error("CSV does not contain enough rows.");
    return;
  }
  const header = rows[0];
  const dataRows = rows.slice(1);
  
  // Convert rows to objects keyed by header names.
  const items = dataRows.map(row => {
    const obj = {};
    header.forEach((col, i) => {
      obj[col.trim()] = row[i] ? row[i].trim() : "";
    });
    return obj;
  });

  // Group items by their "section"
  const sections = {};
  items.forEach(item => {
    // 1. Check if this row is entirely blank (all fields empty)
    const isBlankRow = Object.values(item).every(val => !val.trim());
    if (isBlankRow) {
      console.log("Skipping blank row:", item);
      return; // Stop processing this row
    }

    console.log("Parsed item:", item);
    // 2. Determine the section name (or mark as error if empty)
    let sectionName = item.section;
    if (!sectionName || sectionName.trim() === "") {
      sectionName = "***ERROR: UNDEFINED***";
    }

    // 3. If this section doesn't exist yet, create it
    if (!sections.hasOwnProperty(sectionName)) {
      sections[sectionName] = {
        sectionOrder: item.sectionOrder ? parseInt(item.sectionOrder) : Infinity,
        name: sectionName,
        items: []
      };
    }

    // 4. Push the current item into the appropriate section
    sections[sectionName].items.push(item);
  });

  // Convert the sections object to an array and sort by sectionOrder, then alphabetically.
  const sectionArray = Object.values(sections);
  sectionArray.sort((a, b) => a.sectionOrder - b.sectionOrder || a.name.localeCompare(b.name));

  // Within each section, sort the items by linkOrder (or alphabetically if missing).
  sectionArray.forEach(section => {
    section.items.sort((a, b) => {
      const orderA = a.linkOrder ? parseInt(a.linkOrder) : Infinity;
      const orderB = b.linkOrder ? parseInt(b.linkOrder) : Infinity;
      return orderA - orderB || a.name.localeCompare(b.name);
    });
  });

  // Build the navigation bar and main content
  buildNavigation(sectionArray);
  buildContent(sectionArray);
}

/**
 * Creates navigation links for each section.
 */
function buildNavigation(sections) {
  const nav = document.getElementById("navbar");
  // Optionally clear any old links if needed
  // const oldLinks = nav.querySelectorAll("a");
  // oldLinks.forEach(a => a.remove());

  sections.forEach(section => {
    const a = document.createElement("a");
    // Create an anchor link based on the section name.
    a.href = "#" + section.name.toLowerCase().replace(/\s+/g, "-");
    a.textContent = section.name;
    nav.appendChild(a);
  });
}

/**
 * Builds the main content area by creating sections and lists of bookmarks.
 * Items with a parent value are nested under that parent.
 */
function buildContent(sections) {
  const content = document.getElementById("content");
  // Optionally clear old content if reloading
  // content.innerHTML = "";

  sections.forEach(section => {
    const sectionEl = document.createElement("section");
    sectionEl.id = section.name.toLowerCase().replace(/\s+/g, "-");

    const h2 = document.createElement("h2");
    h2.textContent = section.name;
    sectionEl.appendChild(h2);

    // Create a mapping of items by name, initializing an empty children array for nesting.
    const itemsByName = {};
    section.items.forEach(item => {
      itemsByName[item.name] = { ...item, children: [] };
    });

    // Build a tree structure based on the "parent" field.
    const roots = [];
    section.items.forEach(item => {
      if (item.parent) {
        if (itemsByName[item.parent]) {
          itemsByName[item.parent].children.push(itemsByName[item.name]);
        } else {
          // If the parent isn't found in the section, treat this item as a root.
          roots.push(itemsByName[item.name]);
        }
      } else {
        roots.push(itemsByName[item.name]);
      }
    });

    // Recursive function to create nested lists.
    function createList(items) {
      const ul = document.createElement("ul");
      items.forEach(item => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.classList.add("bookmark-link");
        a.textContent = item.name;
        a.href = item.link ? item.link : "#";
        // These two lines open links in a new tab.
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        li.appendChild(a);

        if (item.summary) {
          const summarySpan = document.createElement("span");
          summarySpan.classList.add("summary");
          // Using innerHTML allows <br> tags in the summary to be rendered
          summarySpan.innerHTML = item.summary;
          li.appendChild(summarySpan);
        }
        if (item.children && item.children.length > 0) {
          li.appendChild(createList(item.children));
        }
        ul.appendChild(li);
      });
      return ul;
    }

    // Append the root items list to the section element.
    const list = createList(roots);
    sectionEl.appendChild(list);
    content.appendChild(sectionEl);
  });
}
