import * as aspect from 'dojo/aspect';
import * as main from '../../main';
import { Suite, SuiteConfig, SuiteLifecycleFunction } from '../Suite';
import { Test, TestFunction } from '../Test';

export interface ObjectSuiteConfig extends SuiteConfig {
	after?: SuiteLifecycleFunction;
	before?: SuiteLifecycleFunction;
}

export function registerSuite(mainConfig: ObjectSuiteConfig) {
	main.executor.register(function (suite) {
		let config = mainConfig;

		// enable per-suite closure, to match feature parity with other interfaces like tdd/bdd more closely;
		// without this, it becomes impossible to use the object interface for functional tests since there is no
		// other way to create a closure for each main suite
		if (typeof config === 'function') {
			config = config();
		}

		_registerSuite(config, suite);
	});
};

function _registerSuite(config: ObjectSuiteConfig, parentSuite: Suite) {
	/* jshint maxcomplexity: 13 */
	const suite = new Suite({ parent: parentSuite });
	const tests = suite.tests;

	parentSuite.tests.push(suite);

	for (let k in config) {
		if (k === 'before') {
			k = 'setup';
		}
		if (k === 'after') {
			k = 'teardown';
		}

		switch (k) {
		case 'name':
			suite.name = config.name;
			break;
		case 'timeout':
			suite.timeout = config.timeout;
			break;
		case 'setup':
			aspect.on(suite, 'setup', config.setup);
			break;
		case 'beforeEach':
			aspect.on(suite, 'beforeEach', config.beforeEach);
			break;
		case 'afterEach':
			aspect.on(suite, 'afterEach', config.afterEach);
			break;
		case 'teardown':
			aspect.on(suite, 'teardown', config.teardown);
			break;
		default:
			let testOrSuite = config[k];
			if (typeof testOrSuite !== 'function') {
				testOrSuite.name = testOrSuite.name || k;
				_registerSuite(testOrSuite, suite);
			}
			else {
				tests.push(new Test({ name: k, test: testOrSuite, parent: suite }));
			}
		}
	}
}
