import { useState } from "react";
import firebase from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!email || !fullname || !password) {
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
        .createUserWithEmailAndPassword(email, password);
      if (response.user) {
        await response.user.updateProfile({
          displayName: fullname,
        });
        const uid = response.user.uid;
        const userRef = firebase.database().ref("users/" + uid);
        await userRef.set({
          uid: uid,
          email: email,
          username: fullname,
        });

        setFullName("");
        setEmail("");
        setPassword("");

        await navigate("/login");
      }
    } catch (error) {
      console.log("Register error", error);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-black">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-md p-10 bg-black border border-white rounded-lg shadow-lg"
      >
        <h2 className="mb-6 text-2xl font-bold text-left text-white">
          Register
        </h2>

        {/* Fullname */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-semibold text-white">
            Fullname
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-white rounded-lg bg-black text-white focus:outline-none focus:ring focus:ring-blue-600 text-sm"
            placeholder="Your Fullname"
            required
            value={fullname}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

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
          <span className="text-white">Already have an account?</span>
          <a href="/login" className="text-white hover:underline">
            Login Now
          </a>
        </div>

        {/* Submit Button */}
        <div className="mt-auto">
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
