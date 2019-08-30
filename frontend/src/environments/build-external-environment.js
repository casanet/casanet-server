/** This script use to allow set API URL by system environment at build process time */
const fse = require('fs-extra');

const { API_URL } = process.env;
const defaultApiUrl = 'http://127.0.0.1:3000';

if (API_URL) {
    console.log(`API URL set to be ${API_URL}`);
} else {
    console.warn(`There is no 'API_URL' envirnment var, using ${defaultApiUrl} as default...`);
}

fse.outputFile('./src/environments/environment.final.ts', `
    export const environment = {
        production: true,
        baseUrl: '${API_URL || defaultApiUrl}/API'
    };`);


