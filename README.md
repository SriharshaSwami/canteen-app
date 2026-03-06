# 🍽️ Canteen Management System

A full-stack canteen management application with role-based authentication, menu management, and order processing.

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://canteen-app-ivory.vercel.app |
| **Backend API** | https://canteen-app-c932.onrender.com |

> Frontend hosted on Vercel, Backend on Render, Database on MongoDB Atlas.

---

## 🔑 Demo Credentials

### Admin Account
```
Email: admin@canteen.com  
Password: admin123
```

### User Account
```
Email: user@canteen.com  
Password: user123
```

---

## 🚀 Features

- User registration and login
- Role-based authentication (Admin/User)
- Menu management (CRUD operations)
- Order placement system
- Credit balance system
- Transaction history
- Real-time notifications
- JWT authentication
- Protected routes
- Responsive UI with dark mode

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT (JSON Web Tokens) |
| **Deployment** | Vercel (Frontend) + Render (Backend) |

---

## 🏗️ Architecture

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  React Frontend (Vercel)│
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Node/Express API (Render)│
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│    MongoDB Atlas        │
└─────────────────────────┘
```

---

## 📁 Project Structure

```
canteen-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   └── utils/
└── frontend/
    ├── public/
    └── src/
        ├── api/
        ├── assets/
        ├── components/
        ├── context/
        └── pages/
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SriharshaSwami/canteen-app.git
   cd canteen-app
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Seed Database**
   ```bash
   cd backend
   node scripts/seedUsers.js
   ```

---

## 📝 API Documentation

API documentation is available at:
```
https://canteen-app-c932.onrender.com/api-docs
```

---

## 👤 Author

**Sriharsha Swami**

- GitHub: [@SriharshaSwami](https://github.com/SriharshaSwami)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
