# Bookstore POS System

A lightweight **Point of Sale (POS) system** built on **Google Apps Script** + **Google Sheets** for managing sales, rentals, and inventory at a bookstore.  
Designed for **Tan Tan Sparadise / Little Leaders Bookstore**, this project focuses on simple, spreadsheet-driven workflows with no external server dependencies.

---

## ✨ Features
- 📦 **Inventory Management**  
  - Track stock in/out with conditions (New, Like New, Good, Fair, Poor)  
  - Separate sheets for `Sales`, `Inventory List`, and `Items`

- 💰 **Sales & Returns**  
  - Search books by **ISBN** or **Name**  
  - Strict **stock blocking** (no oversell)  
  - Support for **negative quantities** (returns → restocks & negative revenue/tax)  
  - Order-level discounts (allocated proportionally across items)  
  - Tax calculation after discounts

- 📖 **Rentals** *(coming soon)*  
  - Handle rental transactions alongside sales  

- 📊 **Google Sheets Integration**  
  - All data (sales, stock, items) managed in one spreadsheet  
  - No external database required

---

## 📂 Project Structure
- `index.html` → POS user interface  
- `app.js` → Client-side app logic  
- `Code.gs` → Google Apps Script backend (business rules, spreadsheet integration)  
- `Sales` sheet → Line-level transactions  
- `Inventory List` sheet → Stock management  
- `Items` sheet → Book catalog (ISBN, Name, Type, Price)

---

## 🚀 Getting Started
1. Clone this repo:
   ```bash
   git clone https://github.com/Bugcatto/bookstore-pos-system.git
