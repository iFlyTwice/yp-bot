const express = require("express");
const router = express.Router();
const CheckAuth = require("../../auth/CheckAuth");
const validateGuild = require("./middleware/validateGuild");

// Import controllers
const basicController = require("./controllers/basic");
const greetingController = require("./controllers/greeting");
const commandsController = require("./controllers/commands");
const logsController = require("./controllers/logs");
const verificationController = require("./controllers/verification");
const customCommandsController = require("./controllers/custom-commands");

// Default redirect
router.get("/:serverID", CheckAuth, (req, res) => {
  res.redirect(`/manage/${req.params.serverID}/basic`);
});

// Basic Settings Routes
router.get("/:serverID/basic", CheckAuth, validateGuild, basicController.getBasicSettings);
router.post("/:serverID/basic", CheckAuth, validateGuild, basicController.updateBasicSettings);

// Greeting Settings Routes
router.get("/:serverID/greeting", CheckAuth, validateGuild, greetingController.getGreetingSettings);
router.post("/:serverID/greeting", CheckAuth, validateGuild, greetingController.updateGreetingSettings);

// Commands Settings Routes
router.get("/:serverID/commands", CheckAuth, validateGuild, commandsController.getCommandSettings);
router.post("/:serverID/commands", CheckAuth, validateGuild, commandsController.updateCommandSettings);

// Logs Settings Routes
router.get("/:serverID/logs", CheckAuth, validateGuild, logsController.getLogSettings);
router.post("/:serverID/logs", CheckAuth, validateGuild, logsController.updateLogSettings);

// Verification Settings Routes
router.get("/:serverID/verification", CheckAuth, validateGuild, verificationController.getVerificationSettings);
router.post("/:serverID/verification", CheckAuth, validateGuild, verificationController.updateVerificationSettings);

// Custom Commands Routes
router.get("/:serverID/custom-commands", CheckAuth, validateGuild, customCommandsController.getCustomCommandSettings);
router.post("/:serverID/custom-commands", CheckAuth, validateGuild, customCommandsController.updateCustomCommandSettings);

module.exports = router;
