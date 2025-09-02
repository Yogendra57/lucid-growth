import React, { useState } from "react";
import { createSession } from "../api";

function SessionCreator({ onSessionCreated }) {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data } = await createSession();
      setSession(data);
      onSessionCreated(data);
    } catch (error) {
      console.error("Error creating session:", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 shadow-lg rounded-xl bg-white w-full max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Start a Test Session</h2>
      {!session ? (
        <button
          onClick={handleCreate}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {loading ? "Creating..." : "Create Session"}
        </button>
      ) : (
        <div className="space-y-2">
          <p><strong>Test Address:</strong> {session.testAddress}</p>
          <p><strong>Subject Token:</strong> {session.subjectToken}</p>
          <p className="text-sm text-gray-500">Send an email to the above address with this subject.</p>
        </div>
      )}
    </div>
  );
}

export default SessionCreator;
