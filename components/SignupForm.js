import { useState } from "react";
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth, firestore } from "../utils/firebase";
import toast from "react-hot-toast";

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

      // Check if the email matches any existing doctor emails
      const doctorsRef = collection(firestore, "users");
      const doctorsSnapshot = await getDocs(doctorsRef);
      const existingDoctors = doctorsSnapshot.docs.filter(
        (doc) => doc.data().role === "doctor"
      );
      const matchingDoctor = existingDoctors.find(
        (doc) => doc.data().email === formData.email
      );

      if (matchingDoctor && formData.role === "Doctor") {
        // Update the new user's role to "doctor"
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
          role: "Doctor",
          phoneNumber: formData.phoneNumber,
          specialization: formData.specialization,
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(firestore, "users", userCredential.user.uid), userDoc);
        alert("Account created successfully! Please log in.");
        router.push("/login");
      } else {
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

        // Redirect to login page with a success toast
        alert("Account created successfully! Please log in.");
        router.push("/login");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert(error.message || "Failed to create account");
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
          {/* Rest of the form remains the same as in previous implementation */}

          <div>
            {/* <label className="block text-sm font-medium text-gray-700">
              Role
            </label> */}
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="patient">Patient</option>
              {/* <option value="Doctor">Doctor</option>
              <option value="admin">Admin</option> */}
            </select>
          </div>

          {/* Rest of the form remains the same */}
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
