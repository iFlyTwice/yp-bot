const { TextChannel } = require("discord.js");

/**
 * @param {string|import('discord.js').MessagePayload|import('discord.js').MessageOptions} content
 * @param {number} [seconds]
 */
TextChannel.prototype.safeSend = async function (content, seconds) {
  if (!content) return;
  const perms = ["ViewChannel", "SendMessages"];
  if (content.embeds && content.embeds.length > 0) perms.push("EmbedLinks");
  if (!this.permissionsFor(this.guild.members.me).has(perms)) return;

  try {
    if (!seconds) return await this.send(content);
    const message = await this.send(content);
    setTimeout(() => message.deletable && message.delete().catch((ex) => {}), seconds * 1000);
  } catch (ex) {
    this.client.logger.error(`safeSend`, ex);
  }
};
