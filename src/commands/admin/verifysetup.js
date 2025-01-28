const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "verifysetup",
  description: "setup verification role for the server",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<role|off>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "role",
        description: "role to be given when member verifies",
        type: ApplicationCommandOptionType.Role,
        required: false,
      },
      {
        name: "off",
        description: "disable verification role",
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args.join(" ");
    let response;

    if (input.toLowerCase() === "off") {
      response = await setVerifyRole(message, null, data.settings);
    } else {
      const roles = message.guild.findMatchingRoles(input);
      if (roles.length === 0) response = "No matching roles found matching your query";
      else response = await setVerifyRole(message, roles[0], data.settings);
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const role = interaction.options.getRole("role");
    const off = interaction.options.getBoolean("off");
    let response;

    if (off) response = await setVerifyRole(interaction, null, data.settings);
    else response = await setVerifyRole(interaction, role, data.settings);

    await interaction.followUp(response);
  },
};

async function setVerifyRole({ guild }, role, settings) {
  if (role) {
    if (role.id === guild.roles.everyone.id) return "You cannot set `@everyone` as the verification role";
    if (!guild.members.me.permissions.has("ManageRoles")) return "I don't have the `ManageRoles` permission";
    if (guild.members.me.roles.highest.position < role.position)
      return "I don't have the permissions to assign this role";
    if (role.managed) return "Oops! This role is managed by an integration";
  }

  if (!settings.verify) settings.verify = {};
  if (!role) settings.verify.role = null;
  else settings.verify.role = role.id;

  await settings.save();
  return `Configuration saved! Verification role ${!role ? "disabled" : "setup to " + role.toString()}`;
}
