# CASANET remote server.

## For what?
The casa-net server is running on the local network. 
so to access casa-net API outside the home we need to know our home public IP address and configure port forwarding in-home router.

But it not so easy, because some of ISP services giving NAT IP and not public IP, and some other replacing IP addresses each connection.
And also for port forwarding, the computer needs to use a static IP address in a local network.

### The solution:
Tthe remote server is built to run on a cloud so the local casa-net server will connect to it via [ws](https://www.w3.org/TR/websockets/),
and each user request will redirect to the local server.

The WS connection used only to redirect requests,
and in the local server, it will be converted back to an HTTP request and authentication and handled like each other HTTP request.

One remote server can redirect to many local servers,
the redirection to correct local server is based on user email from `LocalServer.validUsers` array, 
see [Swagger API](./swagger.yaml) for LocalServer schema struct

If the user email exists in more then one local server valid users you will need in login request to select a local server to try redirect to.

> Note that remote server not keeping of snooping any data, 
all requests send after session checking AS IS to the local server. (except user session key hash).

Simple diagram:
![screenshot](https://user-images.githubusercontent.com/28386247/53689809-aa062a00-3d66-11e9-9c8c-84a175f11540.png)

### Remote server installation:
1. Download the project via git or download files as a zip.
1. Install Node.js on the machine.
1. Navigate in a command line to `$/.../backend` and press `npm install --save`.
1. Navigate in a command line to `$/.../remote` and press `npm install --save`.
1. Press `node dist/remote/src/index.js` to run the server.

### Configuration:
See [server configure](../backend/README.md#configure-server).

## Pair local server with remote server:
1) In local server login as admin and get machine mac address (GET /remote/machine-mac). 
1) In remote server login to management as admin and create a new local server (POST /servers).
1) In remote server get local server id (GET /servers).
1) In remote server generate key for local server (POST /servers/auth/{localServerId}).
1) In local server set remote server settings with remote server URI (`ws://remote-server-domain/` or `wss://remote-server-domain/` case using HTTPS)
and generated key (PUT /remote).
1) In remote server get availble useres of local server (GET /servers/local-users/{localServerId}).
1) In remote server edit local server valid users with one or more users that you want to give then access via the remote server. (PUT /servers/{localServerId}).
1) That's it, now you can access local server API via the remote server.

## Remote server API
The management UI should wrap the admin API. 

The full specs of API are documented in [swagger API file](./swagger.yaml).
