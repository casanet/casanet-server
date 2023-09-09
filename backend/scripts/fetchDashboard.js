import fse from 'fs-extra';
import path from 'path';
import jsZip from 'jszip';
import nodeFetch from 'node-fetch';

const dashboardDist = path.join('dist', 'dashboard');

const ENV_BRANCH = process.env.BRANCH !== 'master' ? 'develop' : 'main';

console.log(`[fetchDashboard] Fetching dashboard for branch "${process.env.BRANCH}" from dashboard "${ENV_BRANCH}" branch...`);

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

(async () => {
	try {
		// Download the dashboard app
		await downloadAndUnpackDashboard(`https://nightly.link/casanet/dashboard-app/workflows/build/${ENV_BRANCH}/internal.zip`, dashboardDist);
	} catch (error) {
		console.error(`[fetchDashboard] Fetching "dashboard-app" for branch "${process.env.BRANCH}" from dashboard "${ENV_BRANCH}" branch failed ${error.message}`);
	}
})();