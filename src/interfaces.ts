import 'chai';
import { Executor } from './lib/executors/Executor';
import { ReporterDescriptor } from './lib/ReporterManager';
import { EnvironmentType } from './lib/EnvironmentType';
import { IConfig } from 'dojo/loader';
import { Test } from './lib/Test';
import Command = require('leadfoot/Command');

export interface Config {
	bail?: boolean;
	basePath?: string;
	capabilities?: {
		name?: string,
		build?: string,
		[key: string]: any
	};
	config?: string;
	coverageVariable?: string;
	defaultTimeout?: number;
	environments?: { [key: string]: any }[];
	environmentRetries?: number;
	excludeInstrumentation?: boolean|RegExp;
	filterErrorStack?: boolean;
	functionalSuites?: string[];
	grep?: RegExp;
	instrumenterOptions?: any;
	leaveRemoteOpen?: 'fail'|boolean;
	loader?: any;
	loaderOptions?: IConfig;
	loaders?: {
		'host-browser'?: string;
		'host-node'?: string;
	};
	maxConcurrency?: number;
	proxyOnly?: boolean;
	proxyPort?: number;
	proxyUrl?: string;
	reporters?: (string|ReporterDescriptor)[];
	runnerClientReporter?: {
		waitForRunner?: boolean
	};
	rootSuiteName?: string;
	sessionId?: string;
	setup?: (executor: Executor) => Promise<any>;
	suites?: string[];
	teardown?: (executor: Executor) => Promise<any>;
	tunnel?: string;
	tunnelOptions?: {
		servers?: string[],
		[key: string]: any
	};
	useLoader?: {
		'host-browser'?: string;
		'host-node'?: string;
	};
}

export interface CommandLineArguments {
	config?: string;
	excludeInstrumentation?: boolean|string|RegExp;
	loaders?: { [key: string]: string };
	[key: string]: any;
}

export interface InternError extends Chai.AssertionError {
	actual?: string;
	expected?: string;
	relatedTest?: Test;
}

export interface Remote extends Command<any> {
	environmentType?: EnvironmentType;
	setHeartbeatInterval(delay: number): Command<any>;
}

export interface Removable {
	remove: () => void;
}
