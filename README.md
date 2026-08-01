# 🎓 Student Management System (StudentMS)

A full-stack, production-ready **Student Management Application** built with **Node.js, Express, MongoDB**, and a high-performance **Vanilla JS & CSS Single Page Application (SPA)** frontend.

![NodeJS](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Express](https://img.shields.io/badge/Express.js-v5.0-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-v9.0-emerald.svg)
![License](https://img.shields.io/badge/License-ISC-purple.svg)

---

## 🌟 Key Features

### 💻 Frontend (Single Page Application)
* **📊 Real-time Dashboard**: Interactive metric counters for total enrolled students, active/inactive statuses, and course program counts.
* **🔍 Student Directory**: Live debouncing search engine by name, email, or course, with filtering by course and account status.
* **📄 Smart Pagination**: Slices dataset to 10 records per page for instantaneous DOM rendering.
* **✨ Glassmorphism Shimmer Loading**: Skeleton loading shimmers during data fetching for enhanced UX.
* **🎨 Modern UI Theme**: High-contrast Dark Charcoal (`#181216`) and Muted Amaranth Rose (`#9D7E8F`) color palette with light/dark mode persistence.
* **🛡️ Session-Aware Navigation**: Guest browsing mode support and automatic route protection.

### ⚙️ Backend (RESTful API & Security)
* **🔐 Robust Authentication**: JWT (JSON Web Tokens) with password hashing using `bcryptjs` (salt 10).
* **🛑 Rate Limiting**: Protection against brute-force attacks on login and registration endpoints.
* **🛡️ Security Headers**: Configured with `helmet` and `cors` for cross-origin security.
* **🗄️ Instant Revocation**: Account deletion endpoint immediately invalidates active JWT tokens.
* **🔌 Offline Fallback**: Automatic local storage fallback with demo data when MongoDB is offline.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Framework** | Node.js, Express.js |
| **Database & ODM** | MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Token (JWT), bcryptjs |
| **Security & Utilities**| Helmet, CORS, Express-Rate-Limit |
| **Frontend Core** | Vanilla JavaScript (ES6+), HTML5 |
| **Styling & Design** | Vanilla CSS3 (CSS Variables, Flexbox, Grid, Glassmorphism) |

---

## 📂 Project Structure

```text
STUDENT MANAGEMENT APP/
├── Backend/
│   ├── config/
│   │   ├── db.js             # MongoDB Mongoose connection driver
│   │   └── logger.js         # Winston logging system
│   ├── controllers/
│   │   ├── authController.js # Signup, Login & Account Deletion logic
│   │   └── studentController.js # Student CRUD operations
│   ├── middleware/
│   │   ├── errorHandler.js   # Centralized error handler
│   │   └── requireAuth.js    # JWT authorization middleware
│   ├── models/
│   │   ├── Student.js        # Student record Mongoose schema
│   │   └── User.js           # User account schema with bcrypt pre-save hook
│   ├── routes/
│   │   ├── authRoutes.js     # Auth API routes (/auth/signup, /auth/login)
│   │   └── studentRoutes.js  # Student API routes (/students)
│   ├── .env                  # Backend environment configuration
│   └── server.js             # Main Express server entry point
├── Frontend/
│   ├── index.html            # Main Dashboard SPA layout
│   ├── login.html            # Sign In view
│   ├── register.html         # Student Registration view
│   ├── app.js                # Core SPA state, DOM caching, and table pagination
│   ├── auth.js               # Client authentication & form handlers
│   └── styles.css            # Dark Charcoal & Amaranth Rose design system
├── nodemon.json              # Hot-reloading watcher configuration
├── package.json              # Root script orchestrator & dependencies
└── README.md                 # Project documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **MongoDB** (Running locally on `127.0.0.1:27017` or Atlas cluster)

### 1. Installation
Clone or navigate to the project directory and install dependencies:

```bash
# Install root & backend dependencies
npm install
```

### 2. Configure Environment
Create a `.env` file inside the `Backend/` directory:

```env
PORT=5000
MONGODB_URL=mongodb://127.0.0.1:27017/student-management
JWT_SECRET=supersecretjwtkey_student_management_2026
JWT_EXPIRES_IN=7d
```

### 3. Run Development Server
Start the application with hot-reloading:

```bash
# Run server with auto-reloader (Nodemon)
npm run dev
```

Open your browser at:
👉 **`http://localhost:5000`**

---

## 📡 API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Register a new student account | Public |
| `POST` | `/auth/login` | Sign in & receive JWT bearer token | Public |
| `DELETE` | `/auth/account` | Permanently delete account & invalidate JWT | Protected |

### Student Records Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/students` | Fetch all student records | Public |
| `GET` | `/students/:id` | Fetch single student profile by ID | Public |
| `POST` | `/students` | Create a new student record | Protected |
| `PUT` | `/students/:id` | Update student profile details | Protected |
| `DELETE` | `/students/:id` | Delete student record | Protected |

---

## 📜 License

Distributed under the **ISC License**. Free for educational and commercial use.
