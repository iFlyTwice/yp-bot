const { purgeMessages } = require("@helpers/ModUtils");
const { EmbedBuilder, WebhookClient } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

// Initialize webhook
const webhookClient = process.env.LOG_WEBHOOK_URL ? new WebhookClient({ url: process.env.LOG_WEBHOOK_URL }) : null;

async function logToWebhook(member, channel, amount, deletedAmount) {
  if (!webhookClient) return;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "Message Clear Log" })
    .addFields(
      { name: "Moderator", value: `${member.user.tag} [${member.id}]`, inline: true },
      { name: "Channel", value: `${channel.name} [${channel.id}]`, inline: true },
      { name: "Attempted", value: amount.toString(), inline: true },
      { name: "Deleted", value: deletedAmount.toString(), inline: true }
    )
    .setTimestamp();

  webhookClient.send({ embeds: [embed] }).catch(() => {});
}

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "clear",
  description: "deletes the specified amount of messages",
  category: "MODERATION",
  userPermissions: ["ManageMessages"],
  botPermissions: ["ManageMessages", "ReadMessageHistory"],
  command: {
    enabled: true,
    usage: "<amount>",
    minArgsCount: 1,
  },

  async messageRun(message, args) {
    const amount = args[0];
    if (isNaN(amount)) return message.safeReply("Numbers are only allowed");
    if (parseInt(amount) > 99) return message.safeReply("The max amount of messages that I can delete is 99");

    const { channel } = message;
    message.client.logger.debug(`Attempting to clear ${amount} messages in ${channel.name}`);
    const response = await purgeMessages(message.member, channel, "ALL", amount);

    if (typeof response === "number") {
      await logToWebhook(message.member, channel, amount, response);
      return channel.safeSend(`Successfully deleted ${response} messages`, 5);
    } else if (response === "BOT_PERM") {
      return message.safeReply("I don't have `Read Message History` & `Manage Messages` to delete messages", 5);
    } else if (response === "MEMBER_PERM") {
      return message.safeReply("You don't have `Read Message History` & `Manage Messages` to delete messages", 5);
    } else if (response === "NO_MESSAGES") {
      return channel.safeSend("No messages found that can be cleaned", 5);
    } else {
      return message.safeReply(`Error occurred! Failed to delete messages`);
    }
  }
};
