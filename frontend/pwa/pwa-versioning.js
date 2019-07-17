const fse = require('fs-extra');
const ngswConfig = fse.readJsonSync('./ngsw-config.json')
/** Increase the version number */
ngswConfig.dataGroups[0].version += 1;
console.log(`PWA version updated to ${ngswConfig.dataGroups[0].version}`);
/** Rerwite the config file */
fse.outputFile('./ngsw-config.json', JSON.stringify(ngswConfig, null, 2))
