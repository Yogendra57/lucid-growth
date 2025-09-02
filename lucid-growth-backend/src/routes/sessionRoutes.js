const express = require("express");
const router = express.Router();
const { createSession, fetchSession } = require("../controllers/sessionController");

// POST: Create new test session
router.post("/create", createSession);

// GET: Fetch session by ID
router.get("/fetch/:id", fetchSession);

module.exports = router;
