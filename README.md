# Task Tracker API

A RESTful backend API for managing personal tasks. Users can create 
an account, log in securely, and manage their own tasks. Each user 
only has access to their own data. Tasks can be created, updated, 
deleted, searched, sorted, and filtered. The API also supports bulk 
operations, allowing multiple tasks to be updated or deleted in a 
single request.

## Tech Stack

- Node.js & Express
- Prisma ORM
- PostgreSQL (Neon.tech for production)
- JSON Web Tokens (JWT) for authentication
- Deployed on Render

## Features

- User registration and authentication with JWT and CSRF protection
- Full CRUD operations for tasks
- Pagination and search filtering
- Sorting by task fields in ascending or descending order
- Bulk update multiple tasks at once
- Bulk delete multiple tasks at once
- Authorization scoped to the logged in user

## Deployed Backend

https://my-task-tracker.onrender.com

## Setup Instructions

1. Clone the repository and switch to the assignment11 branch:
   git clone <your-repo-url>
   git checkout assignment11

2. Install dependencies:
   npm install

3. Create a .env file in the root with the following variables:

## Environment Variables

DB_URL=                  # PostgreSQL connection string for nodehomework database
DATABASE_URL=            # PostgreSQL connection string (Neon URL for production)
TEST_DATABASE_URL=       # PostgreSQL connection string for test database
JWT_SECRET=              # Secret key for signing JWT tokens
RECAPTCHA_SECRET_KEY=    # Google reCAPTCHA secret key
RECAPTCHA_BYPASS=        # Random 32-character string for bypassing reCAPTCHA in tests


4. Run Prisma migrations:
   npx prisma migrate deploy

5. Start the server:
   npm start

## Authentication

This API uses JWT tokens stored in HTTP-only cookies. All task routes 
require authentication. Write requests also require an X-CSRF-TOKEN 
header. To authenticate:

1. Register: POST /api/users/register
2. Log in: POST /api/users/logon — returns a csrfToken in the response
3. Include the csrfToken as X-CSRF-TOKEN header on all write requests

## API Endpoints

### Users
- POST /api/users/register — create a new account
- POST /api/users/logon — log in
- POST /api/users/logoff — log out

### Tasks
- GET /api/tasks — get all tasks (supports pagination, search, sorting)
- POST /api/tasks — create a task
- GET /api/tasks/:id — get a single task
- PATCH /api/tasks/:id — update a task
- DELETE /api/tasks/:id — delete a task
- PATCH /api/tasks/bulk — bulk update tasks
- DELETE /api/tasks/bulk — bulk delete tasks

## Additional Features

**Bulk Update** — PATCH /api/tasks/bulk
Body: { "ids": [1, 2, 3], "isCompleted": true }
Updates multiple tasks at once. Only affects tasks belonging to the 
authenticated user.

**Bulk Delete** — DELETE /api/tasks/bulk  
Body: { "ids": [1, 2, 3] }
Deletes multiple tasks at once. Only affects tasks belonging to the 
authenticated user.