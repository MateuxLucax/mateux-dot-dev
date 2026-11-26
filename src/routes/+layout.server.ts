import packageJson from '../../package.json';

export function load() {
	return {
		version: packageJson.version,
		buildDate: new Date().toISOString().slice(0, 10)
	};
}
