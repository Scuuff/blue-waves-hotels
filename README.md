# Blue Waves Hotels

A full-stack hotel booking and management platform for a chain of four hotels
across Egypt: **Cairo, Marsa Alam, Sharm El Sheikh and Ain Sokhna**.

Guests can browse branches, search and filter hotels, book and pay, save
favourites and leave reviews. Admins get a dashboard to run the whole chain:
hotels, rooms, bookings, offers and users.

---

## Features

### For guests
- **Cinematic intro.** A loading screen and a scroll-driven journey through the four branches, then a video hero.
- **Search & filters.** Find hotels by branch, city, price and rating.
- **Branch pages** with galleries, room types, amenities and an interactive map (Leaflet).
- **Booking & checkout.** Pay by card, Apple Pay, Google Pay or PayPal.
- **Chat assistant.** Answers common questions (check-in times, cancellation policy and more) and checks **live room availability** from the API.
- **Accounts.** Register and log in with validated forms (Formik + Yup) and JWT auth, then manage your profile, booking history, upcoming stays and favourites.
- **Offers** with live countdowns and promo codes.
- **Reviews & ratings.**
- **Email newsletter.** Subscribers get a real confirmation email (Nodemailer).
- **Light / dark theme.**

### For admins
- **Dashboard** with live stats and charts (Recharts)
- **Hotel & branch management:** add, edit and remove branches
- **Room management**
- **Booking management** with a status timeline
- **Offers management**
- **User management**
- **Settings**

Admin pages are protected by role-based routes.

---

## Tech stack

| Layer    | Tools |
| -------- | ----- |
| Frontend | React, Vite, Tailwind CSS, React Router, Framer Motion, Recharts, React Leaflet, Formik + Yup, Axios |
| Backend  | Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, express-validator, Nodemailer |

---

## Project structure

```
├── src/                  React app
│   ├── Pages/            Guest and admin pages
│   ├── Components/       UI components (chat widget, booking cards, …)
│   ├── Context/          Theme, offers and intro state
│   ├── services/         API client
│   └── utils/            Chat engine and helpers
└── backend/              Express API
    ├── routes/           auth, hotels, rooms, bookings, offers, reviews,
    │                     favorites, profile, contact, newsletter
    ├── controller(s)/    Route handlers
    ├── models/           Mongoose schemas
    └── utils/mailer.js   Email sending
```

---

## Getting started

**Requirements:** Node.js 18+ and a MongoDB database (local or MongoDB Atlas).

### 1. Install

```bash
npm install
cd backend && npm install && cd ..
```

### 2. Configure the backend

Copy `backend/.env.example` to `backend/.env` and fill in your values.
The newsletter email settings are optional.

### 3. (Optional) Seed sample offers

```bash
node backend/seed.js
```

### 4. Run

In two terminals:

```bash
npm run api     # API on http://localhost:5050
```

```bash
npm run dev     # App on http://localhost:5173
```

---

## Author

**Andrew Wageh**
[GitHub](https://github.com/Scuuff) · [LinkedIn](https://www.linkedin.com/in/andrew-wageh-986626312/)
