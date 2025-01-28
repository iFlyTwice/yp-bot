const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Guild} guild
 */
async function loadCommandStates(client, guild) {
  const settings = await getSettings(guild);
  if (settings.commands?.size > 0) {
    client.updateGuildCommandStates(guild.id, settings.commands);
  }
}

module.exports = {
  name: "guildCreate",
  async execute(guild) {
    await loadCommandStates(guild.client, guild);
  },
};
