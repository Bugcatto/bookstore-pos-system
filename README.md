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

