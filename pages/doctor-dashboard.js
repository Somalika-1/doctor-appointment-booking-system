import "../app/globals.css";
import React, { useState, useEffect } from "react";
import { auth, firestore } from "../utils/firebase";
import { useRouter } from "next/router";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MailIcon,
  HeartPulseIcon,
  StethoscopeIcon,
  GemIcon,
} from "lucide-react";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchAppointments(user.uid);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [router]);

  const fetchAppointments = (doctorId) => {
    const appointmentsRef = collection(firestore, "appointments");
    const appointmentsQuery = query(
      appointmentsRef,
      where("doctorId", "==", doctorId)
    );

    const unsubscribe = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        const fetchedAppointments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAppointments(fetchedAppointments);
      },
      (error) => {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
      }
    );

    return unsubscribe;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }
  console.log("currentUser.displayName", currentUser.displayName);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* <div className="max-w-7xl mx-auto py-10 px-6 bg-white shadow-xl rounded-2xl overflow-hidden"> */}
      <div className="bg-blue-600 text-white p-6 rounded-2xl  flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <UserIcon className="h-10 w-10" />
          <h1 className="text-3xl font-bold capitalize">Doctor Dashboard</h1>
        </div>
        <button
          onClick={() => auth.signOut()}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
        >
          Log Out
        </button>
      </div>

      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <HeartPulseIcon className="mr-3 text-blue-600" /> Your Booked
          Appointments
        </h2>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center mt-20">
          <h2 className="text-2xl font-semibold text-gray-700">
            No Appointments Found
          </h2>
          <p className="text-gray-500 mt-2">
            All your scheduled appointments will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-bold text-gray-900 capitalize">
                Patient: {appointment.patientName}
              </h3>
              <p className="text-gray-700 mt-2">
                <strong>Date:</strong>{" "}
                {new Date(appointment.date).toLocaleDateString()}
              </p>
              <p className="text-gray-700">
                <strong>Time:</strong> {appointment.time}
              </p>
              {/* <p className="mt-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm ${
                      appointment.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : appointment.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </p> */}
            </div>
          ))}
        </div>
      )}
      {/* </div> */}
    </div>
  );
};

export default DoctorDashboard;
