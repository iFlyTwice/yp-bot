const { getSettings } = require("@schemas/Guild");
const utils = require("../../../utils");

/**
 * Handle GET request for greeting settings
 */
async function getGreetingSettings(req, res) {
  const guildInfos = await utils.fetchGuild(req.guild.id, req.client, req.user.guilds);

  // Get flash messages
  const success = req.session.success;
  const error = req.session.error;
  
  // Clear flash messages
  delete req.session.success;
  delete req.session.error;

  res.render("manager/greeting", {
    guild: guildInfos,
    user: req.userInfos,
    bot: req.client,
    currentURL: `${req.client.config.DASHBOARD.baseURL}/${req.originalUrl}`,
    success,
    error
  });
}

/**
 * Handle POST request for greeting settings
 */
async function updateGreetingSettings(req, res) {
  const settings = await getSettings(req.guild);
  const data = req.body;

  // Welcome Configuration
  if (Object.prototype.hasOwnProperty.call(data, "welcomeDisable")) {
    settings.welcome.enabled = false;
  }

  if (
    Object.prototype.hasOwnProperty.call(data, "welcomeEnable") ||
    Object.prototype.hasOwnProperty.call(data, "welcomeUpdate")
  ) {
    if (data.content !== settings.welcome.content) {
      settings.welcome.content = data.content;
    }

    data.content = data.content.replace(/\r?\n/g, "\\n");
    if (data.content && data.content !== settings.welcome.content) {
      settings.welcome.content = data.content;
    }

    if (data.description !== settings.welcome.description) {
      settings.welcome.description = data.description;
    }

    data.description = data.description?.replaceAll(/\r\n/g, "\\n");
    if (data.description && data.description !== settings.welcome.embed?.description) {
      settings.welcome.embed.description = data.description;
    }

    if (data.footer !== settings.welcome.footer) {
      settings.welcome.footer = data.footer;
    }

    if (data.footer && data.footer !== settings.welcome.embed?.footer) {
      settings.welcome.embed.footer = data.footer;
    }

    if (data.hexcolor !== settings.welcome.hexcolor) {
      settings.welcome.hexcolor = data.hexcolor;
    }

    if (data.hexcolor && data.hexcolor !== settings.welcome.embed?.color) {
      settings.welcome.embed.color = data.hexcolor;
    }

    if (data.image !== settings.welcome.image) {
      settings.welcome.image = data.image;
    }

    if (data.image && data.image !== settings.welcome.embed?.image) {
      settings.welcome.embed.image = data.image;
    }

    data.thumbnail = data.thumbnail === "on" ? true : false;
    if (data.thumbnail !== (settings.welcome.embed?.thumbnail || false)) {
      settings.welcome.embed.thumbnail = data.thumbnail;
    }

    data.channel = req.guild.channels.cache.find((ch) => "#" + ch.name === data.channel)?.id;
    if (data.channel !== settings.welcome.channel) {
      settings.welcome.channel = data.channel;
    }

    if (!settings.welcome.enabled) settings.welcome.enabled = true;
  }

  // Farewell Configuration
  if (Object.prototype.hasOwnProperty.call(data, "farewellDisable")) {
    settings.farewell.enabled = false;
  }

  if (
    Object.prototype.hasOwnProperty.call(data, "farewellEnable") ||
    Object.prototype.hasOwnProperty.call(data, "farewellUpdate")
  ) {
    if (data.content !== settings.farewell.content) {
      settings.farewell.content = data.content;
    }

    data.content = data.content.replace(/\r?\n/g, "\\n");
    if (data.content && data.content !== settings.farewell.content) {
      settings.farewell.content = data.content;
    }

    if (data.description !== settings.farewell.description) {
      settings.farewell.description = data.description;
    }

    data.description = data.description?.replaceAll(/\r\n/g, "\\n");
    if (data.description && data.description !== settings.farewell.embed?.description) {
      settings.farewell.embed.description = data.description;
    }

    if (data.footer !== settings.farewell.footer) {
      settings.farewell.footer = data.footer;
    }

    if (data.footer && data.footer !== settings.farewell.embed?.footer) {
      settings.farewell.embed.footer = data.footer;
    }

    if (data.hexcolor !== settings.farewell.hexcolor) {
      settings.farewell.hexcolor = data.hexcolor;
    }

    if (data.hexcolor && data.hexcolor !== settings.farewell.embed?.color) {
      settings.farewell.embed.color = data.hexcolor;
    }

    if (data.image !== settings.farewell.image) {
      settings.farewell.image = data.image;
    }

    if (data.image && data.image !== settings.farewell.embed?.image) {
      settings.farewell.embed.image = data.image;
    }

    data.thumbnail = data.thumbnail === "on" ? true : false;
    if (data.thumbnail !== (settings.farewell.embed?.thumbnail || false)) {
      settings.farewell.embed.thumbnail = data.thumbnail;
    }

    data.channel = req.guild.channels.cache.find((ch) => "#" + ch.name === data.channel)?.id;
    if (data.channel !== settings.farewell.channel) {
      settings.farewell.channel = data.channel;
    }

    if (!settings.farewell.enabled) settings.farewell.enabled = true;
  }

  try {
    await settings.save();
    req.client.logger.debug(`Updated greeting settings for guild ${req.guild.id}`);
    
    // Add success message to session
    req.session.success = "Greeting settings updated successfully!";
    res.redirect(303, `/manage/${req.guild.id}/greeting`);
  } catch (error) {
    req.client.logger.error("Failed to update greeting settings:", error);
    
    // Add error message to session
    req.session.error = "Failed to update greeting settings. Please try again.";
    res.redirect(303, `/manage/${req.guild.id}/greeting`);
  }
}

module.exports = {
  getGreetingSettings,
  updateGreetingSettings
};
