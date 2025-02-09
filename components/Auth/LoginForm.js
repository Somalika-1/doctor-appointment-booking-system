import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth, firestore } from "../../utils/firebase";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Link from 'next/link';


const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("UID:", user.uid);
      console.log("Authenticated User:", user);

      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      console.log("userdoc", userDocSnap);
      console.log("User UID:", user.uid);
      console.log("User Document exists:", userDocSnap.exists());

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("User Role in login:", userData.role);

        // Ensure role and email exist and are strings
        if (!userData.role || typeof userData.role !== "string") {
          alert("invalid role");
          throw new Error("Invalid role data");
        }

        if (!userData.email || typeof userData.email !== "string") {
          alert("invalid email");
          throw new Error("Invalid email data");
        }

        // Normalize the role to lowercase for comparison
        const normalizedRole = userData.role;

        // Check the user role and navigate accordingly
        if (normalizedRole === "doctor" || normalizedRole === "Doctor") {
          console.log("Matched doctor");
          router.push("/doctor-dashboard");
        } else if (normalizedRole === "patient") {
          router.push("/patient-dashboard");
        } else if (normalizedRole === "admin" || normalizedRole === "Admin") {
          router.push("/admin-dashboard");
        } else {
          console.log("invalid user");
          alert("Invalid user role");
        }
      } else {
        alert("User data not found");
      }
    } catch (err) {
      alert("Login Error ..:");
      console.log(err);
      console.log("Email:", email, "Password:", password);

      // Handle different errors
      switch (err.code) {
        case "auth/wrong-password":
          alert("Incorrect password. Please try again.");
          break;
        case "auth/user-not-found":
          alert("No account found with this email.");
          break;
        case "auth/invalid-email":
          alert("Invalid email address.");
          break;
        case "auth/too-many-requests":
          alert("Too many failed attempts. Please try again later.");
          break;
        default:
          alert("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Log In
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-white bg-indigo-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
          <p>
              Don&apos;t have an account?{" "}
              <Link href="/signup">
                <a className="text-indigo-600 hover:text-indigo-700">Sign Up</a>
              </Link>
          </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
