# 🎓 Student Management System (StudentMS)

A full-stack, production-ready **Student Management Application** built with **Node.js, Express, MongoDB**, and a high-performance **Vanilla JS & CSS Single Page Application (SPA)** frontend.

![NodeJS](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Express](https://img.shields.io/badge/Express.js-v5.0-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-v9.0-emerald.svg)
![License](https://img.shields.io/badge/License-ISC-purple.svg)

---


### ⚙️ Backend (RESTful API & Database)
* **🔐 Authentication**: JWT (JSON Web Tokens) with password hashing via `bcryptjs`.
* **🛑 Rate Limiting & Security**: Rate-limited authentication routes with `helmet` and `cors` security headers.
* **🗄️ MongoDB Database**: Mongoose schemas for Students, Teachers, Attendance, Fees, Grades, and Users.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Framework** | Node.js, Express.js |
| **Database & ODM** | MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Token (JWT), bcryptjs |
| **Security & Utilities** | Helmet, CORS, Express-Rate-Limit |
| **Frontend Core** | Vanilla JavaScript (ES6+), HTML5 |
| **Styling & Design** | Vanilla CSS3 (CSS Variables, Flexbox, Grid, Glassmorphism) |

---

## 📂 Project Structure

```text
STUDENT MANAGEMENT APP/
├── Backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection driver
│   ├── controllers/
│   │   ├── authController.js     # Signup, Login & Account Deletion logic
│   │   ├── studentController.js  # Student CRUD operations
│   │   ├── teacherController.js  # Faculty management operations
│   │   ├── attendanceController.js # Roll-call attendance logger
│   │   ├── feeController.js      # Fee invoice & receipt generator
│   │   └── gradeController.js    # Exam marks & GPA calculator
│   ├── middleware/
│   │   ├── errorHandler.js       # Centralized error handler
│   │   └── requireAuth.js        # JWT authorization middleware
│   ├── models/
│   │   ├── Student.js            # Student record Mongoose schema
│   │   ├── User.js               # User account Mongoose schema
│   │   ├── Teacher.js            # Faculty Mongoose schema
│   │   ├── Attendance.js         # Daily attendance schema
│   │   ├── Fee.js                # Tuition fee invoice schema
│   │   └── Grade.js              # Subject marks & GPA schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth API routes (/auth)
│   │   ├── studentRoutes.js      # Student API routes (/students)
│   │   ├── teacherRoutes.js      # Teacher API routes (/teachers)
│   │   ├── attendanceRoutes.js   # Attendance API routes (/attendance)
│   │   ├── feeRoutes.js          # Fee API routes (/fees)
│   │   └── gradeRoutes.js        # Grade API routes (/grades)
│   ├── .env                      # Backend environment configuration
│   └── server.js                 # Main Express server entry point
├── Frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css        # Master design system stylesheet
│   │   └── js/
│   │       ├── app.js            # Core SPA application engine
│   │       └── auth.js           # Client login & signup script
│   ├── pages/
│   │   ├── login.html            # Dedicated Sign In view
│   │   └── register.html         # Dedicated Student Registration view
│   └── index.html                # Main SPA Dashboard layout
├── .gitignore                    # Git ignore file
├── run.bat                       # 1-Click launcher shortcut
├── start-app.bat                 # Windows batch launcher (Starts server & opens browser)
└── README.md                     # Project documentation
```

---

## 📥 Installation

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **MongoDB** (Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas)

### Step 1: Clone or Open Project
Navigate to the root project folder in your terminal:

```bash
cd "STUDENT MANAGEMENT APP"
```

### Step 2: Install Backend Dependencies
Install all required Node.js packages in the `Backend/` directory:

```bash
cd Backend
npm install
cd ..
```

### Step 3: Configure Environment Variables
Create or verify the `.env` file in `Backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/student_management_db
JWT_SECRET=supersecretjwtkey_student_management_2026
JWT_EXPIRES_IN=7d
```

---

## 🚀 Running the Application

### Method 1: 1-Click Launcher (Windows Batch Script)
Simply double-click **`start-app.bat`** or **`run.bat`** in File Explorer!
- Starts the Express backend server on `http://localhost:5000`.
- Automatically opens `http://localhost:5000` in your default browser.

```powershell
.\start-app.bat
```

### Method 2: Command Line (Node.js)
Start the Express server directly via Node:

```bash
node Backend/server.js
```

Or using Nodemon (for development hot-reloading):

```bash
cd Backend
npm run dev
```

Open your browser at:
👉 **`http://localhost:5000`**

---


---

## 📜 License

Distributed under the **ISC License**. Free for educational and commercial use.
