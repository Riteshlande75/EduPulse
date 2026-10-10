# 🎓 Student Management System (StudentMS)

A full-stack, production-ready **Student Management Application** built with **Node.js, Express, MongoDB**, and a high-performance **Vanilla JS & Tailwind CSS Single Page Application (SPA)** frontend.

![NodeJS](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Express](https://img.shields.io/badge/Express.js-v5.0-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-v9.0-emerald.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v3.0-38B2AC.svg)
![License](https://img.shields.io/badge/License-ISC-purple.svg)

> 📘 **Looking for full system architecture, API matrix, schemas, and module breakdowns?**  
> Check out the complete technical guide in **[`documentation.md`](./Documentation.md)**.

---

## 📋 Prerequisites

Before setting up the project, make sure you have the following installed on your machine:

* **[Node.js](https://nodejs.org/)** (v18.0.0 or higher)
* **[npm](https://www.npmjs.com/)** (Included with Node.js)
* **[MongoDB](https://www.mongodb.com/try/download/community)** (Running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas cloud connection)

---

## 📥 Project Setup & Installation

### Step 1: Open the Project Directory
Open your terminal or PowerShell and navigate to the project root folder:

```bash
cd "STUDENT MANAGEMENT APP"
```

---

### Step 2: Install Dependencies
Install all required Node.js backend packages:

```bash
cd Backend
npm install
cd ..
```

*(Optional: If you also run scripts from root, run `npm install` in the root folder as well).*

---

### Step 3: Configure Environment Variables
Create or verify the `.env` file in the `Backend/` directory:

Create `Backend/.env`:

```env
# Server Port & Environment
PORT=5000
NODE_ENV=development

# Database Connection (MongoDB)
MONGO_URI=mongodb://127.0.0.1:27017/student_management_db

# JWT Authentication
JWT_SECRET=supersecretjwtkey_student_management_2026
JWT_EXPIRES_IN=7d
```

> 💡 *A template `.env.example` file is included in `Backend/.env.example` for reference.*

---

## 🚀 Running the Application

### Option A: 1-Click Launcher (Windows)
Double-click **`start-app.bat`** or **`run.bat`** in File Explorer, or execute in PowerShell:

```powershell
.\start-app.bat
```

* This automatically launches the Node.js Express server.
* Automatically opens your default web browser to `http://localhost:5000`.

---

### Option B: Command Line (Node.js)
From the project root directory, run:

```bash
node Backend/server.js
```

Or using **Nodemon** (for live hot-reloading during development):

```bash
cd Backend
npm run dev
```

---

## 🌐 Application Access Points

Once the server is running, open your web browser at:

| Page / Route | URL | Description |
| :--- | :--- | :--- |
| **Dashboard (SPA)** | [http://localhost:5000/](http://localhost:5000/) | Main Application Shell & Directory |
| **Student Sign In** | [http://localhost:5000/login](http://localhost:5000/login) | Student & Faculty Login Portal |
| **Registration** | [http://localhost:5000/register](http://localhost:5000/register) | New Student Account Creation |
| **API Health Check** | [http://localhost:5000/students](http://localhost:5000/students) | RESTful API Endpoints Root |

---

## 📖 Complete Documentation

For complete technical specifications, database schema diagrams, REST API documentation, security implementations, and functional module breakdowns, please read:

👉 **[View Full Documentation (`documentation.md`)](./Documentation.md)**

---

## 📜 License

Distributed under the **ISC License**. Free for educational and commercial use.
