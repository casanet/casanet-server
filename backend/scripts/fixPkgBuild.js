import path from 'path';
import fse from 'fs-extra';

// See https://github.com/vercel/ncc/issues/521 https://github.com/vercel/pkg/issues/943 https://github.com/ljharb/es-get-iterator/issues/5
(async () => {
	const packagePath = path.join('node_modules', 'es-get-iterator', 'package.json');
	const packageManifest = await fse.readJSON(packagePath);
	packageManifest.main = 'mode.js';
	delete packageManifest.exports;
	fse.writeJSON(packagePath, packageManifest);
})();
