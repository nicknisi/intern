import * as lang from 'dojo/lang';
import { EnvironmentType } from './EnvironmentType';

/**
 * Resolves a collection of Intern test environments to a list of service environments
 *
 * @param capabilities a base set of capabilities for all environments
 * @param environments a list of user-requested enviromnents
 * @param available a list of available environments
 * @returns a list of flattened service environments
 */
export function resolveEnvironments(capabilities: Object, environments: Environment[], available?: Environment[]) {
	environments = createPermutations(capabilities, environments);

	// Expand any version ranges or aliases in the environments.
	environments.forEach(function (environment) {
		environment.version = resolveVersions(environment, available);
	});

	// Perform a second round of permuting to handle any expanded version ranges
	return createPermutations({}, environments).map(function (environment) {
		return new EnvironmentType(environment);
	});
}

/**
 * A comparator for sorting numbers in ascending order
 */
function ascendingNumbers(a: number, b: number) {
	return a - b;
}

/**
 * Expands a range of versions using available environments
 */
function expandVersionRange(left: number, right: number, availableVersions: number[]) {
	if (availableVersions.indexOf(left) === -1 || availableVersions.indexOf(right) === -1) {
		throw new Error('The version range ' + left + '..' + right + ' is unavailable');
	}
	return availableVersions.filter(function (version) {
		return version >= left && version <= right;
	});
}

/**
 * Resolves a version alias from a list of available versions.
 *
 * Assumes availableVersions is sorted in ascending order. Acceptable versions are:
 *
 *   - {number}
 *   - '{number}'
 *   - 'latest'
 *   - 'latest-{number}'
 */
function resolveVersionAlias(version: string, availableVersions: string[]) {
	let pieces = version.split('-');
	if (pieces.length > 2) {
		throw new Error('Invalid alias syntax "' + version + '"');
	}
		
	pieces = pieces.map(function (piece) {
		return piece.trim();
	});

	if (
		(pieces.length === 2 && (pieces[0] !== 'latest' || isNaN(Number(pieces[1])))) ||
		(pieces.length === 1 && isNaN(Number(pieces[0])) && pieces[0] !== 'latest')
	) {
		throw new Error('invalid alias syntax "' + version + '"');
	}

	if (pieces[0] === 'latest') {
		var offset = pieces.length === 2 ? Number(pieces[1]) : 0;
		if (offset > availableVersions.length) {
			var message = 'Can\'t get ' + version + '; ' + availableVersions.length + ' version';
			message += (availableVersions.length !== 1 ? 's are' : ' is') + ' available';
			throw new Error(message);
		}

		return availableVersions[availableVersions.length - 1 - offset];
	}
	else {
		return pieces[0];
	}
}

/**
 * Splits a version into one or two version strings using the '..' delimiter
 *
 * @returns {string[]}
 */
function splitVersions(versionSpec: string) {
	const versions = versionSpec.split('..');

	if (versions.length > 2) {
		throw new Error('Invalid version syntax');
	}
		
	return versions.map(function (version) {
		return version.trim();
	});
}

type Environment = { version: string, [key: string]: any };

/**
 * Get a list of versions from a list of available environments filtered by the current environment.
 *
 * @param environment the environment for which versions should match
 * @param available a list of available environments
 * @returns a list of version numbers from available filtered by the current environment
 */
function getVersions(environment: Environment, available: Environment[]) {
	let versions: { [key: string]: boolean } = {};

	available.filter(function (availableEnvironment) {
		// Return true if there are no mismatching keys
		return !Object.keys(environment).filter(function (key) {
			return key !== 'version';
		}).some(function (key) {
			return (key in availableEnvironment) && availableEnvironment[key] !== environment[key];
		});
	}).forEach(function (environment) {
		versions[environment.version] = true;
	});
		
	return Object.keys(versions).sort(ascending);
}

/**
 * Resolves version aliases (e.g. latest, latest - 1) and version ranges (e.g. 36 .. latest or latest - 3 .. latest)
 * using the environment list returned by tunnel#getEnvironments().
 *
 * @param environment an object with an optional version property
 * @param available a list of enviornment available on the target service
 * @returns the environment with resolved version aliases
 */
function resolveVersions(environment: Environment, available: Environment[]) {
	let versionSpec = environment.version;
	let versions: string[];
	available = available || [];
	
	if (versionSpec && isNaN(Number(versionSpec))) {
		var availableVersions = getVersions(environment, available);
		
		versions = splitVersions(versionSpec).map(function (version) {
			return resolveVersionAlias(version, availableVersions);
		});

		if (versions.length === 2) {
			if (versions[0] > versions[1]) {
				throw new Error('Invalid range [' + versions + '], must be in ascending order');
			}
		
			versions = expandVersionRange(versions[0], versions[1], availableVersions);
		}
	}

	return versions;
}

/**
 * Builds permutations of an object by flattening properties holding array values into a collection of objects
 * representing all combinations of objects for all arrays in the object.
 *
 * @param base a base set of properties applied to each source
 * @param sources a list of sources to flatten
 * @return a flattened collection of sources
 */
function createPermutations(base: Object, sources?: Environment[]): Object[] {
	// If no expansion sources were given, the set of permutations consists of just the base
	if (!sources || sources.length === 0) {
		return [ lang.mixin({}, base) ];
	}

	// Expand the permutation set for each source
	return sources.map(function (source) {
		return Object.keys(source).reduce(function (permutations: { [key: string]: any }[], key: string) {
			if (Array.isArray(source[key])) {
				// For array values, create a copy of the permutation set for each array item, then use the
				// combination of these copies as the new value of `permutations`
				permutations = source[key].map(function (value: any) {
					return permutations.map(function (permutation) {
						let clone: { [key: string]: any } = lang.mixin({}, permutation);
						clone[key] = value;
						return clone;
					});
				}).reduce(function (newPermutations: Object[], keyPermutations: Object[]) {
					return newPermutations.concat(keyPermutations);
				}, []);
			}
			else {
				// For simple values, add the value to all current permutations
				permutations.forEach(function (permutation) {
					permutation[key] = source[key];
				});
			}
			return permutations;
		}, [ lang.mixin({}, base) ]);
	}).reduce(function (newPermutations, sourcePermutations) {
		return newPermutations.concat(sourcePermutations);
	}, []);
}
