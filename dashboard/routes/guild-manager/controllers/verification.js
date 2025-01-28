const { getSettings } = require("@schemas/Guild");
const utils = require("../../../utils");

/**
 * Handle GET request for verification settings
 */
async function getVerificationSettings(req, res) {
  const guildInfos = await utils.fetchGuild(req.guild.id, req.client, req.user.guilds);

  // Get flash messages
  const success = req.session.success;
  const error = req.session.error;
  
  // Clear flash messages
  delete req.session.success;
  delete req.session.error;

  res.render("manager/verification", {
    guild: guildInfos,
    user: req.userInfos,
    bot: req.client,
    currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
    success,
    error
  });
}

/**
 * Handle POST request for verification settings
 */
async function updateVerificationSettings(req, res) {
  const settings = await getSettings(req.guild);
  const data = req.body;

  // Update verification settings
  if (Object.prototype.hasOwnProperty.call(data, "verificationUpdate")) {
    // Enable/disable verification
    data.verification_enabled = data.verification_enabled === "on";
    if (data.verification_enabled !== settings.verification?.enabled) {
      settings.verification.enabled = data.verification_enabled;
    }

    // Verification channel
    data.verification_channel = req.guild.channels.cache.find((ch) => "#" + ch.name === data.verification_channel)?.id;
    if (data.verification_channel !== settings.verification?.channel) {
      settings.verification.channel = data.verification_channel;
    }

    // Verified role
    if (data.verification_role !== settings.verification?.role) {
      settings.verification.role = data.verification_role;
    }

    // Verification message
    if (data.verification_message !== settings.verification?.message) {
      settings.verification.message = data.verification_message;
    }

    // Button text
    if (data.verification_button !== settings.verification?.button_text) {
      settings.verification.button_text = data.verification_button;
    }

    // Requirements
    if (data.min_account_age !== settings.verification?.min_age) {
      settings.verification.min_age = data.min_account_age;
    }

    data.require_avatar = data.require_avatar === "on";
    if (data.require_avatar !== settings.verification?.require_avatar) {
      settings.verification.require_avatar = data.require_avatar;
    }

    data.require_email = data.require_email === "on";
    if (data.require_email !== settings.verification?.require_email) {
      settings.verification.require_email = data.require_email;
    }
  }

  try {
    await settings.save();
    req.client.logger.debug(`Updated verification settings for guild ${req.guild.id}`);
    
    // Add success message to session
    req.session.success = "Verification settings updated successfully!";
    res.redirect(303, `/manage/${req.guild.id}/verification`);
  } catch (error) {
    req.client.logger.error("Failed to update verification settings:", error);
    
    // Add error message to session
    req.session.error = "Failed to update verification settings. Please try again.";
    res.redirect(303, `/manage/${req.guild.id}/verification`);
  }
}

module.exports = {
  getVerificationSettings,
  updateVerificationSettings
};
