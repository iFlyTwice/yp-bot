const { Client, Collection, GatewayIntentBits, Partials, WebhookClient, ApplicationCommandType, PermissionsBitField } = require("discord.js");
const { join } = require("path");
const { table } = require("table");
const Logger = require("@helpers/Logger");
const { recursiveReadDirSync } = require("@helpers/Utils");
const { validateCommand, validateContext } = require("@helpers/Validator");

module.exports = class BotClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
      ],
      partials: [Partials.User, Partials.Message, Partials.Reaction],
      failIfNotExists: false,
      allowedMentions: {
        parse: ["users", "roles", "everyone"],
        repliedUser: false,
      },
    });

    this.config = require("@root/config");

    // Guild Command Permissions
    this.commandPermissions = new Collection();

    // Logger
    this.logger = Logger;

    // Commands
    this.commands = new Collection();
    this.messageCommands = new Collection();
    this.slashCommands = new Collection();

    // Contexts
    this.contextMenus = new Collection();

    // Command Cooldowns
    this.cmdCooldownCache = new Collection();

    // Track commands being used
    this.commandStats = new Collection();

    // Register Events
    this.registerModules();
  }

  /**
   * @param {string} name
   * @param {string} description
   * @param {import('discord.js').PermissionResolvable[]} userPermissions
   */
  getSlashCommandBuilder(name, description, userPermissions) {
    const data = {
      name,
      description,
      type: ApplicationCommandType.ChatInput,
      defaultMemberPermissions: userPermissions,
      dmPermission: false,
    };

    return data;
  }

  /**
   * Find and register commands
   * @param {string} commandsPath
   */
  loadCommands(commandsPath) {
    // Register commands
    const validations = [];
    const commandFiles = recursiveReadDirSync(join(process.cwd(), commandsPath));
    for (const commandFile of commandFiles) {
      const cmd = require(commandFile);
      if (!cmd.name) continue;
      if (cmd.command?.enabled === false) continue;
      validations.push(validateCommand(cmd));
      if (cmd.command?.enabled) this.messageCommands.set(cmd.name, cmd);
      if (cmd.slashCommand?.enabled) this.slashCommands.set(cmd.name, cmd);
      this.commands.set(cmd.name, cmd);
    }

    this.logger.log(`Loaded ${this.messageCommands.size} message commands`);
    this.logger.log(`Loaded ${this.slashCommands.size} slash commands`);
    return validations;
  }

  /**
   * Find and register contexts
   * @param {string} contextPath
   */
  loadContexts(contextPath) {
    // Register contexts
    const validations = [];
    const contextFiles = recursiveReadDirSync(join(process.cwd(), contextPath));
    for (const contextFile of contextFiles) {
      const context = require(contextFile);
      if (!context.name) continue;
      if (context.enabled === false) continue;
      validations.push(validateContext(context));
      this.contextMenus.set(context.name, context);
    }

    this.logger.log(`Loaded ${this.contextMenus.size} context menus`);
    return validations;
  }

  /**
   * Load event handlers
   * @param {string} eventsPath
   */
  loadEvents(eventsPath) {
    const eventFiles = recursiveReadDirSync(join(process.cwd(), eventsPath));
    for (const eventFile of eventFiles) {
      const event = require(eventFile);
      if (!event.name) continue;
      if (event.once) {
        this.once(event.name, (...args) => event.execute(...args));
      } else {
        this.on(event.name, (...args) => event.execute(...args));
      }
    }
    this.logger.log(`Loaded ${eventFiles.length} events`);
  }

  /**
   * Register modules
   */
  registerModules() {
    // Nothing to register here since we're using separate load methods
  }

  /**
   * Get a command by name or alias
   * @param {string} name The command name or alias
   * @returns {import("@structures/Command")|undefined}
   */
  getCommand(name) {
    return this.commands.get(name) 
      || this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(name));
  }

  /**
   * Update command states for a guild
   * @param {string} guildId The guild ID
   * @param {Map<string, boolean>} commands Map of command names to their enabled state
   */
  updateGuildCommandStates(guildId, commands) {
    // Store the command states in memory
    if (!this.commandPermissions.has(guildId)) {
      this.commandPermissions.set(guildId, new Collection());
    }
    
    const guildPerms = this.commandPermissions.get(guildId);
    commands.forEach((enabled, cmdName) => {
      guildPerms.set(cmdName, enabled);
    });

    this.logger.debug(`Updated command states for guild ${guildId}`);
  }

  /**
   * Generate bot invite link
   */
  getInvite() {
    const permissions = ["SendMessages", "ViewChannel", "EmbedLinks", "ManageMessages", "ManageRoles", 
                        "ManageChannels", "BanMembers", "KickMembers", "ModerateMembers", "ManageNicknames",
                        "ManageGuild", "Administrator"];
    return `https://discord.com/oauth2/authorize?client_id=${this.user.id}&permissions=${this.generatePermissionNumber(permissions)}&scope=bot%20applications.commands`;
  }

  /**
   * Generate permission number from array of permission names
   * @param {Array<string>} permissions 
   */
  generatePermissionNumber(permissions) {
    let permissionNumber = 0n;
    for (const permission of permissions) {
      const permissionFlag = PermissionsBitField.Flags[permission];
      permissionNumber |= permissionFlag;
    }
    return permissionNumber;
  }
};
