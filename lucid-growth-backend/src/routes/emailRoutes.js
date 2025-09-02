const express = require("express");
const router = express.Router();

const emailController = require("../controllers/emailController");
const testController = require("../controllers/testController");

// Emails
router.get("/", emailController.getAllEmails);            
router.get("/fetch", emailController.fetchLatestEmail);  
router.get("/:id", emailController.getEmailById);        

// Test sessions
router.post("/tests/start", testController.createTestSession); 
router.get("/tests/:id/status", testController.getTestStatus); 

module.exports = router;
