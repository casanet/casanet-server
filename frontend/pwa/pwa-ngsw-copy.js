const fse = require('fs-extra');
/** 
 * There is a mismatch with index.html sha1 results between build and production,
 * so copy ngsw-worker that not stopping the cache even that hash not match.
 */
fse.copySync('./pwa/ngsw-worker.js', '../backend/dist/public/ngsw-worker.js');
console.log(`ngsw-worker.js copyed successfully`);

