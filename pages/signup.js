// components/SignupForm.js
import "../app/globals.css";

import { useState } from "react";
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, firestore } from "../utils/firebase";
import toast from "react-hot-toast";
import Link from 'next/link';

const SignupForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    specialization: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.role === "Doctor" && !formData.specialization.trim()) {
      newErrors.specialization = "Specialization is required for doctors";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.name,
      });

      const userDoc = {
        uid: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
        createdAt: new Date().toISOString(),
        ...(formData.role === "Doctor" && {
          specialization: formData.specialization,
        }),
      };

      await setDoc(doc(firestore, "users", userCredential.user.uid), userDoc);

      toast.success("Account created successfully!");

      router.push("/login");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-8">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm p-2 text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm p-2 text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your phone number"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm p-2 text-red-600">
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {formData.role === "Doctor" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter your specialization"
              />
              {errors.specialization && (
                <p className="mt-1 p-2 text-sm text-red-600">
                  {errors.specialization}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 p-2 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Already have an account?{" "}
              <Link href="/login">
                <a className="text-indigo-600 hover:text-indigo-700">Log In</a>
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
