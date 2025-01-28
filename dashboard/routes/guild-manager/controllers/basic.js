const { getSettings } = require("@schemas/Guild");
const utils = require("../../../utils");

/**
 * Handle GET request for basic settings
 */
async function getBasicSettings(req, res) {
  const guildInfos = await utils.fetchGuild(req.guild.id, req.client, req.user.guilds);

  // Get flash messages
  const success = req.session.success;
  const error = req.session.error;
  
  // Clear flash messages
  delete req.session.success;
  delete req.session.error;

  res.render("manager/basic", {
    guild: guildInfos,
    user: req.userInfos,
    bot: req.client,
    currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
    success,
    error
  });
}

/**
 * Handle POST request for basic settings
 */
async function updateBasicSettings(req, res) {
  const settings = await getSettings(req.guild);
  const data = req.body;

  // BASIC CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, "basicUpdate")) {
    if (data.prefix && data.prefix !== settings.prefix) {
      settings.prefix = data.prefix;
    }

    data.flag_translation = data.flag_translation === "on" ? true : false;
    if (data.flag_translation !== (settings.flag_translation.enabled || false)) {
      settings.flag_translation.enabled = data.flag_translation;
    }

    data.invite_tracking = data.invite_tracking === "on" ? true : false;
    if (data.invite_tracking !== (settings.invite.tracking || false)) {
      settings.invite.tracking = data.invite_tracking;
    }
  }

  // STATISTICS CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, "statsUpdate")) {
    data.ranking = data.ranking === "on" ? true : false;
    if (data.ranking !== (settings.stats.enabled || false)) {
      settings.stats.enabled = data.ranking;
    }

    if (data.levelup_message && data.levelup_message !== settings.stats.xp.message) {
      settings.stats.xp.message = data.levelup_message;
    }

    data.levelup_channel = req.guild.channels.cache.find((ch) => "#" + ch.name === data.levelup_channel)?.id || null;
    if (data.levelup_channel !== settings.stats.xp.channel) {
      settings.stats.xp.channel = data.levelup_channel;
    }
  }

  // TICKET CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, "ticketUpdate")) {
    if (data.limit && data.limit != settings.ticket.limit) {
      settings.ticket.limit = data.limit;
    }

    data.channel = req.guild.channels.cache.find((ch) => "#" + ch.name === data.channel)?.id;
    if (data.channel !== settings.ticket.log_channel) {
      settings.ticket.log_channel = data.channel;
    }
  }

  // MODERATION CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, "modUpdate")) {
    if (data.max_warnings && data.max_warnings != settings.max_warn.limit) {
      settings.max_warn.limit = data.max_warnings;
    }

    if (data.max_warn_action !== settings.max_warn.action) {
      settings.max_warn.action = data.max_warn_action;
    }

    data.modlog_channel = req.guild.channels.cache.find((ch) => "#" + ch.name === data.modlog_channel)?.id || null;
    if (data.modlog_channel !== settings.modlog_channel) {
      settings.modlog_channel = data.modlog_channel;
    }
  }

  // AUTOMOD CONFIGURATION
  if (Object.prototype.hasOwnProperty.call(data, "automodUpdate")) {
    if (data.max_strikes && data.max_strikes !== settings.automod.strikes) {
      settings.automod.strikes = data.max_strikes;
    }

    if (data.automod_action && data.automod_action !== settings.automod.action) {
      settings.automod.action = data.automod_action;
    }

    if (data.max_lines && data.max_lines !== settings.automod.max_lines) {
      settings.automod.max_lines = data.max_lines;
    }

    data.anti_attachments = data.anti_attachments === "on" ? true : false;
    if (data.anti_attachments !== (settings.automod.anti_attachments || false)) {
      settings.automod.anti_attachments = data.anti_attachments;
    }

    data.anti_invites = data.anti_invites === "on" ? true : false;
    if (data.anti_invites !== (settings.automod.anti_invites || false)) {
      settings.automod.anti_invites = data.anti_invites;
    }

    data.anti_links = data.anti_links === "on" ? true : false;
    if (data.anti_links !== (settings.automod.anti_links || false)) {
      settings.automod.anti_links = data.anti_links;
    }

    data.anti_spam = data.anti_spam === "on" ? true : false;
    if (data.anti_spam !== (settings.automod.anti_spam || false)) {
      settings.automod.anti_spam = data.anti_spam;
    }

    data.anti_ghostping = data.anti_ghostping === "on" ? true : false;
    if (data.anti_ghostping !== (settings.automod.anti_ghostping || false)) {
      settings.automod.anti_ghostping = data.anti_ghostping;
    }

    data.anti_massmention = data.anti_massmention === "on" ? true : false;
    if (data.anti_massmention !== (settings.automod.anti_massmention || false)) {
      settings.automod.anti_massmention = data.anti_massmention;
    }

    if (data.channels?.length) {
      if (typeof data.channels === "string") data.channels = [data.channels];
      settings.automod.wh_channels = data.channels
        .map((ch) => req.guild.channels.cache.find((c) => "#" + c.name === ch)?.id)
        .filter((c) => c);
    }
  }

  try {
    await settings.save();
    req.client.logger.debug(`Updated basic settings for guild ${req.guild.id}`);
    
    // Add success message to session
    req.session.success = "Basic settings updated successfully!";
    res.redirect(303, `/manage/${req.guild.id}/basic`);
  } catch (error) {
    req.client.logger.error("Failed to update basic settings:", error);
    
    // Add error message to session
    req.session.error = "Failed to update basic settings. Please try again.";
    res.redirect(303, `/manage/${req.guild.id}/basic`);
  }
}

module.exports = {
  getBasicSettings,
  updateBasicSettings
};
