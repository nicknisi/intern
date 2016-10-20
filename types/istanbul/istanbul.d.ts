declare module 'istanbul' {
	export interface config {
		loadFile: (file: string, overrides: { [key: string]: any }) => Configuration;
	}

	export interface ContentWriter {
	}

	export interface FileWriter {
	}

	export interface Hook {
		hookRequire: (matcher: Function, transformer: Function, options?: any) => void;
		unhookRequire: () => void;
		hookCreateScript: (matcher: Function, transformer: Function, options?: any) => void;
		unhookCreateScript: () => void;
		hookRunInThisContext: (matcher: Function, transformer: Function, options?: any) => void;
		unhookRunInThisContext: () => void;
		unloadRequireCache: (matcher: Function) => void;
	}

	export interface Report {
	}

	export interface Store {
	}

	export interface ObjectUtils {
	}

	export interface Writer {
	}

	export interface Watermarks {
		statements: number[];
		lines: number[];
		functions: number[];
		branches: number[];
	}

	export class Collector {
		constructor(options?: any);
		add(coverage: any, testName?: string): void;
	}

	export class Configuration {
	}

	export class Instrumenter {
		constructor(options?: any);
		instrumentSync(code: string, filename: string): string;
	}

	export class Reporter {
		constructor(cfg?: Configuration, dir?: string);
		add(fmt: string): void;
		addAll(fmts: Array<string>): void;
		write(collector: Collector, sync: boolean, callback: Function): void;
	}

	export const hook: Hook;

	export const utils: any;

	export const matcherFor: Promise<Function>;

	export const VERSION: string;
}

declare module 'istanbul/lib/report' {
	import { EventEmitter } from 'events';
	import { Collector, Configuration } from 'istanbul';
	export class Report extends EventEmitter {
		static mix(cons: Object, proto: Object): void;
		static register(ctor: Function): void;
		static create(t: string, opts: Object): void;
		static loadAll(dir: string): void;
		synopsis(): void;
		getDefaultConfig(): Configuration;
		writeReport(collector: Collector, sync?: boolean): void;
	}
}

declare module 'istanbul/lib/report/common/defaults' {
	export const watermarks: () => { statements: number[], lines: number[], functions: number[], branches: number[] };
	export const classFor: (type: string, metrics: { [key: string]: any }, watermarks: { [key: string]: any }) => string;
	export const colorize: (str: string, clazz: string) => string;
	export const defaultReporterConfig: () => { [key: string]: string };
}

declare module 'istanbul/lib/report/cobertura' {
	import { Report } from 'istanbul/lib/report';
	import { Configuration, Collector } from 'istanbul';
	export class CoberturaReport extends Report {
		new (opts: Configuration): CoberturaReport;
		projectRoot: string;
		dir?: string;
		file?: string;
		opts?: Configuration;
		writeReport(collector: Collector, sync?: boolean): void;
	}
}

declare module 'istanbul/lib/report/text' {
	// static TYPE: string;
	import { Report } from 'istanbul/lib/report';
	import { Watermarks } from 'istanbul';
	export class TextReport extends Report {
		dir: string;
		opts?: string;
		summary: any;
		maxCols: number;
		watermarks: Watermarks;
	}
}
