import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Calendar,
  Clock,
  Users,
  Shield,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Star,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../utils/firebase";
import "../app/globals.css";

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const router = useRouter();

  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-blue-600" />,
      title: "Easy Scheduling",
      description:
        "Book appointments with just a few clicks, 24/7 at your convenience.",
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: "Instant Confirmation",
      description:
        "Receive immediate confirmation and reminders for your appointments.",
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Top Specialists",
      description:
        "Access a wide network of qualified healthcare professionals.",
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Secure & Private",
      description:
        "Your health information is protected with top-tier security.",
    },
  ];

  const testimonials = [
    {
      name: "Esha Sharma",
      text: "The platform made booking my specialist appointment so easy and convenient!",
      rating: 5,
    },
    {
      name: "Riya Garg",
      text: "Professional service and quick response times. Highly recommend!",
      rating: 5,
    },
    {
      name: "Shivam Verma",
      text: "Great user interface and wonderful selection of doctors.",
      rating: 4,
    },
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsCollection = collection(firestore, "users");
        const snapshot = await getDocs(doctorsCollection);
        const doctorData = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) => user.role === "doctor" || user.role === "Doctor");

        setDoctors(doctorData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  const handleNavigation = (path) => {
    router.push(path);
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handleContactSubmit = (e) => {
  //   e.preventDefault();
  //   alert("Thank you for your message! We'll get back to you soon.");
  //   setFormData({
  //     name: "",
  //     email: "",
  //     message: "",
  //   });
  // };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 font-sans">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-400 via-blue-200 to-blue-300 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="py-12 lg:py-24 text-center lg:text-left">
            <h1 className="text-5xl font-bold sm:text-6xl lg:text-7xl leading-tight">
              Your Health, <br />
              <span className="text-red-700">Our Priority</span>
            </h1>
            <p className="mt-6 text-lg font-bold text-black sm:text-xl lg:text-2xl">
              Simplify your healthcare journey with expert doctors, easy
              scheduling, and secured appointments.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
              <button
                onClick={() => handleNavigation("/signup")}
                className="px-8 py-4 bg-black text-blue-500 font-bold rounded-lg shadow-lg hover:bg-gray-900 transition-transform transform hover:scale-105"
              >
                Get Started
              </button>
              <button
                onClick={() => handleNavigation("/login")}
                className="px-8 py-4 bg-white text-blue-700 font-bold rounded-lg shadow-lg hover:bg-blue-50 transition-transform transform hover:scale-105"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">
          Why Choose Us?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-center">{feature.icon}</div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Doctors Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">
          Meet Our Doctors
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow"
            >
              <h3 className="text-xl font-bold text-red-600 capitalize">
                Dr. {doctor.name}
              </h3>
              <p className="mt-2 text-gray-600 capitalize">
                Speciality: {doctor.specialization}
              </p>
              <button
                onClick={() => router.push("/login")}
                className="mt-4 w-full bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 bg-blue-50">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">
          What Our Patients Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-yellow-500 fill-current"
                  />
                ))}
              </div>
              <p className="italic text-gray-600 mb-4">&quot;{testimonial.text}&quot;</p>
              <p className="font-semibold text-blue-700">
                - {testimonial.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Us Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16" id="contact">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">
          Contact Us
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* <div> */}
          {/* <form onSubmit={handleContactSubmit} className="space-y-6"> */}
          {/* <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleContactChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div> */}
          {/* <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleContactChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div> */}
          {/* <div>
                <label htmlFor="message" className="block text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleContactChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors"
              >
                Submit
              </button>
            </form> */}
        </div>
        <div className="text-gray-700">
          <h3 className="text-2xl font-bold mb-4">Get in Touch</h3>
          <p className="mb-6">
            Have questions or need assistance? Reach out to us via the form,
            email, or phone.
          </p>
          <div className="flex items-center mb-4">
            <Mail className="w-6 h-6 text-blue-600 mr-3" />
            <p>support@healthcare.com</p>
          </div>
          <div className="flex items-center mb-4">
            <Phone className="w-6 h-6 text-blue-600 mr-3" />
            <p>+91 123-456-7890</p>
          </div>
          <div className="flex items-center">
            <MapPin className="w-6 h-6 text-blue-600 mr-3" />
            <p>123 Health St,Delhi, India</p>
          </div>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}
