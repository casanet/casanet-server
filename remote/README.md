# CASTANET remote server.

## For what?
The casa-net server is running on the local network. 
so to access casa-net API outside home we need to know our home public IP address and configure port forwarding in home router.

But it not so easy, becuase some of ISP services giving NAT IP and not public IP, and some other replacing IP addrees each connection.
And also for port forwarding the computer needs to use static IP address in local network.

### The solution:
The remote server is built to run on cloud so the local casa-net server will connect to it via [ws](https://www.w3.org/TR/websockets/),
and each user request will redirect to local server.

The ws used only to redirect requests,
and in local server it will be converted back to HTTP request and authentication and handled like each other HTTP request.

One remote server can redirect to many local server,
the redirection to correct local server is based on user email from `LocalServer.validUsers` array, 
see [Swagger API](./swagger.yaml) for LocalServer schema struct

If the user email exist in more then one local server valid users you will need in login request to select local server to try redirect to.

> Note that remote server not keeping of snooping any data, 
all requests send after session checking AS IS to local server. (except user session key hash).

Simple diagram:
![screenshot](https://user-images.githubusercontent.com/28386247/53689809-aa062a00-3d66-11e9-9c8c-84a175f11540.png)

### Remote server installation:
1. Download project via git or downalod files as zip.
1. Install Node.js on machine.
1. Navigate in command line to `$/.../backend` and press `npm install --save`.
1. Navigate in command line to `$/.../remote` and press `npm install --save`.
1. Press `node dist/remote/src/index.js` to run server.

### Configuration:
See [server configure](../backend/README.md#configure-server).

## Pair local server with remote server:
1) In local server login as admin and get machine mac address (GET /remote/machine-mac). 
1) In remote server login to managements as admin and create new local server (POST /servers).
1) In remote server get local server id (GET /servers).
1) In remote server generate key for local server (POST /servers/auth/{localServerId}).
1) In local server set remote server settings with remote server uri (`ws://remote-server-domain/` or `wss://remote-server-domain/` case using HTTPS)
and generated key (PUT /remote).
1) In remote server get availble useres of local server (GET /servers/local-users/{localServerId}).
1) In remote server edit local server valid users with one or more users that you want to give then access via remote server. (/servers/{localServerId}).
1) That's it, now you can access local server API via remote server.

## Remote server API
The management UI should wrap admin API. 

The full specs of API is documented in [swagger API file](./swagger.yaml).
