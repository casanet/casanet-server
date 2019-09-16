/** This script use for local server assets serving, 
 * to allow user fetch frontend app from local server 
 * without creating second server for static files serve 
 */
const fse = require('fs-extra');

fse.outputFileSync('./src/environments/environment.final.ts', `
export const environment = {
    production: true,
    baseUrl: '/API'
};
`);

/**
 * Also, build the light app environments
 */
fse.outputJSONSync('./src/light-app/environments.json', {
    API_URL : "/API"
});
