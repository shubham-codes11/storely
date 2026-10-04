Storely - Store Rating and Management Platform

A full-stack web application where users can browse stores, submit ratings, and store owners can track their performance. Admins can manage users and stores from a central dashboard.

---

Tech Stack

Backend: Node.js, Express.js, JWT Authentication, bcrypt
Database: SQLite (better-sqlite3) with foreign keys and indexed tables
Frontend: React, Vite, Tailwind CSS, Framer Motion, Lucide Icons

---

How to Run

Step 1 - Install dependencies:

  npm install --prefix server
  npm install --prefix client

Step 2 - Start the backend server:

  cd server
  node index.js

  Server runs on: http://localhost:5001

Step 3 - Start the frontend:

  cd client
  npm run dev

  App runs on: http://localhost:5173

---

Login Credentials

Role               | Email                        | Password
Admin              | admin@verifiedreviews.com    | Admin@123
Store Owner        | owner@apexelectronics.com    | Owner@123
Normal User        | user@example.com             | User@123

Note: There is a quick account switcher bar at the top of the app for fast role switching during testing.

---

Features

Admin:
- View total users, stores, and submitted ratings on the dashboard
- Add new users (Normal User, Admin, Store Owner) with full form validation
- Add new stores and assign owners
- View full user and store directory with search, filter by role, and column sorting
- View detailed profile of any user including their store rating if they are a store owner

Normal User:
- Register a new account (name, email, address, password with rules)
- Login with a single login form shared across all roles
- Browse all stores, search by name or address
- Filter stores by category or rating (4.5 and above)
- Submit a rating (1 to 5 stars) for any store
- Modify a previously submitted rating
- Update account password

Store Owner:
- View average store rating on an animated circular chart
- See a full list of customers who rated the store with their score and comment
- Reply to customer reviews
- Update account password

---

Form Validation Rules

Name: minimum 20 characters, maximum 60 characters
Address: maximum 400 characters
Password: 8 to 16 characters, must have at least one uppercase letter and one special character
Email: standard email format
Rating: whole number between 1 and 5

These rules are enforced on both the frontend and the backend.

---

Database

Tables: users, stores, ratings
Relations: ratings linked to users and stores via foreign keys
Constraints: unique emails, rating range check, role check
Indexes on store name, address, and rating foreign keys for fast search
