import fse from 'fs-extra';
import path from 'path';
import jsZip from 'jszip';
import nodeFetch from 'node-fetch';

const dashboardDist = path.join('dist', 'dashboard');

const ENV_BRANCH = process.env.GITHUB_REF !== 'master' ? 'main' : 'main';

(async () => {

	const latestArtifact = await nodeFetch(`https://nightly.link/casanet/dashboard-app/workflows/build/${ENV_BRANCH}/internal.zip`);
	const artifactBuffer = await latestArtifact.buffer();

	const artifactZip = await jsZip.loadAsync(artifactBuffer);

	for (const [filename, file] of Object.entries(artifactZip.files)) {
		if (file.dir) {
			continue;
		}

		const fileBuffer = await file.async('nodebuffer');


		const fileDist = path.join(dashboardDist, filename);
		await fse.promises.mkdir(path.dirname(fileDist), { recursive: true });
		fse.outputFileSync(fileDist, fileBuffer);
	}

})();