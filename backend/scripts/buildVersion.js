import simpleGit from 'simple-git';
import path from 'path';
import fse from 'fs-extra';

const git = simpleGit();

const buildVersionInfo = async() => {
      const tags = await git.tags();
      const commitHash = await git.revparse(['--short', 'HEAD']);
      const rawTimestamp = await git.show(['-s', '--format=%ct']);

      const timestamp = +rawTimestamp * 1000;

      fse.writeFileSync(path.join('dist', 'versionInfo.json'), JSON.stringify({
        version: fse.readFileSync(path.join('../', 'version.txt')).toString('utf8').trim(),
        commitHash,
        timestamp,
      }));
  }

  buildVersionInfo();
  