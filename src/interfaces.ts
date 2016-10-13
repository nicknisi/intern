import { Executor } from './lib/executors/Executor';
import { ReporterDescriptor } from './lib/ReporterManager';
import { IConfig } from 'dojo/loader';

export interface Config {
	basePath?: string,
	capabilities?: { [key: string]: any };
	config?: string,
	coverageVariable?: string;
	defaultTimeout?: number;
	environments?: { [key: string]: any }[];
	environmentRetries?: number;
	excludeInstrumentation?: 'true'|'false'|boolean|RegExp;
	functionalSuites?: string[];
	grep?: RegExp;
	instrumenterOptions?: any;
	loader?: any;
	loaderOptions?: IConfig;
	loaders?: {
		'host-browser'?: string;
		'host-node'?: string;
	};
	maxConcurrency?: number;
	proxyPort?: number;
	proxyUrl?: string;
	reporters?: (string|ReporterDescriptor)[];
	setup?: (executor: Executor) => Promise<any>;
	suites?: string[];
	teardown?: (executor: Executor) => Promise<any>;
	tunnel?: string;
	tunnelOptions?: { [key: string]: any };
	useLoader?: {
		'host-browser'?: string;
		'host-node'?: string;
	};
}

export interface Removable {
	remove: () => void;
}
