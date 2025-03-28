
# Project Overview

This project dynamically generates a bookmarks webpage by parsing a CSV file and using JavaScript to create a clean display of links. Why Did I make this? I dont know. 

## File Structure
- **bookmarks.html**: HTML template for the bookmarks page.
- **parser.js**: JavaScript file responsible for parsing `links.csv` and generating the dynamic content for `bookmarks.html`.
- **links.csv**: CSV file containing the data used to build the webpage. Update this file to modify the content displayed on the page.

## CSV Format Overview
The CSV file should include the following columns:

- **sectionOrder** (Optional): Defines the display order of sections on the webpage. Lower numbers appear higher on the page. If not provided, sections are sorted alphabetically.
- **section** (Required): The name of each section on the webpage.
- **parent** (Optional): Specifies the parent link for a hierarchical structure. Child items will be nested under their parent.  
  *Note: Altering the `linkOrder` in combination with the `parent` field might lead to unexpected behavior.*
- **linkOrder** (Optional): Determines the display order of links within a section. Lower numbers are shown first. If omitted, links are sorted alphabetically.
- **name** (Required): The text that will be displayed for the hyperlink.
- **link** (Optional): The URL that the hyperlink directs to.
- **summary** (Optional): Additional notes or comments about the link. HTML tags (e.g., `<br>`) can be used for formatting if needed.

### Example Structure
| sectionOrder | section | parent | linkOrder | name | link | summary |
|--------------|---------|--------|-----------|------|------|---------|
| 1 | Tools |  |  | Draw.io | need to update | Internal Tool for Diagramming |


## Notes & Troubleshooting
- **Caching Considerations**: Updates to `parser.js` and `links.csv` might not immediately appear on GitHub Pages due to browser and server caching. If changes are not visible, try clearing your cache or performing a hard refresh.

## Roadmap?
- Settings Page (For making custom order, stored in a local cookie)
- Make the cvs file cleaner and more sustainable?
