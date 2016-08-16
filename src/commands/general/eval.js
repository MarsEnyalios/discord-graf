'use babel';
'use strict';

/* eslint-disable no-unused-vars */
import util from 'util';
import stringArgv from 'string-argv';
import * as graf from '../..';
import Command from '../command';
import FriendlyError from '../../errors/friendly';
import CommandFormatError from '../../errors/command-format';
/* eslint-enable no-unused-vars */

let lastResult;

export default class EvalCommand extends Command {
	constructor(bot) {
		super(bot);
		this.name = 'eval';
		this.group = 'general';
		this.groupName = 'eval';
		this.description = 'Evaluates input as JavaScript.';
		this.usage = 'eval <script>';
		this.details = 'Only the bot owner may use this command.';
	}

	isRunnable(message) {
		return message.author.id === this.bot.config.values.owner;
	}

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.server);
		const msg = message; // eslint-disable-line no-unused-vars
		try {
			lastResult = eval(args[0]);
			return `Result: \`${util.inspect(lastResult, { depth: 0 })}\``;
		} catch(err) {
			return `Error while evaluating: ${err}`;
		}
	}
}
