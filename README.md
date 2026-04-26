# GolfGive — MERN Stack Platform
> Golf Performance Tracking + Monthly Prize Draws + Charity Fundraising

A full-stack MERN application built as a learning reference for the Digital Heroes PRD assignment.

🔗 [Vercel](https://golf-platform-delta.vercel.app/)

---

## 🏗️ Project Structure

```
golf-platform/
├── backend/          ← Node.js + Express + MongoDB
│   ├── models/       ← Mongoose schemas (User, Score, Draw, Charity)
│   ├── routes/       ← API route handlers
│   ├── middleware/   ← JWT auth + role guards
│   └── server.js    ← Entry point
└── frontend/         ← React (Create React App)
    └── src/
        ├── context/  ← AuthContext (global auth state)
        ├── pages/    ← Home, Login, Register, Dashboard, Admin...
        ├── utils/    ← Axios API instance
        └── App.js   ← Routes + protected route wrapper
```

---

## ⚙️ Setup & Running

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas free tier)

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev          # starts on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm start            # starts on http://localhost:3000
```

> The frontend proxies `/api` to `localhost:5000` via the `"proxy"` field in package.json.

---

## 🔑 Creating Your First Admin User

After starting the backend, register normally via the UI, then manually update the user in MongoDB:

```js
// In MongoDB shell or Compass
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

Then visit **Admin Panel → Seed Demo Data** to add sample charities.

---

## 🧩 Key Features Implemented

| Feature | Status |
|---|---|
| JWT Auth (register/login) | ✅ |
| Role-based access (user/admin) | ✅ |
| Subscription system (mock) | ✅ |
| Score entry — 5-score rolling | ✅ |
| One score per date rule | ✅ |
| Monthly draw engine (random + algorithmic) | ✅ |
| Prize pool logic (40/35/25%) | ✅ |
| Jackpot rollover | ✅ |
| Charity selection + % contribution | ✅ |
| Winner verification + payout status | ✅ |
| Admin dashboard (users, draws, charities, winners) | ✅ |
| Responsive design (mobile-first) | ✅ |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Private |

### Scores
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/scores | Subscriber |
| POST | /api/scores | Subscriber |
| PUT | /api/scores/:id | Subscriber |
| DELETE | /api/scores/:id | Subscriber |

### Draws
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/draws | Public |
| GET | /api/draws/latest | Public |
| GET | /api/draws/my-results | Private |

### Admin
| Method | Endpoint | Access |
|---|---|---|
| GET | /api/admin/analytics | Admin |
| GET | /api/admin/users | Admin |
| POST | /api/admin/draws/run | Admin |
| PUT | /api/admin/draws/:id/publish | Admin |
| POST | /api/admin/charities | Admin |
| GET | /api/admin/winners | Admin |
| PUT | /api/admin/winners/:drawId/:winnerId | Admin |
| POST | /api/admin/seed | Admin |

---

## 🚀 Deployment (Vercel + MongoDB Atlas)

1. **Database**: Create a free [MongoDB Atlas](https://cloud.mongodb.com) cluster
2. **Backend**: Deploy to [Railway](https://railway.app) or [Render](https://render.com) (free tier)
3. **Frontend**: Deploy to [Vercel](https://vercel.com) — set `REACT_APP_API_URL` env variable

---

## 📝 Notes for Learners

- **Auth flow**: JWT stored in localStorage → attached via Axios interceptor to every request
- **Score rolling**: Backend `Score.addScore()` static method handles the 5-score limit automatically
- **Draw engine**: Admin triggers draw via `/api/admin/draws/run` — checks all active subscribers' scores against winning numbers
- **Prize calculation**: Automatically splits pool tiers among multiple winners
- **Subscription**: Mocked here — integrate Stripe Checkout in production using the `stripe` npm package
