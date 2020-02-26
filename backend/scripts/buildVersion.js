const simplegit = require('simple-git/promise');
const fse = require('fs-extra');
const path = require('path');

const git = simplegit();

const buildVersionInfo = async() => {
      const tags = await git.tags();
      const commintHash = await git.revparse(['--short', 'HEAD']);
      const rawTimestamp = await git.show(['-s', '--format=%ct']);

      const timestamp = +rawTimestamp * 1000;

      fse.writeFileSync(path.join(__dirname, '../dist', 'versionInfo.json'), JSON.stringify({
        version: tags.latest,
        commintHash,
        timestamp,
      }));
  }

  buildVersionInfo();
  