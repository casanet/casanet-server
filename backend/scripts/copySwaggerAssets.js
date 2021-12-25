import fse from 'fs-extra';
import path from 'path';

const docksDist = path.join('dist', 'docs');

async function copySwaggerUiAssets() {
	const swaggerAssets = ['swagger-ui.css', 'swagger-ui-bundle.js', 'swagger-ui-standalone-preset.js', 'favicon-16x16.png', 'favicon-32x32.png'];
	await fse.promises.mkdir(docksDist, { recursive: true });

	for (const swaggerAsset of swaggerAssets) {
		fse.copyFileSync(path.join('./node_modules/swagger-ui-dist', swaggerAsset), path.join(docksDist, swaggerAsset));
	}
}

(async () => {
	// Copy swagger assets
	await copySwaggerUiAssets();
})();
