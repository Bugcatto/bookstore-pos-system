<<<<<<< HEAD
# Bookstore POS System

A lightweight **Point of Sale (POS) and Inventory system** built on **Google Apps Script** + **Google Sheets**.  
The system powers **Tan Tan Sparadise / Little Leaders Bookstore**, with separate modules for POS, inventory, member management, and form handling.  
Each module is its own Apps Script project (pulled locally using `clasp`) but follows a consistent structure.

---

## ✨ Features
- 📦 **Inventory Management**  
  - Track stock in/out with conditions (New, Like New, Good, Fair, Poor)  
  - Spreadsheet-driven inventory sheets (`LLBS Inventory Management`)  

- 💰 **Sales & Returns**  
  - POS system (`LLBS POS`) with ISBN/Name search  
  - Strict stock blocking (no oversell)  
  - Negative quantities for returns (restocks & negative revenue/tax)  
  - Order-level discounts (proportional allocation)  
  - Tax calculation after discounts  

- 📖 **Membership System**  
  - `LLBS Member Database` for library & bookstore members  
  - Tracks membership tiers, access, and renewals  

- 📝 **Form Controller**  
  - Handles Google Form submissions  
  - Connects data pipelines to inventory and membership  

- 📊 **Sheet Templates**  
  - `LLBS Sheet Template` for creating new modules quickly  

---

## 📂 Project Structure

This repository contains multiple **Apps Script projects**, one per Google Sheet.  
Each project always includes:  
- `appsscript.json` → project manifest  
- `Initial setup.gs` → one-time initialization logic  

Other files vary by module (`Code.gs`, `index.html`, `Form.gs`, etc.).

bookstore-pos-system/
│
├── DO_NOT_TOUCH_LLBS/ # Core system (reserved, do not modify)
│ ├── appsscript.json
│ ├── Initial setup.gs
│ └── ... (other scripts/UI files)
│
├── LLBS_Sheet_Template/ # Template for new sheet projects
│ ├── appsscript.json
│ ├── Initial setup.gs
│ └── ... (other scripts/UI files)
│
├── LLBS_Member_Database/ # Membership system
│ ├── appsscript.json
│ ├── Initial setup.gs
│ └── ... (other scripts/UI files)
│
├── Form_Controller/ # Handles form submissions & routing
│ ├── appsscript.json
│ ├── Initial setup.gs
│ └── ... (other scripts/UI files)
│
├── LLBS_Inventory_Management/ # Stock & inventory tracking
│ ├── appsscript.json
│ ├── Initial setup.gs
│ └── ... (other scripts/UI files)
│
└── LLBS_POS/ # Point-of-Sale (sales & rentals)
├── appsscript.json
├── Initial setup.gs
└── ... (other scripts/UI files)


---

## 🚀 Getting Started
1. Clone this repo:
   ```bash
   git clone https://github.com/Bugcatto/bookstore-pos-system.git
Install clasp
 if not already:
=======
\# Bookstore POS System



A lightweight \*\*Point of Sale (POS) and Inventory system\*\* built on \*\*Google Apps Script\*\* + \*\*Google Sheets\*\*.  

The system powers \*\*Tan Tan Sparadise / Little Leaders Bookstore\*\*, with separate modules for POS, inventory, member management, and form handling.  

Each module is its own Apps Script project (pulled locally using `clasp`) but follows a consistent structure.



---



\## ✨ Features

\- 📦 \*\*Inventory Management\*\*  

&nbsp; - Track stock in/out with conditions (New, Like New, Good, Fair, Poor)  

&nbsp; - Spreadsheet-driven inventory sheets (`LLBS Inventory Management`)  



\- 💰 \*\*Sales \& Returns\*\*  

&nbsp; - POS system (`LLBS POS`) with ISBN/Name search  

&nbsp; - Strict stock blocking (no oversell)  

&nbsp; - Negative quantities for returns (restocks \& negative revenue/tax)  

&nbsp; - Order-level discounts (proportional allocation)  

&nbsp; - Tax calculation after discounts  



\- 📖 \*\*Membership System\*\*  

&nbsp; - `LLBS Member Database` for library \& bookstore members  

&nbsp; - Tracks membership tiers, access, and renewals  



\- 📝 \*\*Form Controller\*\*  

&nbsp; - Handles Google Form submissions  

&nbsp; - Connects data pipelines to inventory and membership  



\- 📊 \*\*Sheet Templates\*\*  

&nbsp; - `LLBS Sheet Template` for creating new modules quickly  



---



\## 📂 Project Structure



This repository contains multiple \*\*Apps Script projects\*\*, one per Google Sheet.  

Each project always includes:  

\- `appsscript.json` → project manifest  

\- `Initial setup.gs` → one-time initialization logic  



Other files vary by module (`Code.gs`, `index.html`, `Form.gs`, etc.).



bookstore-pos-system/

│

├── DO\_NOT\_TOUCH\_LLBS/ # Core system (reserved, do not modify)

│ ├── appsscript.json

│ ├── Initial setup.gs

│ └── ... (other scripts/UI files)

│

├── LLBS\_Sheet\_Template/ # Template for new sheet projects

│ ├── appsscript.json

│ ├── Initial setup.gs

│ └── ... (other scripts/UI files)

│

├── LLBS\_Member\_Database/ # Membership system

│ ├── appsscript.json

│ ├── Initial setup.gs

│ └── ... (other scripts/UI files)

│

├── Form\_Controller/ # Handles form submissions \& routing

│ ├── appsscript.json

│ ├── Initial setup.gs

│ └── ... (other scripts/UI files)

│

├── LLBS\_Inventory\_Management/ # Stock \& inventory tracking

│ ├── appsscript.json

│ ├── Initial setup.gs

│ └── ... (other scripts/UI files)

│

└── LLBS\_POS/ # Point-of-Sale (sales \& rentals)

├── appsscript.json

├── Initial setup.gs

└── ... (other scripts/UI files)





---



\## 🚀 Getting Started

1\. Clone this repo:

&nbsp;  ```bash

&nbsp;  git clone https://github.com/Bugcatto/bookstore-pos-system.git

Install clasp

&nbsp;if not already:


>>>>>>> 8735bd3 (chore: initial commit with README and .gitignore)

npm install -g @google/clasp


<<<<<<< HEAD
Authenticate clasp with your Google account:

clasp login


For each module folder (e.g. LLBS_POS/), pull the Apps Script project:

cd LLBS_POS
clasp pull


Make edits locally (.gs, .html, etc.).

Push changes back:

clasp push


Deploy via the Apps Script editor if you need to update the web app.

##🛠️ Tech Stack

Google Apps Script (backend & automation)

Google Sheets (data storage)

HTML / CSS / JavaScript (frontend UIs via web apps)

Google Forms (integrated with Form Controller)

##📌 Roadmap

 Add rental module (track rental start/end, fees, deposits)

 Receipt printing integration

 Member portal for self-service access

 Enhanced reporting (sales by category, inventory aging)

 Multi-store synchronization (future expansion)

##🤝 Contributing

Contributions, issues, and feature requests are welcome!

To contribute:

Fork the repo

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

##📜 License

MIT License

Copyright (c) 2025 Bugcatto

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


---

👉 Next step: save this as `README.md` at the root of your repo, then run:

```bash
git add README.md
git commit -m "docs: update README with multi-project clasp structure"
git push origin main
=======



Authenticate clasp with your Google account:



clasp login





For each module folder (e.g. LLBS\_POS/), pull the Apps Script project:



cd LLBS\_POS

clasp pull





Make edits locally (.gs, .html, etc.).



Push changes back:



clasp push





Deploy via the Apps Script editor if you need to update the web app.



\##🛠️ Tech Stack



Google Apps Script (backend \& automation)



Google Sheets (data storage)



HTML / CSS / JavaScript (frontend UIs via web apps)



Google Forms (integrated with Form Controller)



\##📌 Roadmap



&nbsp;Add rental module (track rental start/end, fees, deposits)



&nbsp;Receipt printing integration



&nbsp;Member portal for self-service access



&nbsp;Enhanced reporting (sales by category, inventory aging)



&nbsp;Multi-store synchronization (future expansion)



\##🤝 Contributing



Contributions, issues, and feature requests are welcome!



To contribute:



Fork the repo



Create a feature branch (git checkout -b feature/amazing-feature)



Commit your changes (git commit -m 'Add some amazing feature')



Push to the branch (git push origin feature/amazing-feature)



Open a Pull Request



\##📜 License



MIT License



Copyright (c) 2025 Bugcatto



Permission is hereby granted, free of charge, to any person obtaining a copy

of this software and associated documentation files (the "Software"), to deal

in the Software without restriction, including without limitation the rights

to use, copy, modify, merge, publish, distribute, sublicense, and/or sell

copies of the Software, and to permit persons to whom the Software is

furnished to do so, subject to the following conditions:



The above copyright notice and this permission notice shall be included in all

copies or substantial portions of the Software.



THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR

IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,

FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE

AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER

LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,

OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE

SOFTWARE.





---



👉 Next step: save this as `README.md` at the root of your repo, then run:



```bash

git add README.md

git commit -m "docs: update README with multi-project clasp structure"

git push origin main

>>>>>>> 8735bd3 (chore: initial commit with README and .gitignore)
