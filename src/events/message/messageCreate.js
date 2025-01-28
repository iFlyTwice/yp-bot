const { commandHandler, automodHandler, statsHandler } = require("@src/handlers");
const { PREFIX_COMMANDS } = require("@root/config");
const { getSettings } = require("@schemas/Guild");

module.exports = {
  name: "messageCreate",
  
  /**
   * @param {import('@src/structures').BotClient} client
   * @param {import('discord.js').Message} message
   */
  async execute(message) {
    const client = message.client;
    if (!message.guild || message.author.bot) return;
    const settings = await getSettings(message.guild);

    // command handler
    let isCommand = false;
    if (PREFIX_COMMANDS.ENABLED) {
      // check for bot mentions
      if (message.content.includes(`${client.user.id}`)) {
        message.channel.safeSend(`> My prefix is \`${settings.prefix}\``);
      }

      if (message.content && message.content.startsWith(settings.prefix)) {
        const invoke = message.content.replace(`${settings.prefix}`, "").split(/\s+/)[0];
        const cmd = client.getCommand(invoke);
        client.logger.debug(`Command invoked: ${invoke}`);
        client.logger.debug(`Command found: ${cmd ? cmd.name : 'Not found'}`);
        if (cmd) {
          isCommand = true;
          client.logger.debug(`User permissions: ${message.member.permissions.toArray()}`);
          client.logger.debug(`Bot permissions: ${message.guild.members.me.permissions.toArray()}`);
          commandHandler.handlePrefixCommand(message, cmd, settings);
        }
      }
    }

    // stats handler
    if (settings.stats.enabled) await statsHandler.trackMessageStats(message, isCommand, settings);

    // if not a command
    if (!isCommand) await automodHandler.performAutomod(message, settings);
  }
};
