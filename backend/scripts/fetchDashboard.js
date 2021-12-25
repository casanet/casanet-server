import fse from 'fs-extra';
import path from 'path';
import jsZip from 'jszip';
import nodeFetch from 'node-fetch';

const dashboardDist = path.join('dist', 'dashboard');
const legacyDashboardDist = path.join('dist', 'public');

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
	// Download the dashboard app
	await downloadAndUnpackDashboard(`https://nightly.link/casanet/dashboard-app/workflows/build/${ENV_BRANCH}/internal.zip`, dashboardDist);
	// Download the legacy v3 front dashboard
	await downloadAndUnpackDashboard(`https://nightly.link/casanet/frontend-v3/workflows/nodejs/${ENV_BRANCH}/internal.zip`, legacyDashboardDist);
})();