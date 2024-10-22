import { useState } from "react";
import firebase from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        console.log("Please fill all the fields");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log("Please provide a valid email");
        return;
      }

      const response = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);

      if (response.user) {
        setEmail("");
        setPassword("");
        await navigate("/");
      }
    } catch (error) {
      console.log("Login Error", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-md p-10 h-[400px] bg-black border border-white rounded-lg shadow-lg"
      >
        <h2 className="mb-6 text-2xl font-bold text-left text-white">Login</h2>

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-semibold text-white">
            Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-3 border border-white rounded-lg bg-black text-white focus:outline-none focus:ring focus:ring-blue-600 text-sm"
            placeholder="example@123.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-semibold text-white">
            Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-3 border border-white rounded-lg bg-black text-white focus:outline-none focus:ring focus:ring-blue-600 text-sm"
            placeholder="******"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Footer Links */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-white">Don't have an account?</span>
          <a href="/register" className="text-white hover:underline">
            Register Now
          </a>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
