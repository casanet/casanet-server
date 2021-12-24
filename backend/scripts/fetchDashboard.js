import fse from 'fs-extra';
import path from 'path';
import jsZip from 'jszip';
import nodeFetch from 'node-fetch';

const dashboardDist = path.join('dist', 'dashboard');
const legacyDashboardDist = path.join('dist', 'public');
const docksDist = path.join('dist', 'docs');

const ENV_BRANCH = process.env.BRANCH !== 'master' ? 'develop' : 'main';

console.log(`[fetchDashboard] Fetching dashboard for branch "${process.env.BRANCH }" from dashboard "${ENV_BRANCH}" branch...`);

async function downloadAndUnpackDashboard(dashboardArtifact, distDir) {
	const latestArtifact = await nodeFetch(dashboardArtifact);
	const artifactBuffer = await latestArtifact.buffer();

	const artifactZip = await jsZip.loadAsync(artifactBuffer);

	for (const [filename, file] of Object.entries(artifactZip.files)) {
		if (file.dir) {
			continue;
		}

		const fileBuffer = await file.async('nodebuffer');


		const fileDist = path.join(distDir, filename);
		await fse.promises.mkdir(path.dirname(fileDist), { recursive: true });
		fse.outputFileSync(fileDist, fileBuffer);
	}
}

async function copySwaggerUiAssets() {
	await fse.promises.mkdir(path.dirname(docksDist), { recursive: true });
	fse.copyFileSync('./node_modules/swagger-ui-dist/swagger-ui.css', path.join(docksDist, 'swagger-ui.css'));
	fse.copyFileSync('./node_modules/swagger-ui-dist/swagger-ui-bundle.js', path.join(docksDist, 'swagger-ui-bundle.js'));
	fse.copyFileSync('./node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js', path.join(docksDist, 'swagger-ui-standalone-preset.js'));
	fse.copyFileSync('./node_modules/swagger-ui-dist/favicon-16x16.png', path.join(docksDist, 'favicon-16x16.png'));
	fse.copyFileSync('./node_modules/swagger-ui-dist/favicon-32x32.png', path.join(docksDist, 'favicon-32x32.png'));
}

(async () => {
	// Download the dashboard app
	await downloadAndUnpackDashboard(`https://nightly.link/casanet/dashboard-app/workflows/build/${ENV_BRANCH}/internal.zip`, dashboardDist);
	// Download the legacy v3 front dashboard
	// await downloadAndUnpackDashboard(`https://nightly.link/casanet/frontend-v3/workflows/nodejs/${ENV_BRANCH}/internal.zip`, legacyDashboardDist);

	// Copy swagger assets
	await copySwaggerUiAssets();
})();