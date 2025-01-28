const { getSettings } = require("@schemas/Guild");
const utils = require("../../../utils");

/**
 * Handle GET request for custom commands settings
 */
async function getCustomCommandSettings(req, res) {
  const guildInfos = await utils.fetchGuild(req.guild.id, req.client, req.user.guilds);

  // Get flash messages
  const success = req.session.success;
  const error = req.session.error;
  
  // Clear flash messages
  delete req.session.success;
  delete req.session.error;

  res.render("manager/custom-commands", {
    guild: guildInfos,
    user: req.userInfos,
    bot: req.client,
    currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
    success,
    error
  });
}

/**
 * Handle POST request for custom commands settings
 */
async function updateCustomCommandSettings(req, res) {
  const settings = await getSettings(req.guild);
  const data = req.body;

  // Add new custom command
  if (Object.prototype.hasOwnProperty.call(data, "command_name")) {
    if (!settings.custom_commands) settings.custom_commands = [];
    
    settings.custom_commands.push({
      name: data.command_name,
      description: data.command_description,
      response: data.command_response
    });
  }

  // Delete custom command
  if (Object.prototype.hasOwnProperty.call(data, "delete_command")) {
    settings.custom_commands = settings.custom_commands.filter(cmd => cmd.name !== data.delete_command);
  }

  // Edit custom command
  if (Object.prototype.hasOwnProperty.call(data, "edit_command")) {
    const cmdIndex = settings.custom_commands.findIndex(cmd => cmd.name === data.edit_command);
    if (cmdIndex !== -1) {
      settings.custom_commands[cmdIndex] = {
        name: data.command_name,
        description: data.command_description,
        response: data.command_response
      };
    }
  }

  try {
    await settings.save();
    req.client.logger.debug(`Updated custom commands settings for guild ${req.guild.id}`);
    
    // Add success message to session
    req.session.success = "Custom commands settings updated successfully!";
    res.redirect(303, `/manage/${req.guild.id}/custom-commands`);
  } catch (error) {
    req.client.logger.error("Failed to update custom commands settings:", error);
    
    // Add error message to session
    req.session.error = "Failed to update custom commands settings. Please try again.";
    res.redirect(303, `/manage/${req.guild.id}/custom-commands`);
  }
}

module.exports = {
  getCustomCommandSettings,
  updateCustomCommandSettings
};
