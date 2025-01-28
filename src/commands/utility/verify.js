const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "verify",
  description: "verify yourself to get access to the server and receive your roles",
  category: "UTILITY",
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
  },

  async messageRun(message, args, data) {
    const response = await verifyMember(message.member, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await verifyMember(interaction.member, data.settings);
    await interaction.followUp(response);
  },
};

async function verifyMember(member, settings) {
  if (!settings.verify?.role) return "No verification role has been configured. Ask an admin to set it up using the `.verifysetup` command!";
  
  const role = member.guild.roles.cache.get(settings.verify.role);
  if (!role) return "The configured verification role doesn't exist anymore. Please contact an admin!";

  // Check if user already has the role
  if (member.roles.cache.has(role.id)) {
    return "You are already verified!";
  }

  try {
    // Add verify role and remove autorole if it exists
    await member.roles.add(role);
    if (settings.autorole) {
      const autorole = member.guild.roles.cache.get(settings.autorole);
      if (autorole && member.roles.cache.has(autorole.id)) {
        await member.roles.remove(autorole);
      }
    }
    
    // Create verification success embed
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.SUCCESS)
      .setTitle("✅ Verification Successful")
      .setDescription(`Welcome to ${member.guild.name}!\nYou have been successfully verified and given the ${role.name} role.`)
      .setThumbnail(member.displayAvatarURL())
      .setFooter({ text: "Type .help to see available commands" })
      .setTimestamp();

    // Send welcome message if enabled
    if (settings.welcome?.enabled && settings.welcome?.channel) {
      const welcomeChannel = member.guild.channels.cache.get(settings.welcome.channel);
      if (welcomeChannel && welcomeChannel.permissionsFor(member.guild.members.me).has(["SendMessages", "EmbedLinks"])) {
        welcomeChannel.send({ embeds: [embed] }).catch(() => {});
      }
    }

    return { embeds: [embed] };
  } catch (ex) {
    member.client.logger.error("Verify Cmd Error:", ex);
    return "Failed to verify you. Please contact an admin for help!";
  }
}
