import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email] = useState(location.state?.email || "");
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create a new test session
  const createSession = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/sessions/create",
        { testAddress: email }
      );
      setSession(data);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch latest email for this session
  const fetchEmail = async () => {
    if (!session?._id) return null;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:8000/api/sessions/fetch/${session._id}`
      );
      setSession(data); // update session state
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching email.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // On mount, create a new session
  useEffect(() => {
    if (!session) createSession();
  }, []);

  // Auto-poll for email every 5 seconds until received
  useEffect(() => {
    if (!session) return;

    if (!session.emailId) {
      const interval = setInterval(async () => {
        const updated = await fetchEmail();
        if (updated?.emailId) clearInterval(interval);
      }, 5000);

      return () => clearInterval(interval); // cleanup on unmount
    }
  }, [session]);

  // Handle Go to Dashboard
  const goToDashboard = async () => {
    const updatedSession = await fetchEmail();
    if (updatedSession?.emailId) {
      navigate(`/dashboard/${updatedSession._id}`);
    } else {
      alert(
        "Email not received yet. Please send the test email and wait a few seconds."
      );
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: "#f2f2f2" }}
    >
      <div className="card shadow p-4 text-center" style={{ width: "400px" }}>
        {!session ? (
          <div>
            <h4>Starting session...</h4>
          </div>
        ) : (
          <div>
            <p>
              📧 Send a test email to: <b>{session.testAddress || "Pending..."}</b>
            </p>
            <p>
              📝 Subject: <b>{session.subjectToken || "Pending..."}</b>
            </p>
            <p>
              📌 Status: <b>{session.status || "Pending..."}</b>
            </p>

            {!session.emailId ? (
              <button
                className="btn btn-success mt-3"
                onClick={fetchEmail}
                disabled={loading}
              >
                {loading ? "Fetching..." : "Fetch Email"}
              </button>
            ) : (
              <button
                onClick={goToDashboard}
                className="bg-purple-600 text-white px-6 py-2 mt-4 rounded-full shadow-lg hover:scale-105 transform transition"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        )}

        {error && <p className="text-danger mt-2">{error}</p>}
      </div>
    </div>
  );
}
