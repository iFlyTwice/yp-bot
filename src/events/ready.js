const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 */
async function loadCommandStates(client) {
  const guilds = client.guilds.cache;
  for (const guild of guilds.values()) {
    const settings = await getSettings(guild);
    if (settings.commands?.size > 0) {
      client.updateGuildCommandStates(guild.id, settings.commands);
    }
  }
  client.logger.success("Command states loaded for all guilds");
}

module.exports = {
  name: "ready",
  once: true,

  async execute(client) {
    client.logger.success(`Logged in as ${client.user.tag}!`);
    await loadCommandStates(client);

    // Set bot status
    if (client.config.PRESENCE.ENABLED) {
      const type = client.config.PRESENCE.TYPE;
      const status = client.config.PRESENCE.STATUS;
      const message = client.config.PRESENCE.MESSAGE;

      client.user.setPresence({
        status,
        activities: [
          {
            name: message
              .replace("{servers}", client.guilds.cache.size)
              .replace("{members}", client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)),
            type,
          },
        ],
      });
    }
  },
};
