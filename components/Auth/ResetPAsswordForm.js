import { useState } from "react";
import { auth } from "../../utils/firebase";
import toast from "react-hot-toast";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await auth.sendPasswordResetEmail(email);
      toast.success("Password reset email sent!");
    } catch (err) {
      setError("Failed to send password reset email.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePasswordReset} className="space-y-6">
      <div>
        <label htmlFor="email" className="sr-only">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          required
          className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <div>
        <button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? "Sending..." : "Send Password Reset Email"}
        </button>
      </div>
    </form>
  );
};

export default ResetPAsswordForm;
