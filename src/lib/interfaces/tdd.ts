import * as aspect from 'dojo/aspect';
import * as main from '../../main';
import { Suite, SuiteLifecycleFunction } from '../Suite';
import { Test, TestFunction } from '../Test';

let currentSuite: Suite;
const suites: Suite[] = [];

function registerSuite(name: string, factory: TestFunction): void {
	const parentSuite = currentSuite;

	currentSuite = new Suite({ name: name, parent: parentSuite });
	parentSuite.tests.push(currentSuite);

	suites.push(parentSuite);
	factory.call(currentSuite);
	currentSuite = suites.pop();
}

export function suite(name: string, factory: TestFunction): void {
	if (!currentSuite) {
		main.executor.register(suite => {
			currentSuite = suite;
			registerSuite(name, factory);
			currentSuite = null;
		})
	} else {
		registerSuite(name, factory);
	}
}

export function test (name: string, test: TestFunction): void {
	currentSuite.tests.push(new Test({ name, test, parent: currentSuite }));
}

export function before(fn: Function): void {
	aspect.on(currentSuite, 'setup', fn);
}

export function after(fn: Function): void {
	aspect.on(currentSuite, 'teardown', fn);
}

export function beforeEach(fn: Function): void {
	aspect.on(currentSuite, 'beforeEach', fn);
}

export function afterEach(fn: Function): void {
	aspect.on(currentSuite, 'afterEach', fn);
}
