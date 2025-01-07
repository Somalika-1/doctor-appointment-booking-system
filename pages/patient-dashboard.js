import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MailIcon,
  HeartPulseIcon,
  StethoscopeIcon,
  GemIcon,
} from "lucide-react";
import "../app/layout";
import "../app/globals.css";
import React, { useState, useEffect } from "react";
import { auth, firestore } from "../utils/firebase";
import { useRouter } from "next/router";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
// import toast from "react-hot-toast";
import { format } from "date-fns";

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newBooking, setNewBooking] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    doctor: null,
    gender: "",
    age: "",
    reason: "",
    medicalHistory: "",
  });
  const [availableTimes, setAvailableTimes] = useState([]);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push("/login"); // Redirect to the landing page
    } catch (error) {
      console.error("Error during sign out:", error);
    }
    alert("You are going to Log out in a while ! ");
  };

  // Fetch user, appointments, and doctors
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchAppointments(user.uid);
      } else {
        setCurrentUser(null);
        router.push("/login");
      }
      setLoading(false);
    });

    const fetchDoctors = async () => {
      try {
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("role", "==", "doctor"));
        const querySnapshot = await getDocs(q);
        const doctorsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched Doctors:", doctorsData);
        setDoctorList(doctorsData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        alert("Failed to load doctors");
      }
    };

    fetchDoctors();
    return () => unsubscribeAuth();
  }, [router]);

  const [hasBookingOnSelectedDate, setHasBookingOnSelectedDate] =
    useState(false);

  const fetchAppointments = (userId) => {
    try {
      const appointmentsRef = collection(firestore, "appointments");
      const appointmentsQuery = query(
        appointmentsRef,
        where("userId", "==", userId)
      );

      const unsubscribe = onSnapshot(appointmentsQuery, (snapshot) => {
        const appointmentsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        //       setAppointments(appointmentsList);
        //     });

        //     return unsubscribe;
        //   } catch (error) {
        //     console.error("Error fetching appointments:", error);
        //     alert("Failed to load appointments");
        //   }
        // };
        const now = new Date();
        const currentAppts = [];
        const pastAppts = [];

        appointmentsList.forEach((apt) => {
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

  const fetchAvailableTimes = async (doctorId, selectedDate) => {
    try {
      // Define all possible time slots
      const allTimeSlots = [
        "9:00 AM",
        "10:00 AM",
        "11:00 AM",
        "2:00 PM",
        "3:00 PM",
        "4:00 PM",
      ];

      // Fetch booked slots for the selected doctor and date
      const appointmentsRef = collection(firestore, "appointments");
      const appointmentsQuery = query(
        appointmentsRef,
        where("doctorId", "==", doctorId),
        where("date", "==", selectedDate) // Ensure selectedDate is in YYYY-MM-DD format
      );

      const snapshot = await getDocs(appointmentsQuery);

      // Extract booked times from the fetched appointments
      const bookedTimes = snapshot.docs.map((doc) => doc.data().time);

      // Filter out booked slots from all available slots
      const availableSlots = allTimeSlots.filter(
        (slot) => !bookedTimes.includes(slot)
      );

      // Update state with available slots
      setAvailableTimes(availableSlots);

      console.log("Available Times:", availableSlots); // Debugging available slots
    } catch (error) {
      alert("Error fetching available times:", error);
      alert("Failed to load available times");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDoctorChange = (e) => {
    const selectedDoctor = doctorList.find((doc) => doc.id === e.target.value);
    setFormData((prev) => ({ ...prev, doctor: selectedDoctor }));
    if (formData.date) {
      fetchAvailableTimes(selectedDoctor.id, formData.date);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setFormData((prev) => ({ ...prev, date }));
    if (formData.doctor) {
      fetchAvailableTimes(formData.doctor.id, date);
    }
  };

  const isUserBookedForSelectedDate = () => {
    // Check if there is an appointment on the selected date
    const selectedDate = formData.date;
    const appointmentsForUser = appointments.filter(
      (appointment) => appointment.date === selectedDate
    );
    alert("Sorry ! You can not book more than 1 appointment in a day !");
    return appointmentsForUser.length > 0;
  };
  const isBookingDisabled = !isUserBookedForSelectedDate;

  const handleBookAppointment = async () => {
    const { date, time, doctor, age, gender, reason, medicalHistory } =
      formData;

    if (!date || !time || !doctor || !age || !gender || !reason) {
      alert("* Please fill out all required fields !");
      return;
    }

    try {
      // Check if the patient already has a booking on the selected date
      const appointmentsRef = collection(firestore, "appointments");
      const appointmentsQuery = query(
        appointmentsRef,
        where("userId", "==", currentUser.uid),
        where("date", "==", date) // Check if there's already a booking on the same date
      );

      const snapshot = await getDocs(appointmentsQuery);

      // If the patient already has a booking for the date
      if (!snapshot.empty) {
        alert(
          "You already have an appointment for this day. You cannot book more than one appointment per day."
        );
        return; // Exit the function if there's already a booking
      }

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
        status: "Approved",
        createdAt: new Date().toISOString(),
        patientName: currentUser.displayName || "Patient",
        patientEmail: currentUser.email,
        age,
        gender,
        reason,
        medicalHistory,
      };

      try {
        const appointmentsRef = collection(firestore, "appointments");
        await addDoc(appointmentsRef, appointmentData);
        alert("Appointment booked successfully!");
        setNewBooking(false);
        setFormData({
          date: "",
          time: "",
          doctor: null,
          age: "",
          gender: "",
          reason: "",
          medicalHistory: "",
        });
      } catch (error) {
        console.error("Error booking appointment:", error);
        alert("Failed to book appointment");
      }
    } catch (error) {
      console.error("Error during booking process:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-10 px-4 sm:px-6 lg:px-8 capitalize">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-10 px-4 sm:px-6 lg:px-8"> */}
        {/* <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden"> */}
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <UserIcon className="h-10 w-10" />
            <h1 className="text-3xl font-bold capitalize">
              {currentUser
                ? `${currentUser.displayName}'s Dashboard`
                : "Dashboard"}
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
          >
            Log Out
          </button>
        </div>
      </div>
      {/* </div> */}

      <div className="p-6">
        {!newBooking ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <HeartPulseIcon className="mr-3 text-blue-600" /> Your
                Appointments
              </h2>
              <button
                onClick={() => setNewBooking(true)}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center space-x-2"
              >
                <CalendarIcon className="h-5 w-5" />
                <span>Book New Appointment</span>
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-10 bg-blue-50 rounded-lg">
                <p className="text-gray-600 text-lg">
                  No appointments scheduled
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-white border border-blue-100 rounded-lg shadow-md p-5 hover:shadow-lg transition duration-300"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-semibold text-blue-600">
                        Dr. {appointment.doctor.name}
                      </h3>

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-gray-700">
                      <p className="flex items-center">
                        <HeartPulseIcon className="mr-2 h-5 w-5 text-blue-500" />
                        {appointment.doctor.specialization}
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
                        <h3 className="text-xl font-semibold text-blue-600">
                          Dr. {appointment.doctor.name}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          Past
                        </span>
                      </div>
                      <div className="space-y-2 text-gray-700">
                        <p className="flex items-center">
                          <HeartPulseIcon className="mr-2 h-5 w-5 text-blue-500" />
                          {appointment.doctor.specialization}
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
        ) : (
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-6 text-blue-600 text-center">
              Book New Appointment
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <UserIcon className="mr-3 text-blue-600" />
                  <label className="text-gray-700 font-medium">
                    Patient Name
                  </label>
                </div>
                <input
                  type="text"
                  value={currentUser.displayName || ""}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />

                <div className="flex items-center">
                  <MailIcon className="mr-3 text-blue-600" />
                  <label className="text-gray-700 font-medium">
                    Contact Email
                  </label>
                </div>
                <input
                  type="email"
                  value={currentUser.email || ""}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />

                <div className="flex items-center">
                  <UserIcon className="mr-3 text-blue-600" />
                  <label className="text-gray-700 font-medium">Age</label>
                </div>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter your age"
                />

                <div className="flex items-center">
                  <GemIcon className="mr-3 text-blue-600" />
                  <label className="text-gray-700 font-medium">Gender</label>
                </div>

                <select
                  name="gender" // Add the gender name to bind it with formData
                  value={formData.gender} // Make sure to bind it with formData.gender
                  onChange={handleFormChange} // Call handleFormChange to update formData
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <HeartPulseIcon className="mr-3 text-blue-600" />
                  <label className="text-gray-700 font-medium">
                    Reason for Appointment
                  </label>
                </div>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Describe your medical concern"
                />

                <div className="flex items-center">
                  <StethoscopeIcon className="mr-3 text-blue-600" />
                  <label className="text-gray-700 font-medium">Doctor</label>
                </div>
                <select
                  name="doctor"
                  value={formData.doctor?.id || ""}
                  onChange={(e) => {
                    const selectedDoctor = doctorList.find(
                      (doc) => doc.id === e.target.value
                    );
                    setFormData((prev) => ({
                      ...prev,
                      doctor: selectedDoctor,
                    }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select a Doctor</option>
                  {doctorList.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} ({doctor.specialization})
                    </option>
                  ))}
                </select>
                <div className="flex items-center">
                  <CalendarIcon className="mr-3 text-blue-600" />
                  <label className="text-gray-700 font-medium">Date</label>
                </div>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleDateChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                <div className="flex items-center">
                  <ClockIcon className="mr-3 text-blue-600" />
                  <label className="text-gray-700 font-medium">
                    Preferred Time
                  </label>
                </div>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select a Time</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 text-center bg-blue-50 p-4 rounded-lg">
              <p className="text-red-600 font-bold">
                Doctor consultation fee of Rs. 300 will be charged at the time
                of visit.
              </p>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => setNewBooking(false)}
                className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 transition duration-300"
              >
                Cancel
              </button>
              <button
                className={`py-2 px-6 rounded-lg flex items-center space-x-2 transition duration-300 
                ${
                  isBookingDisabled
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed" // Disabled state styles
                    : "bg-blue-600 text-white hover:bg-blue-700" // Enabled state styles
                }`}
                disabled={isBookingDisabled} // This will disable the button if the user already has a booking
                onClick={handleBookAppointment}
              >
                <CalendarIcon className="h-5 w-5" />
                <span>Confirm Booking</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    // </div>
  );
};

export default PatientDashboard;
