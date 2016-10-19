import * as aspect from 'dojo/aspect';
import * as Promise from 'dojo/Promise';
import { assert as chaiAssert, AssertionError } from 'chai';
import * as main from '../../main';
import { Suite } from '../Suite';
import { Test, TestFunction } from '../Test';
import * as util from '../util';
import { Removable } from '../../interfaces';

let currentSuites: Suite[];

export namespace assert {
	export let _numAssertions = 0;
	export let _expectedAssertions: number = NaN;

	function wrapChai(name: string): Function {
		return function () {
			// TODO: Could try/catch errors to make them act more like the way QUnit acts, where an assertion failure
			// does not fail the test, but not sure of the best way to get multiple assertion failures out of a test
			// like that
			++_numAssertions;
			( <{ [key: string]: any }> chaiAssert)[name].apply(chaiAssert, arguments);
		};
	}

	export const deepEqual = wrapChai('deepEqual');
	export const equal = wrapChai('equal');
	export const notDeepEqual = wrapChai('notDeepEqual');
	export const notEqual = wrapChai('notEqual');
	export const notPropEqual = wrapChai('notDeepEqual');
	export const notStrictEqual = wrapChai('notStrictEqual');
	export const ok = wrapChai('ok');
	export const propEqual = wrapChai('propEqual');
	export const strictEqual = wrapChai('strictEqual');

	export function expect(numTotal: number): number | void {
		if (arguments.length === 1) {
			_expectedAssertions = numTotal;
		}
		else {
			return _expectedAssertions;
		}
	}

	export function push(ok: boolean, actual: any, expected: any, message: string): void {
		++_numAssertions;
		if (!ok) {
			throw new AssertionError(message, { actual: actual, expected: expected });
		}
	}

	export const throws = (function () {
		const throws = wrapChai('throws');
		return function (this: any, fn: Function, expected?: any, message?: string): void {
			if (typeof expected === 'function') {
				++_numAssertions;
				try {
					fn();
					throw new AssertionError(
						(message ? message + ': ' : '') +
						'expected [Function] to throw'
					);
				}
				catch (error) {
					if (!expected(error)) {
						throw new AssertionError(
							(message ? message + ': ' : '') +
							'expected [Function] to throw error matching [Function] but got ' +
							(error instanceof Error ? error.toString() : error)
						);
					}
				}
			}
			else {
				throws.apply(this, arguments);
			}
		};
	})();

	export function raises(this: any, fn: Function, expected?: any, message?: string): void {
		return throws.apply(this, arguments);
	}

	export function verifyAssertions() {
		if (isNaN(_expectedAssertions) && config.requireExpects) {
			throw new AssertionError(`Expected number of assertions to be defined, but expect() was not called.`);
		}

		if (!isNaN(_expectedAssertions) && _numAssertions !== _expectedAssertions) {
			throw new AssertionError(`Expected ${_expectedAssertions} assertions, but ${_numAssertions} were run`);
		}
	}
}

function registerTest(name: string, test: TestFunction) {
	currentSuites.forEach(function (suite) {
		suite.tests.push(new Test({
			name: name,
			parent: suite,
			test: test
		}));
	});
}

let autostartHandle: Removable;
let startMethod: Function;
let stopMethod: Function;
let _module: any; // TODO: fix type

export const config = {
	get autostat(): boolean {
		return !autostartHandle;
	},

	set autostart(value: boolean) {
		if (autostartHandle) {
			autostartHandle.remove();
			autostartHandle = null;
		}

		if (!value) {
			autostartHandle = aspect.after(main.executor.config, 'before', function (waitGuard: Promise<any>) {
				return new Promise(resolve => {
					startMethod = function () {
						if (waitGuard && waitGuard.then) {
							waitGuard.then(resolve);
						}
						else {
							resolve();
						}
					};
				});
			});
			startMethod = function () {
				autostartHandle.remove();
				autostartHandle = null;
				startMethod = function () {};
			};
		}
	},

	get module() {
		return _module;
	},

	set module(value) {
		_module = value;
		main.executor.register(function (suite: Suite) {
			suite.grep = new RegExp('(?:^|[^-]* - )' + util.escapeRegExp(value) + ' - ', 'i');
		});
	},

	requireExpects: false,
	testTimeout: Infinity
};

export function start() {
	if (typeof startMethod === 'function') {
		startMethod();
	}
}

export function stop() {
}

export function extend(target: { [key: string]: any }, mixin: { [key: string]: any }, skipExistingTargetProperties?: boolean): Object {
	for (let key in mixin) {
		if (mixin.hasOwnProperty(key)) {
			if (mixin[key] === undefined) {
				delete target[key];
			}
			else if (!skipExistingTargetProperties || target[key] === undefined) {
				target[key] = mixin[key];
			}
		}
	}
	return target;
}

export function asyncTest(name: string, test: TestFunction): void {
	registerTest(name, function (this: Test) {
		let numCallsUntilResolution = 1;
		this.timeout = config.testTimeout;
		const dfd = this.async();
		let testAssert = lang.delegate(assert, { _expectedAssetions: NaN, numAssertions: 0 });

		stopMethod = function () {
			++numCallsUntilResolution;
		};

		startMethod = dfd.rejectOnError(function () {
			if (--numCallsUntilResolution === 0) {
				try {
					testAssert.verifyAssertions();
					dfd.resolve();
				}
				finally {
					stopMethod = startMethod = function () {};
				}
			}
		});

		try {
			test.call(this.parent._quinitContext, testAssert);
		}
		catch (error) {
			dfd.reject(error);
		}
	});
}

export function module(name: string, lifecycle): void {
	currentSuites = [];
	main.executor.register(function (parent) {
		var suite = new Suite({ name, parent, _qunitContext: {} });
		parent.tests.push(suite);
		currentSuites.push(suite);

		if (lifecycle) {
			if (lifecycle.setup) {
				aspect.after(suite, 'beforeEach', function (this: { _qunitContext: Object }) {
					lifecycle.setup.call(this._qunitContext);
				});
			}
			if (lifecycle.teardown) {
				aspect.after(suite, 'afterEach', function (this: { _qunitContext: Object }) {
					lifecycle.teardown.call(this._qunitContext);
				});
			}
		}
	});
}

export function test(name: string, test: TestFunction): void {
	registerTest(name, function () {
		var testAssert = lang.delegate(assert, { _expectedAssertions: NaN, _numAssertions: 0 });

		test.call(this.parent._qunitContext, testAssert);
		testAssert.verifyAssertions();
	});
}

export function begin(callback: Function): void {
	main.executor.reporterManager.on('runStart', function (executor) {
		let totalTests = executor.suites.reduce((numTests, suite) => numTests + suite.numTests, 0);
		callback({ totalTests });
	});
}

export function done(callback: Function): void {
	main.executor.reporterManager.on('runEnd', function (executor) {
		let failed = executor.suites.reduce((numTests, suite) => numTests + suite.numFailedTests, 0);
		let passed = executor.suites.reduce((numTests, suite) => numTests + suite.numTests, 0);
		let skipped = executor.suites.reduce((numTests, suite) => numTests + suite.numSkippedTests, 0);
		let runtime = Math.max.apply(null, executor.suites.map(suite => suite.timeElapsed));

		callback({ failed, skipped, passed, runtime });
	});
}

export function log(callback: Function): void {
	main.executor.reporterManager.on('testEnd', function (test) {
		callback({
			result: test.hasPassed,
			actual: test.error && test.error.actual,
			expected: test.error && test.error.expected,
			message: test.error && test.error.message,
			source: test.error && test.error.stack,
			module: test.parent.name,
			name: test.name
		});
	});
}

export function moduleDone(callback: Function): void {
	main.executor.reporterManager.on('suiteEnd', function (suite: Suite) {
		if (suite._qunitContext) {
			callback({
				name: suite.name,
				failed: suite.numFailedTests,
				passed: suite.numTests - suite.numFailedTests - suite.numSkippedTests,
				total: suite.numTests,
				runtime: suite.timeElapsed
			});
		}
	});
}

export function moduleStart(callback: Function): void {
	main.executor.reporterManager.on('suiteStart', function (suite: Suite) {
		if (suite._qunitContext) {
			callback({
				name: suite.name
			});
		}
	});
}

export function testDone(callback: Function): void {
	main.executor.reporterManager.on('testEnd', function (test: Test) {
		callback({
			name: test.name,
			module: test.parent.name,
			failed: test.hasPassed ? 0 : 1,
			passed: test.hasPassed ? 1 : 0,
			total: 1,
			runtime: test.timeElapsed
		});
	});
}

export function testStart(callback: Function): void {
	main.executor.reporterManager.on('testStart', function (test: Test) {
		callback({
			name: test.name,
			module: test.parent.name
		});
	});
}
