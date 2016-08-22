'use babel';
'use strict';

import { oneLine } from 'common-tags';
import Command from '../command';
import Setting from '../../data/models/setting';

export default class PrefixCommand extends Command {
	constructor(bot) {
		super(bot);
		this.name = 'prefix';
		this.module = 'util';
		this.memberName = 'prefix';
		this.description = 'Shows or sets the command prefix.';
		this.usage = 'prefix [prefix|"default"|"none"]';
		this.details = oneLine`
			If no prefix is provided, the current prefix will be shown.
			If the prefix is "default", the prefix will be reset to the bot\'s default prefix.
			If the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands.
			Only administrators may change the prefix.
		`;
		this.examples = ['prefix', 'prefix -', 'prefix omg!', 'prefix default', 'prefix none'];
	}

	async run(message, args) {
		const storage = this.bot.storage.settings;
		const config = this.bot.config.values;

		if(args[0] && message.server) {
			if(!this.bot.permissions.isAdmin(message.server, message.author)) return 'Only administrators may change the command prefix.';

			// Save the prefix
			const lowercase = args[0].toLowerCase();
			const prefix = lowercase === 'none' ? '' : args[0];
			let response;
			if(lowercase === 'default') {
				storage.delete('command-prefix', message.server);
				response = `Reset the command prefix to the default (currently "${config.commandPrefix}").`;
			} else {
				storage.save(new Setting(message.server, 'command-prefix', prefix));
				response = prefix ? `Set the command prefix to "${args[0]}".` : 'Removed the command prefix entirely.';
			}

			// Build the pattern
			const pattern = this.bot.dispatcher._buildCommandPattern(message.server, message.client.user);
			this.bot.dispatcher._serverCommandPatterns[message.server.id] = pattern;

			return `${response} To run commands, use ${this.bot.util.usage('command', message.server)}.`;
		} else {
			const prefix = message.server ? storage.getValue(message.server, 'command-prefix', config.commandPrefix) : config.commandPrefix;
			return `${prefix ? `The command prefix is "${prefix}".` : 'There is no command prefix.'} To run commands, use ${this.bot.util.usage('command', message.server)}.`;
		}
	}
}