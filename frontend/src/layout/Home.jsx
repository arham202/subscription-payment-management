import { useEffect, useState } from "react";
import firebase from "../firebase/firebaseConfig";
import Modal from "react-modal";

const Home = ({ data }) => {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [planType, setPlanType] = useState("");
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        setUserName(user.displayName);
        const userRef = firebase.database().ref("users/" + user.uid);
        userRef.on("value", (snapshot) => {
          const user = snapshot.val();
          if (user && user.subscription) {
            setPlanType(user.subscription.planType || "");
            setSubscriptionDetails(user.subscription);
            setIsSubscribed(true);
          }
        });
        const response = await fetch(
          `/api/v1/get-customer-subscription?customerId=${user.uid}`
        );
        const data = await response.json();
        setPlanType(data);
      } else {
        setUserId("");
        setUserName("");
        setIsSubscribed(false);
      }
    });
  }, [userId]);

  const checkout = (plan) => {
    fetch("/api/v1/create-subscription-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      body: JSON.stringify({ plan: plan, userId: userId }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        return res.json().then((json) => Promise.reject(json));
      })
      .then(({ session }) => {
        window.location = session.url;
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const manageSubscription = () => {
    fetch("api/v1/create-customer-portal-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      body: JSON.stringify({ customerId: userId }),
    })
      .then((res) => res.json())
      .then(({ url }) => {
        window.location = url;
      })
      .catch((error) => {
        console.error("Error redirecting to customer portal:", error);
      });
  };

  return (
    <div className="flex flex-col items-center w-full mx-auto min-h-screen bg-black font-sans">
      <div className="flex justify-between items-center w-full px-6 h-20 bg-[#1A1A1A] shadow-lg">
        <div className="text-3xl font-bold text-white">
          Subscription Management
        </div>
        <div className="flex justify-center items-center gap-2">
          {!userId ? (
            <a
              href="/login"
              className="bg-[#4f7cff] px-4 py-2 uppercase rounded-lg text-lg text-white font-semibold transition-all duration-300 hover:bg-[#3d5fc4]"
            >
              Login
            </a>
          ) : (
            <div className="flex justify-center items-center space-x-4">
              <span
                className="text-white text-lg cursor-pointer"
                onClick={() => setModalIsOpen(true)}
              >
                {userName}
              </span>
              <button
                onClick={() => firebase.auth().signOut()}
                className="bg-[#4f7cff] px-4 py-2 rounded-lg text-base uppercase font-semibold text-white transition-all duration-300 hover:bg-[#3d5fc4]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Subscription Details"
        className="modal"
        overlayClassName="overlay"
        style={{
          content: {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "500px",
            padding: "20px",
            borderRadius: "10px",
            backgroundColor: "#222",
            border: "2px solid #4CAF50",
            zIndex: 2000,
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: 1000,
          },
        }}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">
          Subscription Details
        </h2>
        {subscriptionDetails ? (
          <div className="text-white">
            <p>Plan Type: {subscriptionDetails.planType}</p>
            <p>Start Date: {subscriptionDetails.planStartDate}</p>
            <p>End Date: {subscriptionDetails.planEndDate}</p>
            <p>Duration: {subscriptionDetails.planDuration} days</p>
          </div>
        ) : (
          <p className="text-white">No subscription details available</p>
        )}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setModalIsOpen(false)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </Modal>

      <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-10 z-50 place-items-center w-10/12 mx-auto mt-20">
        {data.map((item) => (
          <div
            key={item.id}
            className={`bg-[#222222] text-white p-6 rounded-lg shadow-lg transition-transform transform hover:shadow-2xl hover:-translate-y-1 ease-in-out duration-300 w-full h-96 flex flex-col justify-between ${
              planType === item.title.toLowerCase() &&
              "border-l-4 border-green-600"
            }`}
          >
            <div>
              <div className="text-xl font-bold text-center">{item.title}</div>
              <div className="text-3xl font-semibold text-center mt-2">
                ₹{item.price}
              </div>
              <ul className="text-sm mt-4 space-y-2">
                {item.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-blue-400 mr-2">{feature.icon}</span>
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center mt-auto space-x-2">
              {planType === item.title.toLowerCase() ? (
                <>
                  <button
                    onClick={() => manageSubscription()}
                    className="bg-yellow-500 text-white rounded-md text-base uppercase w-full py-2 font-bold shadow-md"
                  >
                    Manage Subscription
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => checkout(Number(item.price))}
                    className="bg-[#3d5fc4] text-white rounded-md text-base uppercase w-full py-2 font-bold shadow-md"
                  >
                    Start
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-20 p-6 text-center text-white">
        <p>&copy; 2024 Your Company Name. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
