# casanet dashboard

[![Build Status](https://travis-ci.org/casanet/casanet-server.svg?branch=master)](https://travis-ci.org/casanet/casanet-server)

This Angular project use to be the frontend of the casanet server.
The app should support two scenarios:

1. Serving app by the local server in the local network.
1. Serving app by a public CDN service and configuring the API requests URL.

Build the project by `npm run build`. the results will copy to `$backend/dist/public`

If you need the CDN configuration:

- Set `API_URL` environment variable with the remote server or the local server URL. (default is `http://127.0.0.1:3000`)
- Build the app by `npm run build:external`. the results will be in the `dist` directory.
