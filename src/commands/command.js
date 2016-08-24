'use babel';
'use strict';

import Setting from '../data/models/setting';

/** A command that can be run in a bot */
export default class Command {
	/**
	 * @param {Bot} bot - The bot the command is for
	 * @param {CommandInfo} info - The command information
	 */
	constructor(bot, info) { // eslint-disable-line complexity
		if(new.target === Command) throw new Error('The base command class may not be instantiated.');
		if(!bot) throw new Error('A bot must be specified.');
		if(!info) throw new Error('Command info must be specified.');
		if(!info.name) throw new Error('Command must have a name specified.');
		if(info.aliases && !Array.isArray(info.aliases)) throw new TypeError('Command aliases must be an array.');
		if(!info.module) throw new Error('Command must have a module specified.');
		if(!info.memberName) throw new Error('Command must have a memberName specified.');
		if(!info.description) throw new Error('Command must have a description specified.');
		if(info.examples && !Array.isArray(info.examples)) throw new TypeError('Command examples must be an array.');
		if(info.argsType && !['single', 'multiple'].includes(info.argsType)) throw new RangeError('Command argsType must be one of "single" or "multiple".');
		if(info.argsType === 'multiple' && info.argsCount && info.argsCount < 2) throw new RangeError('Command argsCount must be at least 2.');
		if(info.patterns && !Array.isArray(info.patterns)) throw new TypeError('Command patterns must be an array.');

		/** @type {Bot} */
		this.bot = bot;

		/**
		 * @type {string}
		 * @see {@link CommandInfo}
		 */
		this.name = info.name;

		/**
		 * @type {string[]}
		 * @see {@link CommandInfo}
		 */
		this.aliases = info.aliases || [];

		/**
		 * @type {string}
		 * @see {@link CommandInfo}
		 */
		this.module = info.module;

		/**
		 * @type {string}
		 * @see {@link CommandInfo}
		 */
		this.memberName = info.memberName;

		/**
		 * @type {string}
		 * @see {@link CommandInfo}
		 */
		this.description = info.description;

		/**
		 * @type {string}
		 * @see {@link CommandInfo}
		 */
		this.usage = info.usage || info.name;

		/**
		 * @type {string}
		 * @see {@link CommandInfo}
		 */
		this.details = info.details || null;

		/**
		 * @type {string[]}
		 * @see {@link CommandInfo}
		 */
		this.examples = info.examples || null;

		/**
		 * @type {boolean}
		 * @see {@link CommandInfo}
		 */
		this.serverOnly = !!info.serverOnly;

		/**
		 * @type {boolean}
		 * @see {@link CommandInfo}
		 */
		this.defaultHandling = 'defaultHandling' in info ? info.defaultHandling : true;

		/**
		 * @type {string}
		 * @see {@link CommandInfo}
		 */
		this.argsType = info.argsType || 'single';

		/**
		 * @type {number}
		 * @see {@link CommandInfo}
		 */
		this.argsCount = info.argsCount || 0;

		/**
		 * @type {boolean}
		 * @see {@link CommandInfo}
		 */
		this.argsSingleQuotes = 'argsSingleQuotes' in info ? info.argsSingleQuotes : true;

		/**
		 * @type {RegExp[]}
		 * @see {@link CommandInfo}
		 */
		this.patterns = info.patterns || null;
	}

	/**
	 * Checks a user's permission on a server
	 * @param {Server} server - The server to test the user's permission in
	 * @param {User} user - The user to test the permission of
	 * @return {boolean} Whether or not the user has permission to use the command in a server
	 */
	hasPermission(server, user) { // eslint-disable-line no-unused-vars
		return true;
	}

	/**
	 * Runs the command
	 * @param {Message} message - The message the command is being run for
	 * @param {string[]} args - The arguments for the command, or the matches from a pattern
	 * @param {boolean} fromPattern - Whether or not the command is being run from a pattern match or not
	 * @return {Promise<CommandResult|string[]|string>} The result of running the command
	 */
	async run(message, args, fromPattern) { // eslint-disable-line no-unused-vars
		throw new Error(`${this.constructor.name} doesn't have a run() method, or called the super.run() method.`);
	}


	/**
	 * Enables or disables the command on a server
	 * @param {Server|string} server - The server or server ID
	 * @param {boolean} enabled - Whether the command should be enabled or disabled
	 * @return {void}
	 * @see {@link Command.setEnabled}
	 */
	setEnabled(server, enabled) {
		this.constructor.setEnabled(this.bot.storage.settings, server, this, enabled);
	}

	/**
	 * Enables or disables a command on a server
	 * @param {SettingStorage} settings - The setting storage to use
	 * @param {Server|string} server - The server or server ID
	 * @param {Command|string} command - The command or command name
	 * @param {boolean} enabled - Whether the command should be enabled or disabled
	 * @return {void}
	 * @see {@link Command#setEnabled}
	 */
	static setEnabled(settings, server, command, enabled) {
		settings.save(new Setting(server, `cmd-${command.name || command}`, enabled));
	}

	/**
	 * Checks if the command is enabled on a server
	 * @param {Server} server - The server
	 * @return {boolean} Whether or not the command is enabled
	 * @see {@link Command.isEnabled}
	 */
	isEnabled(server) {
		return this.constructor.isEnabled(this.bot.storage.settings, server, this);
	}

	/**
	 * Checks if a command is enabled on a server
	 * @param {SettingStorage} settings - The setting storage to use
	 * @param {Server} server - The server
	 * @param {Command|string} command - The command or command name
	 * @return {boolean} Whether or not the command is enabled
	 * @see {@link Command#isEnabled}
	 */
	static isEnabled(settings, server, command) {
		return settings.getValue(server, `cmd-${command.name || command}`, true);
	}

	/**
	 * Checks if the command is usable for a message
	 * @param {?Message} message - The message
	 * @return {boolean} Whether or not the command is usable
	 */
	isUsable(message = null) {
		if(this.serverOnly && message && !message.channel.server) return false;
		return !message || (this.isEnabled(message.channel.server) && this.hasPermission(message.channel.server, message.author));
	}
}

/**
 * @typedef {Object} CommandInfo
 * @property {string} name - The name of the command
 * @property {string[]} aliases - Alternative names for the command
 * @property {string} module - The ID of the module the command belongs to
 * @property {string} memberName - The member name of the command in the module
 * @property {string} description - A short description of the command
 * @property {string} [usage=name] - The command usage format string
 * @property {string} [details] - A detailed description of the command and its functionality
 * @property {string[]} [examples] - Usage examples of the command
 * @property {boolean} [serverOnly=false] - Whether or not the command should only function in a server channel
 * @property {boolean} [defaultHandling=true] - Whether or not the default command handling should be used. If false, then only patterns will trigger the command.
 * @property {string} [argsType=single] - One of 'single' or 'multiple'. When 'single', the entire argument string will be passed to run as one argument.
 * When 'multiple', it will be passed as multiple arguments.
 * @property {number} [argsCount=0] - The number of arguments to parse from the command string. Only applicable when argsType is 'multiple'. If nonzero, it should be at least 2.
 * When this is 0, the command argument string will be split into as many arguments as it can be. When nonzero, it will be split into a maximum of this number of arguments.
 * @property {boolean} [argsSingleQuotes=true] - Whether or not single quotes should be allowed to box-in arguments in the command string.
 * @property {RegExp[]} [patterns] - Patterns to use for triggering the command
 */
