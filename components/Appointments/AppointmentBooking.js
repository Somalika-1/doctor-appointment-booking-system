import { format } from "date-fns";
import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "../../utils/firebase";
import toast from "react-hot-toast";

const AppointmentBooking = ({ currentUser }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [doctor, setDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const doctorsRef = collection(firestore, "users");
    const doctorsQuery = query(doctorsRef, where("role", "==", "doctor"));

    const unsubscribe = onSnapshot(doctorsQuery, (snapshot) => {
      const doctorsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctors(doctorsList);
    });

    return () => unsubscribe();
  }, []);

  const handleBookAppointment = async () => {
    if (!doctor || !date || !time) {
      toast.error("Please fill out all fields");
      return;
    }

    setLoading(true);

    try {
      const appointmentData = {
        userId: currentUser.uid,
        doctorId: doctor.id,
        doctor: {
          id: doctor.id,
          name: doctor.name,
          specialization: doctor.specialization,
        },
        date,
        time,
        status: "scheduled",
        createdAt: new Date().toISOString(),
        patientName: currentUser.displayName || "Patient",
        patientEmail: currentUser.email,
      };

      const appointmentsRef = collection(firestore, "appointments");
      await addDoc(appointmentsRef, appointmentData);

      toast.success("Appointment booked successfully!");

      // Reset form
      setDate("");
      setTime("");
      setDoctor(null);
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Book an Appointment
      </h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700"
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="time"
            className="block text-sm font-medium text-gray-700"
          >
            Time
          </label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="doctor"
            className="block text-sm font-medium text-gray-700"
          >
            Doctor
          </label>
          <select
            id="doctor"
            value={doctor ? doctor.id : ""}
            onChange={(e) => {
              const selectedDoctor = doctors.find(
                (d) => d.id === e.target.value
              );
              setDoctor(selectedDoctor);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select a doctor</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                Dr. {doc.name} - {doc.specialization}
              </option>
            ))}
          </select>
        </div>

        <button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={handleBookAppointment}
          disabled={loading || !date || !time || !doctor}
        >
          {loading ? "Booking..." : "Book Appointment"}
        </button>
      </div>
    </div>
  );
};

export default AppointmentBooking;
