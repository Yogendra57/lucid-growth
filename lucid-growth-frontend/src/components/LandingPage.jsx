import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../stylesheets/LandingPage.css"; // Custom CSS for animations

export default function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleStart = () => {
    if (!email) return alert("Please enter your email!");
    navigate("/home", { state: { email } });
  };

  return (
    <div className="landing-page d-flex justify-content-center align-items-center">
      <div className="overlay"></div>
      <div className="content-box text-center p-4">
        <h1 className="mb-3 animate-bounce">📧 LucidGrowth Email Analyzer</h1>
        <p className="mb-4">Enter your email to start testing email headers and ESP detection</p>
        <input
          type="email"
          className="form-control mb-3 text-center"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn-primary btn-gradient animate-pulse" onClick={handleStart}>
          Start Email Test
        </button>
      </div>
    </div>
  );
}
