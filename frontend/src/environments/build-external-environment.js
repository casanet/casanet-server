/** This script use to allow set API URL by system environment at build process time */
const fse = require("fs-extra");

const { API_URL, DASHBOARD_DOMAIN } = process.env;
const defaultApiUrl = "http://127.0.0.1:3000";

if (API_URL) {
  console.log(`API URL set to be ${API_URL}`);
} else {
  console.warn(
    `There is no 'API_URL' environment var, using ${defaultApiUrl} as default...`
  );
}

fse.outputFileSync(
  "./src/environments/environment.final.ts",
  `
export const environment = {
    production: true,
    baseUrl: '${API_URL || defaultApiUrl}/API',
    dashboardDomain: '${DASHBOARD_DOMAIN || ''}'
};
`
);

/**
 * Also, build the light app environments
 */
fse.outputJSONSync("./src/light-app/environments.json", {
  API_URL: `${API_URL || defaultApiUrl}/API`,
  DASHBOARD_DOMAIN: `${DASHBOARD_DOMAIN || ''}`
});
