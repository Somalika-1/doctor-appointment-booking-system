# 🏥 Doctor Appointment Booking System

The Doctor Appointment Booking System is a web-based application designed to simplify the process of booking and managing appointments between patients and doctors. Built using React.js and Firebase, it offers a seamless experience for users to register, search for doctors, book appointments, and manage their bookings.

This project was developed as part of a college project with a focus on real-world usability, efficient data handling, and clean UI/UX design.

---

## 🚀 Features

- 👨‍⚕️ **Doctor Directory**: Browse and view detailed profiles of doctors including their specialization, availability, and experience.
- 📅 **Appointment Booking**: Select a date and time slot to book appointments with registered doctors.
- 🔐 **Secure Login**: Firebase-based authentication for patients and doctors.
- 📂 **Dashboard**:
  - **Patients**: View and manage upcoming and past appointments.
  - **Doctors**: Manage availability and see booked appointments.
- 🔄 **Role-based Access**: Different dashboards and privileges for doctors and patients.
- 📨 **Notifications** *(Optional)*: Alerts or confirmation messages after booking.

---

## 🧰 Tech Stack

| Layer         | Technology                         |
|---------------|-------------------------------------|
| Frontend      | React.js, Tailwind CSS             |
| Backend       | Firebase (Firestore, Auth)         |
| Hosting       | Firebase Hosting or Vercel         |
| Database      | Firebase Cloud Firestore (NoSQL)   |

---


---

## 🧑‍💻 How to Run Locally

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/doctor-appointment-system.git
cd doctor-appointment-system
```

2. **Install Dependencies**

```bash
npm install
```

3. **Configure Firebase**

Create a project at https://firebase.google.com

Enable:

Firestore Database

Authentication (Email/Password or Google)

Replace the Firebase config inside src/services/firebase.js:

```bash
// firebase.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

4. **Start the Development Server**

```bash
npm start
```

🧪 **Future Enhancements**
📬 Email or SMS reminders before appointments

⏳ Live availability tracker with time slot blocking

💬 Chat functionality between doctor and patient

🩺 Medical report upload and sharing system

📈 Admin analytics dashboard

Website Link: https://doctor-appointment-booking-system-iota.vercel.app/ 



