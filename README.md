# Expensio Frontend

A modern, full-featured finance management web application built with React, Vite, and Material UI. This frontend interfaces with a Spring Boot backend to provide user authentication, expense tracking, category management, reporting, and more.

---

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [App Overview](#app-overview)
- [Routing](#routing)
- [Authentication](#authentication)
- [Theming](#theming)
- [API Proxy](#api-proxy)
- [Assets](#assets)
- [License](#license)

---

## Features
- **User Authentication** (JWT-based, login/register/logout)
- **Role-based Access** (Admin/User)
- **Expense Management** (CRUD, filtering, search)
- **Category Management** (CRUD)
- **User Management** (Admin only)
- **Dashboard** (Charts for expenses by month/category)
- **Reports** (Monthly, by user/category, exportable)
- **Settings** (Profile, password, preferences)
- **Responsive UI** (Material UI, dark/light mode)

---

## Project Structure
```
frontend/
  ├── public/           # Static assets (logo, etc.)
  ├── src/
  │   ├── assets/       # SVGs, images
  │   ├── components/   # Reusable UI components
  │   ├── context/      # React context (Auth)
  │   ├── pages/        # Route-level pages
  │   ├── App.jsx       # Main app, routing, layout
  │   ├── main.jsx      # React entry point
  │   ├── index.css     # Global styles
  │   └── App.css       # App-specific styles
  ├── package.json      # Project metadata & dependencies
  ├── vite.config.js    # Vite config (proxy, plugins)
  └── README.md         # This file
```

---

## Tech Stack
- **React 19**
- **Vite 7** (dev server, build)
- **Material UI (MUI)** (UI components)
- **MUI X Data Grid** (tables)
- **Recharts** (charts)
- **Axios** (API requests)
- **React Router v7** (routing)
- **Emotion** (styling)

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)
- Backend API running (see backend/README.md)

### Install dependencies
```bash
cd frontend
npm install
```

### Start the development server
```bash
npm run dev
```
- App runs at [http://localhost:5173](http://localhost:5173) by default.
- API requests to `/api` are proxied to the backend (see [API Proxy](#api-proxy)).

### Build for production
```bash
npm run build
```

---

## Available Scripts
- `npm run dev` – Start dev server with HMR
- `npm run build` – Build for production
- `npm run preview` – Preview production build
- `npm run lint` – Lint code with ESLint

---

## App Overview

### Pages
- **Login/Register** – User authentication
- **Dashboard** – Charts for expenses (monthly/category)
- **Expenses** – List, add, edit, delete expenses
- **Categories** – Manage expense categories
- **Reports** – Generate/export reports (monthly, by user/category)
- **Users** – Manage users (admin only)
- **Settings** – Profile, password, preferences

### Components
- **Sidebar** – Navigation drawer
- **ExpenseTable, CategoryTable, UserTable** – Data tables
- **ExpenseForm, CategoryForm, UserForm** – Forms for CRUD
- **FinanceBanner** – Animated banner/illustration
- **AuthContext** – Handles login, register, logout, JWT storage

---

## Routing
- Uses `react-router-dom` v7
- Protected routes for authenticated users
- Admin-only routes (e.g., `/users`)

| Path           | Component         | Auth | Admin Only |
|----------------|-------------------|------|------------|
| `/login`       | LoginPage         | No   | No         |
| `/register`    | RegisterPage      | No   | No         |
| `/`            | DashboardPage     | Yes  | No         |
| `/expenses`    | ExpensesPage      | Yes  | No         |
| `/categories`  | CategoriesPage    | Yes  | No         |
| `/reports`     | ReportsPage       | Yes  | No         |
| `/users`       | UsersPage         | Yes  | Yes        |
| `/settings`    | SettingsPage      | Yes  | No         |

---

## Authentication
- JWT-based, stored in `localStorage`
- `AuthContext` provides `login`, `register`, `logout`, and user info
- Axios interceptor attaches JWT to all API requests

---

## Theming
- Material UI custom theme
- Light/dark mode toggle (remembers system preference)
- Custom gradients, rounded corners, modern look

---

## API Proxy
- Vite dev server proxies `/api` requests to backend (`http://localhost:8080`)
- See `vite.config.js`

---

## Assets
- Place static images (e.g., logo.png) in `public/`
- SVGs and illustrations in `src/assets/`

---

## License
MIT
