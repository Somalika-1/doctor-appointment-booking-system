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
  const [pastAppointments, setPastAppointments] = useState([]);

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
    try {
      const appointmentsRef = collection(firestore, "appointments");
      const appointmentsQuery = query(
        appointmentsRef,
        where("doctorId", "==", doctorId)
      );

      const unsubscribe = onSnapshot(appointmentsQuery, (snapshot) => {
        const fetchedAppointments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const now = new Date();
        const currentAppts = [];
        const pastAppts = [];

        fetchedAppointments.forEach((apt) => {
          const [year, month, day] = apt.date.split("-");
          const [time, period] = apt.time.split(" ");
          const [hours, minutes] = time.split(":");
          let hour = parseInt(hours);
          if (period === "PM" && hour !== 12) hour += 12;
          if (period === "AM" && hour === 12) hour = 0;
          const aptDate = new Date(
            year,
            month - 1,
            day,
            hour,
            parseInt(minutes)
          );

          if (aptDate < now) {
            pastAppts.push(apt);
          } else {
            currentAppts.push(apt);
          }
        });

        setAppointments(currentAppts);
        setPastAppointments(pastAppts);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      alert("Failed to load appointments");
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }
  console.log("currentUser.displayName", currentUser.displayName);
  console.log("cname");
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* <div className="max-w-7xl mx-auto py-10 px-6 bg-white shadow-xl rounded-2xl overflow-hidden"> */}
      <div className="bg-blue-600 text-white p-6 rounded-2xl  flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <UserIcon className="h-10 w-10" />
          <h1 className="text-3xl font-bold capitalize">Doctor {} Dashboard</h1>
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
          <HeartPulseIcon className="mr-3 text-blue-600" /> Your Bookings
        </h2>
      </div>
      <div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-gray-50 border border-gray-200 rounded-lg shadow-md p-5"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold text-blue-600 capitalize">
                    Patient : {appointment.patientName}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-sm  bg-white font-bold text-green-500">
                    Upcoming
                  </span>
                </div>
                <div className="space-y-2 text-gray-700">
                  <p className="flex items-center capitalize">
                    <HeartPulseIcon className="mr-2 h-5 w-5 text-blue-500 " />
                    {appointment.reason}
                  </p>
                  <p className="flex items-center">
                    <CalendarIcon className="mr-2 h-5 w-5 text-blue-500" />
                    {appointment.date}
                  </p>
                  <p className="flex items-center">
                    <ClockIcon className="mr-2 h-5 w-5 text-blue-500" />
                    {appointment.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {pastAppointments.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
              <HeartPulseIcon className="mr-3 text-blue-600" /> Past
              Appointments
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg shadow-md p-5"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-blue-600 capitalize">
                      Patient : {appointment.patientName}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      Past
                    </span>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <p className="flex items-center capitalize">
                      <HeartPulseIcon className="mr-2 h-5 w-5 text-blue-500 " />
                      {appointment.reason}
                    </p>
                    <p className="flex items-center">
                      <CalendarIcon className="mr-2 h-5 w-5 text-blue-500" />
                      {appointment.date}
                    </p>
                    <p className="flex items-center">
                      <ClockIcon className="mr-2 h-5 w-5 text-blue-500" />
                      {appointment.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* </div> */}
    </div>
  );
};

export default DoctorDashboard;
