'use babel';
'use strict';

import { stripIndents } from 'common-tags';
import Command from '../command';
import CommandFormatError from '../../errors/command-format';

export default class DisallowChannelCommand extends Command {
	constructor(bot) {
		super(bot);
		this.name = 'disallowchannel';
		this.aliases = ['disallowchan', 'deletechannel', 'deletechan', 'delchan', 'removechannel', 'removechan'];
		this.group = 'channels';
		this.groupName = 'disallow';
		this.description = 'Disallows command operation in a channel.';
		this.usage = 'disallowchannel <channel>';
		this.details = 'The channel must be the name or ID of a channel, or a channel mention. Only administrators may use this command.';
		this.examples = ['disallowchannel #CoolChannel', 'disallowchannel cool', 'disallowchannel 205536402341888001'];
		this.serverOnly = true;
	}

	isRunnable(message) {
		return this.bot.permissions.isAdmin(message.server, message.author);
	}

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.server);
		const matches = this.bot.util.patterns.channelID.exec(args[0]);
		const idChannel = message.server.channels.get('id', matches[1]);
		const allowedChannels = this.bot.storage.allowedChannels.find(message.server);
		if(allowedChannels.length > 0) {
			const channels = idChannel ? [idChannel] : this.bot.storage.allowedChannels.find(message.server, matches[1]);
			if(channels.length === 1) {
				if(this.bot.storage.allowedChannels.delete(channels[0])) {
					return stripIndents`
						Disallowed operation in ${channels[0]}.
						${this.bot.storage.allowedChannels.find(message.server).length === 0 ? 'Since there are no longer any allowed channels, operation is now allowed in all channels.' : ''}
					`;
				} else {
					return `Operation is already not allowed in ${channels[0]}.`;
				}
			} else if(channels.length > 1) {
				return this.bot.util.disambiguation(channels, 'channels');
			} else {
				return `Unable to identify channel. Use ${this.bot.util.usage('allowedchannels', message.server)} to view the allowed channels.`;
			}
		} else {
			const serverChannels = message.server.channels.getAll('type', 'text');
			const channels = idChannel ? [idChannel] : this.bot.util.search(serverChannels, args[0]);
			if(channels.length === 1) {
				const index = serverChannels.indexOf(channels[0]);
				serverChannels.splice(index, 1);
				for(const chn of serverChannels) this.bot.storage.allowedChannels.save(chn);
				return stripIndents`
					Disallowed operation in ${channels[0]}.
					Since there were no allowed channels already, all other channels have been allowed.
				`;
			} else if(channels.length > 1) {
				return this.bot.util.disambiguation(channels, 'channels');
			} else {
				return `Unable to identify channel. Use ${this.bot.util.usage('allowedchannels', message.server)} to view the allowed channels.`;
			}
		}
	}
}
