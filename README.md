# 👨‍👩‍👧‍👦 Family Tree Application (React)

A simple yet powerful **Family Tree Management Application** built using **React**.  
It allows you to add, edit, delete members, assign parents, visualize the tree hierarchy, view detailed relationships, and import/export full family data.

This app is designed with clean UI, gender-specific dropdown logic, and a clear readable family tree structure.

---

## 🚀 Features

### 🔹 1. Add Family Members  
You can store:
- Name  
- Gender  
- Date of Birth  
- Father (only male members shown)  
- Mother (only female members shown)

### 🔹 2. Edit & Delete Members  
Easily update records or remove members.  
If a parent is deleted, children remain but lose the parent reference.

### 🔹 3. Auto Tree Generation  
The app automatically generates a **text-based hierarchical tree**:

Purroshottam (♂)
└─ Vinod (♂)
└─ Subhash (♂)


### 🔹 4. Member Detailed View  
Selecting any member shows:
- Gender + Symbol  
- Date of Birth  
- Parents  
- Children  
- Siblings  

### 🔹 5. Import / Export JSON  
Quickly:
- Copy entire family dataset  
- Paste JSON to import a tree  
- Download as JSON file  

### 🔹 6. Clean Modern UI  
- Attractive Teal–Indigo theme  
- Responsive layout  
- Font Awesome icons for gender  
- Full-width dropdowns  
- Smooth shadows & spacing  

---

## 🛠️ Tech Stack

- **React (Hooks)**
- **CSS3 (Custom styling)**
- **Font Awesome Icons**
- **LocalStorage** for permanent saved data

---

## 📂 Folder Structure

src/
├── App.jsx
├── App.css
├── index.js
└── assets/ (optional)
