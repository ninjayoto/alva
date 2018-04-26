const loaderUtils = require('loader-utils');
const commondir = require('commondir');

// tslint:disable-next-line
module.exports = function loader() {
	// tslint:disable-next-line
	const options = loaderUtils.getOptions(this);
	const components = JSON.parse(options.components);

	// tslint:disable-next-line
	const common = commondir(options.cwd, Object.values(components));

	// tslint:disable-next-line
	(this as any).addContextDependency(common);

	return Object.entries(components)
		.map(
			([name, value]) =>
				`module.exports[${JSON.stringify(name)}] = require(${JSON.stringify(value)})`
		)
		.join('\n');
};
