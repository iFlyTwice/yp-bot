const { getSettings } = require("@schemas/Guild");
const utils = require("../../../utils");

/**
 * Handle GET request for logs settings
 */
async function getLogSettings(req, res) {
  const guildInfos = await utils.fetchGuild(req.guild.id, req.client, req.user.guilds);

  // Get flash messages
  const success = req.session.success;
  const error = req.session.error;
  
  // Clear flash messages
  delete req.session.success;
  delete req.session.error;

  res.render("manager/logs", {
    guild: guildInfos,
    user: req.userInfos,
    bot: req.client,
    currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
    success,
    error
  });
}

/**
 * Handle POST request for logs settings
 */
async function updateLogSettings(req, res) {
  const settings = await getSettings(req.guild);
  const data = req.body;

  // Update log settings
  if (Object.prototype.hasOwnProperty.call(data, "logsUpdate")) {
    // Process moderation logs
    data.modlog_channel = req.guild.channels.cache.find((ch) => "#" + ch.name === data.modlog_channel)?.id;
    if (data.modlog_channel !== settings.modlog_channel) {
      settings.modlog_channel = data.modlog_channel;
    }

    // Process message logs
    data.msglog_channel = req.guild.channels.cache.find((ch) => "#" + ch.name === data.msglog_channel)?.id;
    if (data.msglog_channel !== settings.msglog_channel) {
      settings.msglog_channel = data.msglog_channel;
    }

    // Process member logs
    data.memberlog_channel = req.guild.channels.cache.find((ch) => "#" + ch.name === data.memberlog_channel)?.id;
    if (data.memberlog_channel !== settings.memberlog_channel) {
      settings.memberlog_channel = data.memberlog_channel;
    }

    // Process log event settings
    const logEvents = ['bans', 'kicks', 'warns', 'deletes', 'edits', 'joins', 'leaves', 'nicknames', 'roles'];
    logEvents.forEach(event => {
      data[`log_${event}`] = data[`log_${event}`] === "on";
      if (data[`log_${event}`] !== settings.logs[event]) {
        settings.logs[event] = data[`log_${event}`];
      }
    });
  }

  try {
    await settings.save();
    req.client.logger.debug(`Updated logs settings for guild ${req.guild.id}`);
    
    // Add success message to session
    req.session.success = "Logs settings updated successfully!";
    res.redirect(303, `/manage/${req.guild.id}/logs`);
  } catch (error) {
    req.client.logger.error("Failed to update logs settings:", error);
    
    // Add error message to session
    req.session.error = "Failed to update logs settings. Please try again.";
    res.redirect(303, `/manage/${req.guild.id}/logs`);
  }
}

module.exports = {
  getLogSettings,
  updateLogSettings
};
