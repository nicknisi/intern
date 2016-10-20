import * as util from '../util';
import { Suite } from '../Suite';
import { Reporter, ReporterConfig } from '../../interfaces';

/**
 * There is no formal spec for this format and everyone does it differently, so good luck! We've mashed as many of the
 * different incompatible JUnit/xUnit XSDs as possible into one reporter.
 */

/**
 * Simple XML generator.
 * @constructor
 * @param {string} nodeName The node name.
 * @param {Object?} attributes Optional attributes.
 */
class XmlNode {
	nodeName: string;
	childNodes: Node[];
	attributes: any;

	constructor(nodeName: string, attributes: Object = {}) {
		this.nodeName = nodeName;

		if (attributes.childNodes) {
			this.childNodes = attributes.childNodes;
			attributes.childNodes = undefined;
		}
		else {
			this.childNodes = [];
		}

		this.attributes = attributes;
	}

	/**
	 * Creates a new XML node and pushes it to the end of the current node.
	 * @param {string} nodeName The node name for the new node.
	 * @param {Object?} attributes Optional attributes for the new node.
	 * @param {(XmlNode|string)[]?} childNodes Optional child nodes for the new node.
	 * @returns {XmlNode} A new node.
	 */
	createNode(nodeName: string, attributes: Object = {}): XmlNode {
		let node = new XmlNode(nodeName, attributes);
		this.childNodes.push(node);
		return node;
	}

	private _escape(str: string): string {
		return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
	}

	private _serializeAttributes(): string {
		const attributes = this.attributes;
		const nodes: string[] = [];

		for (let key in attributes) {
			if (attributes[key] != null) {
				nodes.push(`${key}="${this._escape(attributes[key])}"`);
			}
		}

		return nodes.length ? ' ' + nodes.join(' ') : '';
	}

	private _serializeContent(): string {
		const nodeList = this.childNodes;
		const nodes: string[] = [];

		for (let node of nodeList) {
			nodes.push(typeof node === 'string' ? this._escape(node) : node.toString());
		}

		return nodes.join('');
	}

	toString(): string {
		const children = this._serializeContent();
		return '<' + this.nodeName + this._serializeAttributes() +
			(children.length ? '>' + children + '</' + this.nodeName + '>' : '/>');
	}
}

function createSuiteNode(suite: Suite): XmlNode {
	return new XmlNode('testsuite', {
		name: suite.name || 'Node.js',
		failures: suite.numFailedTests,
		skipped: suite.numSkippedTests,
		tests: suite.numTests,
		time: suite.timeElapsed / 1000,
		childNodes: suite.tests.map(createTestNode)
	});
}

function createTestNode(test): XmlNode {
	if (test.tests) {
		return createSuiteNode(test);
	}

	const node = new XmlNode('testcase', {
		name: test.name,
		time: test.timeElapsed / 1000,
		status: test.error ? 1 : 0
	});

	if (test.error) {
		node.createNode(test.error.name === 'AssertionError' ? 'failure' : 'error', {
			childNodes: [ util.getErrorMessage(test.error) ],
			message: test.error.message,
			type: test.error.name
		});
	}
	else if (test.skipped != null) {
		node.createNode('skipped', {
			childNodes: [ test.skipped ]
		});
	}

	return node;
}

export class JUnit implements Reporter {
	output;

	constructor(config: ReporterConfig = {}) {
		this.output = config.output;
	}

	runEnd(executor): void {
		const rootNode = new XmlNode('testsuites');
		executor.suites.forEach(suite => rootNode.childNodes.push(createSuiteNode(suite)));
		const report = `<?xml version="1.0" encoding="UTF-8" ?>${rootNode.toString()}`;
		this.output.end(report);
	}
}
