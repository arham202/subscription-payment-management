import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./layout/Home";
import Login from "./layout/Login";
import Register from "./layout/Register";
import Success from "./layout/Success";
import Cancel from "./layout/Cancel";

const data = [
  {
    id: 1,
    title: "Basic",
    price: "99",
    features: [
      { text: "Access to basic features", icon: "✅" },
      { text: "Up to 10 users", icon: "👥" },
      { text: "Email support", icon: "📧" },
      { text: "Monthly updates", icon: "🗓️" },
    ],
  },
  {
    id: 2,
    title: "Pro",
    price: "499",
    features: [
      { text: "Access to all features", icon: "🔑" },
      { text: "Up to 50 users", icon: "👥" },
      { text: "Priority email support", icon: "⚡" },
      { text: "Weekly updates", icon: "🗓️" },
      { text: "Analytics dashboard", icon: "📊" },
    ],
  },
  {
    id: 3,
    title: "Business",
    price: "999",
    features: [
      { text: "Access to premium features", icon: "✨" },
      { text: "Unlimited users", icon: "👥" },
      { text: "24/7 customer support", icon: "🕒" },
      { text: "Real-time analytics", icon: "📈" },
      { text: "Custom integrations", icon: "🔗" },
    ],
  },
];

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home data={data} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
