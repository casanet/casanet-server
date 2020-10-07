const simplegit = require('simple-git/promise');
const fse = require('fs-extra');
const path = require('path');

const git = simplegit();

const buildVersionInfo = async() => {
      const tags = await git.tags();
      const commitHash = await git.revparse(['--short', 'HEAD']);
      const rawTimestamp = await git.show(['-s', '--format=%ct']);

      const timestamp = +rawTimestamp * 1000;

      fse.writeFileSync(path.join(__dirname, '../dist', 'versionInfo.json'), JSON.stringify({
        version: fse.readFileSync(path.join(__dirname, '../../', 'version.txt')).toString('utf8').trim(),
        commitHash,
        timestamp,
      }));
  }

  buildVersionInfo();
  