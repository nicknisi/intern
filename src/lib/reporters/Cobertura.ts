import { resolve } from 'path';
import { Collector } from 'istanbul';
import { CoberturaReporter } from 'istanbul/lib/report/cobertura';
import { ReporterConfig } from '../ReporterManager';

export interface CoberturaReporterConfig extends ReporterConfig {
	projectRoot?: string;
}

export class Cobertura {
	private _collector: Collector;
	private _reporter: CoberturaReporter;

	constructor(config: CoberturaReporterConfig = {}) {
		this._collector = new Collector();
		this._reporter = new CoberturaReporter({
			file: config.filename,
			watermarks: config.watermarks
		});

		if (config.projectRoot) {
			this._reporter.projectRoot = resolve(config.projectRoot);
		}
	}

	coverage(sessionId: string, coverage: Object) {
		this._collector.add(coverage);
	}

	runEnd() {
		this._reporter.writeReport(this._collector, true);
	}
}