import 'chai';
import * as Tunnel from 'digdug/Tunnel';
import { Executor } from './lib/executors/Executor';
import { ReporterDescriptor } from './lib/ReporterManager';
import { EnvironmentType } from './lib/EnvironmentType';
import { IConfig } from 'dojo/loader';
import { Test } from './lib/Test';
import { Suite } from './lib/Suite';
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

interface ProxyConfig {
	basePath?: string;
	excludeInstrumentation?: boolean|RegExp;
	instrument?: boolean;
	instrumenterOptions?: any;
	port?: number;
	waitForRunner?: boolean;
}

interface Proxy {
	config: ProxyConfig;
	server: Object; // http.Server; start(): Promise<void>; }

export interface ReporterConfig {
	console?: any; // Console
	watermarks?: any; // Watermarks;
	filename?: string;
	output?: any; // Console
}

export interface Reporter {
	console: any; // Console;
	output: any; // Output;
	new (config: ReporterConfig): Reporter;
	coverage?: (sessionId: string) => void;
	deprecated?: (name: string, replacement?: string, extra?: string) => void;
	fatalError?: (error: Error) => void;
	newSuite?: (suite: Suite) => void;
	newTest?: (test: Test) => void;
	proxyEnd?: (config: Proxy) => void;
	proxyStart?: (config: Proxy) => void;
	reporterError?: (reporter: Reporter, error: Error) => void;
	runEnd?: (executor: Executor) => void;
	runStart?: (executor: Executor) => void;
	suiteEnd?: (suite: Suite) => void;
	suiteError?: (suite: Suite, error: Error) => void;
	suiteStart?: (suite: Suite) => void;
	testEnd?: (test: Test) => void;
	testFail?: (test: Test) => void;
	testPass?: (test: Test) => void;
	testSkip?: (test: Test) => void;
	testStart?: (test: Test) => void;
	tunnelDownloadProgress?: (tunnel: Tunnel, progress: { loaded: number, total: number }) => void;
	tunnelEnd?: (tunnel: Tunnel) => void;
	tunnelStart?: (tunnel: Tunnel) => void;
	tunnelStatus?: (tunnel: Tunnel, status: string) => void;
}
