const { getSettings } = require("@schemas/Guild");
const utils = require("../../../utils");

/**
 * Handle GET request for commands settings
 */
async function getCommandSettings(req, res) {
  const guildInfos = await utils.fetchGuild(req.guild.id, req.client, req.user.guilds);

  // Get all commands and organize by category
  const categories = {
    ADMIN: [],
    MODERATION: [],
    UTILITY: [],
    FUN: [],
    SOCIAL: [],
    ECONOMY: [],
    MUSIC: [],
    IMAGE: [],
    ANIME: [],
    GIVEAWAY: [],
    TICKET: [],
    SUGGESTION: [],
    STATS: [],
    OWNER: []
  };

  // Convert commands array to Collection and handle nested commands
  const processCommands = (commands) => {
    commands.forEach((cmd) => {
      if (categories.hasOwnProperty(cmd.category)) {
        // Skip duplicate commands (from shared directory)
        if (!categories[cmd.category].find(c => c.name === cmd.name)) {
          categories[cmd.category].push({
            name: cmd.name,
            description: cmd.description || "No description available",
            enabled: guildInfos.commands?.get(cmd.name) !== false
          });
        }
      }
    });
  };

  // Process both main commands and subcommands
  processCommands(req.client.commands);
  if (req.client.messageCommands) processCommands(req.client.messageCommands);
  if (req.client.slashCommands) processCommands(req.client.slashCommands);

  // Get any flash messages
  const success = req.session.success;
  const error = req.session.error;
  
  // Clear flash messages
  delete req.session.success;
  delete req.session.error;

  res.render("manager/commands", {
    guild: guildInfos,
    user: req.userInfos,
    bot: req.client,
    categories: categories,
    currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
    success,
    error
  });
}

/**
 * Handle POST request for commands settings
 */
async function updateCommandSettings(req, res) {
  const settings = await getSettings(req.guild);
  const data = req.body;

  // Update command settings
  if (Object.prototype.hasOwnProperty.call(data, "commandUpdate")) {
    // Get all available commands
    const allCommands = new Set();
    req.client.commands.forEach(cmd => allCommands.add(cmd.name));
    if (req.client.messageCommands) req.client.messageCommands.forEach(cmd => allCommands.add(cmd.name));
    if (req.client.slashCommands) req.client.slashCommands.forEach(cmd => allCommands.add(cmd.name));

    // Process command settings
    allCommands.forEach(cmdName => {
      const formKey = `command_${cmdName}`;
      // If command exists in form data, use that value, otherwise set to false (disabled)
      settings.commands.set(cmdName, data[formKey] === "on");
    });
  }

  try {
    await settings.save();
    
    // Update bot's in-memory command states
    req.client.updateGuildCommandStates(req.guild.id, settings.commands);
    req.client.logger.debug(`Updated command settings for guild ${req.guild.id}`);
    
    // Add success message to session
    req.session.success = "Command settings updated successfully!";
    res.redirect(303, `/manage/${req.guild.id}/commands`);
  } catch (error) {
    req.client.logger.error("Failed to update command settings:", error);
    
    // Add error message to session
    req.session.error = "Failed to update command settings. Please try again.";
    res.redirect(303, `/manage/${req.guild.id}/commands`);
  }
}

module.exports = {
  getCommandSettings,
  updateCommandSettings
};
