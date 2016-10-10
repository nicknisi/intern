import 'chai';
import { Test } from './Test';
import Command = require('leadfoot/Command');

export interface InternError extends Chai.AssertionError {
	actual?: string;
	expected?: string;
	relatedTest?: Test;
}

export interface ProxiedSessionCommand extends Command<any> {
	setHeartbeatInterval(delay: number): Command<any>;
}
