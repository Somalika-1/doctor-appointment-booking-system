import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  collection,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MailIcon,
  HeartPulseIcon,
  StethoscopeIcon,
  GemIcon,
} from "lucide-react";
import { auth, firestore } from "../utils/firebase"; // Assuming auth and firestore are properly initialized here
import { createUserWithEmailAndPassword } from "firebase/auth"; // Correct Firebase import for authentication

import toast from "react-hot-toast";
import "../app/globals.css";

// Icons for better visual appeal
import {
  Users,
  UserPlus,
  Stethoscope,
  Calendar,
  Filter,
  Search,
  X,
  BookOpen,
} from "lucide-react";

// Chart.js imports
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  // State for doctors management
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [bookings, setBookings] = useState([]);

  // New doctor form states
  const [newDoctorName, setNewDoctorName] = useState("");
  const [newDoctorSpecialization, setNewDoctorSpecialization] = useState("");
  const [newDoctorEmail, setNewDoctorEmail] = useState("");
  const [newDoctorPhone, setNewDoctorPhone] = useState("");
  const [newDoctorQualification, setNewDoctorQualification] = useState("");

  // Filter states
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal and view states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);

  const router = useRouter();
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push("/"); // Redirect to the landing page
    } catch (error) {
      console.error("Error during sign out:", error);
    }
    alert("You are going to Log out in a while ! ");
  };

  // Fetch doctors and bookings on component mount
  useEffect(() => {
    fetchDoctors();
    fetchBookings();
  }, []);

  // Fetch doctors with enhanced filtering
  const fetchDoctors = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "users"));
      const doctorsList = querySnapshot.docs
        .filter(
          (doc) => doc.data().role === "doctor" || doc.data().role === "Doctor"
        )
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      setDoctors(doctorsList);
      setFilteredDoctors(doctorsList);
    } catch (error) {
      alert("Failed to fetch doctors");
    }
  };

  // Fetch bookings for doctors
  const fetchBookings = async () => {
    try {
      const bookingsSnapshot = await getDocs(
        collection(firestore, "appointments")
      );
      const bookingsList = bookingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(bookingsList);
    } catch (error) {
      alert("Failed to fetch bookings");
    }
  };
  //
  const tempPassword = "password@1";

  const handleAddDoctor = async () => {
    if (!newDoctorName || !newDoctorSpecialization || !newDoctorEmail) {
      alert("Please fill required fields");
      return;
    }

    try {
      // Step 1: Create the user in Firebase Authentication
      const authUser = await createUserWithEmailAndPassword(
        auth, // Using the auth object from Firebase
        newDoctorEmail,
        tempPassword
      );

      const uid = authUser.user.uid; // Get the UID from Firebase Auth

      // Step 2: Prepare doctor data to be added to Firestore
      const newDoctorData = {
        name: newDoctorName,
        role: "doctor",
        specialization: newDoctorSpecialization,
        email: newDoctorEmail,
        phone: newDoctorPhone,
        qualification: newDoctorQualification,
        createdAt: new Date().toISOString(),
        status: "active",
        uid: uid, // Use the UID as the Firestore document ID
      };

      // Step 3: Add the doctor to Firestore's users collection with UID as document ID
      await setDoc(doc(firestore, "users", uid), newDoctorData);

      // Step 4: Update local state
      const updatedDoctors = [...doctors, { id: uid, ...newDoctorData }];
      setDoctors(updatedDoctors);
      setFilteredDoctors(updatedDoctors);

      // Step 5: Reset form and close modal
      resetDoctorForm();
      setIsAddDoctorModalOpen(false);
      alert(
        `New doctor added successfully. Temporary password: ${tempPassword}`
      );
    } catch (error) {
      console.error("Error adding doctor:", error);
      if (error.code === "auth/email-already-in-use") {
        alert(
          "This email is already registered. Please use a different email."
        );
      } else {
        alert("Failed to add doctor. Please try again.");
      }
    }
  };

  // Reset doctor form fields
  const resetDoctorForm = () => {
    setNewDoctorName("");
    setNewDoctorSpecialization("");
    setNewDoctorEmail("");
    setNewDoctorPhone("");
    setNewDoctorQualification("");
  };

  // Advanced filtering of doctors
  const filterDoctors = () => {
    let result = doctors;

    if (specialtyFilter) {
      result = result.filter((doctor) =>
        doctor.specialization.includes(specialtyFilter)
      );
    }

    if (searchQuery) {
      result = result.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDoctors(result);
  };

  // Data for the chart (total doctors and bookings)
  const chartData = {
    labels: ["Doctors", "Bookings"],
    datasets: [
      {
        label: "Total Count",
        data: [doctors.length, bookings.length], // Total doctors and bookings
        backgroundColor: ["#4c8bf5", "#68d391"], // Blue for doctors, Green for bookings
        borderRadius: 8,
        borderColor: ["#4c8bf5", "#68d391"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Analytics Overview",
        font: {
          size: 18,
        },
      },
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Render doctor details modal
  const renderDoctorDetailsModal = () => {
    if (!selectedDoctor) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg w-96 relative">
          <button
            onClick={() => setSelectedDoctor(null)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold mb-4 text-indigo-600">
            Doctor Details
          </h2>

          <div className="space-y-2">
            <p className="flex justify-between">
              <strong>Name:</strong> <span>{selectedDoctor.name}</span>
            </p>
            <p className="flex justify-between">
              <strong>Specialization:</strong>{" "}
              <span>{selectedDoctor.specialization}</span>
            </p>
            <p className="flex justify-between">
              <strong>Email:</strong> <span>{selectedDoctor.email}</span>
            </p>
            <p className="flex justify-between">
              <strong>Phone:</strong>{" "}
              <span>{selectedDoctor.phone || "Not provided"}</span>
            </p>
            <p className="flex justify-between">
              <strong>Qualification:</strong>{" "}
              <span>{selectedDoctor.qualification || "N/A"}</span>
            </p>
            <p className="flex justify-between">
              <strong>Status:</strong>{" "}
              <span>{selectedDoctor.status || "Active"}</span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-10 px-4 sm:px-6 lg:px-8 capitalize">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center space-x-4 ">
            <UserIcon className="h-10 w-10" />
            <h1 className="text-3xl font-bold capitalize">Admin&apos;s Dashboard</h1>
          </div>{" "}
          <button
            onClick={handleSignOut}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
          >
            Log Out
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Doctor Management Section */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-indigo-600 flex padd items-center">
                <Users className="mr-2" /> Doctors
              </h2>
              <button
                onClick={() => setIsAddDoctorModalOpen(true)}
                className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
              >
                <UserPlus size={24} />
              </button>
            </div>
            <div className="mb-4 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search By name"
                className="p-2 rounded border border-gray-300 w-full"
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  filterDoctors();
                }}
              />
            </div>

            <div className="overflow-y-auto max-h-96">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="flex justify-between items-center py-4 px-3 border-b border-gray-200"
                >
                  <div className="flex items-center">
                    <Stethoscope className="mr-2" />
                    <span className="text-sm font-semibold">
                      Dr. {doctor.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedDoctor(doctor)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* New Booked Appointments Card */}
          <div className="bg-white shadow-lg rounded-lg p-5 capitalize">
            <h2 className="text-2xl font-bold text-indigo-600 flex items-center">
              <BookOpen className="mr-2" /> Booked Appointments
            </h2>
            <div className="mt-4">
              {bookings.length === 0 ? (
                <p>No booked appointments found.</p>
              ) : (
                [...bookings].map((booking) => {
                  console.log("Booking Details:", booking.doctor["name"]);
                  return (
                    <div key={booking.id} className="bg-gray-50 opacity-75">
                      <div className="flex justify-between">
                        <p>
                          <strong>Patient:</strong> {booking.patientName}
                        </p>
                        <button className="text-gray-600">
                          <strong> Dr.{booking.doctor["name"]}</strong>
                        </button>
                      </div>
                      <p>
                        <strong>Date:</strong> {booking.date}
                      </p>
                      <p>
                        <strong>Time:</strong> {booking.time}
                      </p>
                      <div className="p-2"></div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Analytics Section */}
          <div className="bg-white shadow-lg rounded-lg p-6 ">
            <h2 className="text-2xl font-bold text-indigo-600 flex items-center mb-4">
              <Calendar className="mr-2" />
              Analytics Overview
            </h2>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Modal for adding a new doctor */}
      {isAddDoctorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-96 relative">
            <button
              onClick={() => setIsAddDoctorModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-indigo-600">
              Add New Doctor
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                className="p-2 rounded border border-gray-300 w-full"
                placeholder="Name"
                value={newDoctorName}
                onChange={(e) => setNewDoctorName(e.target.value)}
              />
              <input
                type="text"
                className="p-2 rounded border border-gray-300 w-full"
                placeholder="Specialization"
                value={newDoctorSpecialization}
                onChange={(e) => setNewDoctorSpecialization(e.target.value)}
              />
              <input
                type="email"
                className="p-2 rounded border border-gray-300 w-full"
                placeholder="Email"
                value={newDoctorEmail}
                onChange={(e) => setNewDoctorEmail(e.target.value)}
              />
              <input
                type="tel"
                className="p-2 rounded border border-gray-300 w-full"
                placeholder="Phone"
                value={newDoctorPhone}
                onChange={(e) => setNewDoctorPhone(e.target.value)}
              />
              <input
                type="text"
                className="p-2 rounded border border-gray-300 w-full"
                placeholder="Qualification"
                value={newDoctorQualification}
                onChange={(e) => setNewDoctorQualification(e.target.value)}
              />
              <button
                onClick={handleAddDoctor}
                className="bg-indigo-600 text-white py-2 px-4 rounded-full hover:bg-indigo-700 w-full"
              >
                Add Doctor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render doctor details modal */}
      {renderDoctorDetailsModal()}
    </div>
  );
};

export default AdminDashboard;
