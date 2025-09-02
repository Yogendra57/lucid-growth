import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { id } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let intervalId;

    const fetchSession = async () => {
      try {
        const { data } = await axios.get(
          `https://lucid-growth-backend2.onrender.com/api/sessions/fetch/${id}`
        );
        setSessionData(data);
        setLoading(false);

        // Stop polling if email is received
        if (data.email) {
          clearInterval(intervalId);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Error fetching session details."
        );
        setLoading(false);
        clearInterval(intervalId);
      }
    };

    fetchSession(); // initial fetch
    intervalId = setInterval(fetchSession, 5000); // poll every 5 seconds

    return () => clearInterval(intervalId); // cleanup
  }, [id]);

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
        {error}
      </div>
    );

  // ✅ now use nested email
  const email = sessionData?.email;

  return (
    <div
      className="vh-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "#f3f4f6" }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="card shadow-lg p-4"
        style={{ width: "600px" }}
      >
        <h2 className="mb-4 text-center text-primary">
          Email Analysis Dashboard
        </h2>

        <p>
          <b>From:</b> {email?.from || "Pending..."}
        </p>
        <p>
          <b>Subject:</b> {email?.subject || "Pending..."}
        </p>
        <p>
          <b>ESP:</b> {email?.esp || "Pending..."}
        </p>
        <p>
          <b>Received At:</b>{" "}
          {email?.receivedAt
            ? new Date(email.receivedAt).toLocaleString()
            : "Pending..."}
        </p>

        <h4 className="mt-4 mb-2">Receiving Chain:</h4>
        <ul className="list-group mb-3">
          {email?.receivingChain?.length > 0 ? (
            email.receivingChain.map((item, idx) => (
              <li key={idx} className="list-group-item">
                {item}
              </li>
            ))
          ) : (
            <li className="list-group-item">Pending...</li>
          )}
        </ul>

        <div className="text-center">
          <Link to="/" className="btn btn-primary">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
