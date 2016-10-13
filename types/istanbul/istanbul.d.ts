declare module 'istanbul' {
    export interface config {
		loadFile: (file: string, overrides: { [key: string]: any }) => Configuration
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

declare module 'instanbul/lib/report/common/defaults' {
	export const watermarks: () => { statements: number[], lines: number[], functions: number[], branches: number[] };
	export const classFor: (type: string, metrics: { [key: string]: any }, watermarks: { [key: string]: any }) => string;
	export const colorize: (str: string, clazz: string) => string;
	export const defaultReporterConfig: () => { [key: string]: string };
}
