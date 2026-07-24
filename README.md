# Student Management App

A simple Student Management application with a Node.js/Express backend and MongoDB (Mongoose). It provides CRUD APIs for managing students.

## Features

- REST API for Students
- MongoDB persistence using Mongoose
- Request logging with Morgan
- Error + request logging with Winston (writes to `app.log` and `error.log`)

## Tech Stack

- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Logging: Morgan, Winston
- CORS: `cors`

## Prerequisites

- Node.js installed
- MongoDB running locally **or** a hosted MongoDB connection string

## Backend Setup

1. Install dependencies (from the project root or backend folder):
   - Backend folder is `Backend/`

2. Environment variables

Create a `.env` file (the code reads from `process.env`):

```env
MONGODB_URL=mongodb://localhost:27017/student-management
PORT=5000
```

Notes:
- If `MONGODB_URL` is not provided, it defaults to `mongodb://localhost:27017/student-management`.
- If `PORT` is not provided, it defaults to `5000`.

3. Run the backend

Start the server (you can use the way you already use in your project). The server will listen on:
- `http://localhost:5000`

## API Documentation

### Create Student
**POST** `/students`

Request body (JSON):

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "course": "Computer Science",
  "enrollmentDate": "2024-01-15",
  "status": "active"
}
```

- `name` (required)
- `email` (required, unique)
- `course` (required)
- `enrollmentDate` (required)
- `status` (optional, enum: `active` | `inactive`, default: `active`)

### Get All Students
**GET** `/students`

Response: array of students.

### Get Single Student
**GET** `/students/:id`

- `:id` must be a valid MongoDB ObjectId

Returns:
- `200` with student JSON
- `404` with `{ "message": "Student not found" }` if not found

### Update Student
**PUT** `/students/:id`

Request body: fields to update (same schema fields as create).

Response:
- `200` with updated student JSON

### Delete Student
**DELETE** `/students/:id`

Response:

```json
{ "message": "Student deleted successfully" }
```

## Logging

The server uses Winston and writes:

- `app.log` (info-level)
- `error.log` (error-level)

## Folder Notes

- Backend code: `Backend/server.js` (Modular entry point)

## Common Errors

- **MongoDB connection error**: ensure MongoDB is running and `MONGODB_URL` is correct.
- **Duplicate email**: `email` is marked as `unique` in the schema.
- **Invalid ObjectId**: endpoints using `/:id` expect a valid MongoDB ObjectId.

