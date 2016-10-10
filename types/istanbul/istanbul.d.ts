declare namespace istanbul {
	export interface InstrumenterOptions {
		coverageVariable?: string,
		embedSource?: boolean,
		preserveComments?: boolean,
		noCompact?: boolean,
		esModules?: boolean,
		noAutoWrap?: boolean,
		codeGenerationOptions?: { [key: string]: any },
		debug?: boolean,
		walkDebug?: boolean
	}

    export interface Instrumenter {
		lastSourceMap: any;
	}
}
