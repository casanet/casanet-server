
import * as https from 'https';
import * as WebSocket from 'ws';
import { RemoteMessage } from '../../src/models/remote2localProtocol';
import { logger } from '../../src/utilities/logger';

class WebSocketMock {

    private randomMockCert = `-----BEGIN CERTIFICATE-----
MIIDqzCCApOgAwIBAgIhAP5LymW/ISUQGzDVqq+qq1EBvC6D6Nb9ubI6Rsehybo0
MA0GCSqGSIb3DQEBBQUAMHAxCTAHBgNVBAYTADEJMAcGA1UECgwAMQkwBwYDVQQL
DAAxHTAbBgNVBAMMFG1vY2suY2FzYS1uZXQub25saW5lMQ8wDQYJKoZIhvcNAQkB
FgAxHTAbBgNVBAMMFG1vY2suY2FzYS1uZXQub25saW5lMB4XDTE5MDIxMTIwNDYw
M1oXDTI5MDIxMTIwNDYwM1owUTEJMAcGA1UEBhMAMQkwBwYDVQQKDAAxCTAHBgNV
BAsMADEdMBsGA1UEAwwUbW9jay5jYXNhLW5ldC5vbmxpbmUxDzANBgkqhkiG9w0B
CQEWADCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALnZ+eR5PCxOO40V
SHVct725nMtDjWS8Hl74PB4aHKEksM68uvcwFDuah8GCUPVnYB2AJEgViH8JWRkJ
iTYAkndGryzwbsY3XU3HGLsY3X4qRdNmJ5ppUYQREKOOsoloKa829pRVlH6SYFve
jfxNX44l/7gk5eFrV+262Ii7qi8KNdGd3jkujCgK/L4ux5CAkNsnqbJL4NLrBdEk
1ipOtgbLfCZ5S4tp0qTOw5Z4FqwJdzu8cMcandpPBdgi9zDUZztcPM+67iMWHW0j
Uu8YaQ3vERuQJDjhaFQkYv9Q2Z7QCbe2suSr+ZyTQlO9N0ORRHAUWQoBN71Q0SOM
3iFMUhECAwEAAaNPME0wHQYDVR0OBBYEFPz83rlouZiQlVslreH5Y6gh0Ll9MB8G
A1UdIwQYMBaAFPz83rlouZiQlVslreH5Y6gh0Ll9MAsGA1UdEQQEMAKCADANBgkq
hkiG9w0BAQUFAAOCAQEAidEqQpCsWs1APc2gWaHP+8fi4b30Z/UTAzJd34ewOSEP
rxUs5VJ2bheYxo2O6mJAHJTfsqkDjnpEMTAD4Mcs3ZbRL6ftPznKOdDv27uHEvqU
0nUNHave5pSoDJHSMAu7jcqW+7ze5jBoz+tA4WMIz0wVGNP2hEl/xm6CDyzG8fWY
W5SkWT/g+hfv4ogjnI+zXWkAYgLus2kbr4xdOfyOcLkMMzTLK67KjrsWLIRPK7O4
+4CtjYTsKlnwls7+YYt1yaq02MNlXkSEOOxKg0JDqwTywSowz0Cujqn7LgcFb/aL
fDMxB20ghYV8WGDrwU4xdYdfV6fyhOjT33SajR8BPA==
-----END CERTIFICATE-----`;

    private randomMockKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAudn55Hk8LE47jRVIdVy3vbmcy0ONZLweXvg8HhocoSSwzry6
9zAUO5qHwYJQ9WdgHYAkSBWIfwlZGQmJNgCSd0avLPBuxjddTccYuxjdfipF02Yn
mmlRhBEQo46yiWgprzb2lFWUfpJgW96N/E1fjiX/uCTl4WtX7brYiLuqLwo10Z3e
OS6MKAr8vi7HkICQ2yepskvg0usF0STWKk62Bst8JnlLi2nSpM7DlngWrAl3O7xw
xxqd2k8F2CL3MNRnO1w8z7ruIxYdbSNS7xhpDe8RG5AkOOFoVCRi/1DZntAJt7ay
5Kv5nJNCU703Q5FEcBRZCgE3vVDRI4zeIUxSEQIDAQABAoIBAAaNW0SFS6xKM8pF
ClFs6+Np9E+sOYNoKG/zs3biN8ksmHkpaTQGw2fYilm1pPIJ63cOyfiqna3Q4A3E
asx3F7LR0KI2dclSMV1pHAOYnFJy3hRWYSYN+Xw898e0Y7H5dKLDPs06+Sm/Mlt6
zKms9qX1y/6rellIpghxEmo7p4PR+mvDcYqC1C/d9F+pyI05kkQDCZDzk4DXrf4T
cLFoGthtAtzX490SGazZ8Ur5hlYPBXcNQEN6xtiNxeCjiyf/MRUR4BQ5fLWy5aAM
8us1/ca/cQr+qAvXVcK65piJQN6jmDumv2l+CVCXzOBky31KuLe9xY2SabC6rhHu
q0enGhkCgYEA6DBgpbjIVkEMqF+ORNs49E2XZDQk/R68pcUe1HASCp8mF9TG5p26
NgMbHM9cGR2DblZSQStelIvc0V8iZ0hVZdu0jbW/wMUMQfrXzQSxvHavYF1Wc/mX
Jk2wHDy1AgTbOQMIXDRFbmX8KidjVKchB4w01+WaVvk+YwSf2Z5OB40CgYEAzOkb
ZLcXvkYK/UTZU4/7fnZDJaOyY8vCzt9hDafBi2F1DT9jGFDMnSK2rrWDOGGqfB5X
XuTNOr3JFCEXoYVK+ggvLJHbm16i1YZJMyGk45Nm768GG3HwKtxxlMTzxXE95qwK
dehcChAvjnwNOb6YraG6PlkXIR/Fq0TnO4r74ZUCgYB0k/2il3F25Tg+vaOH7O3e
s6qEdC3yLOGY9azyCsb0ME4G/x1SovTgs5SEVZSvQ4M+/fZUpDrbqJGZSgPTCZ1f
A/3WfN+nIQhzhEeft3Cp6IlLf/GtTy7V24HF27EiL2AGcwBakyAdOvVuENKtqTBL
QtkxYSWp74CkZKkBsZsJ7QKBgCM5h03+84PwAn+bUEi/HZqVteFIjKf/JRPu7n4s
cmcFb9vBI8XQTfxNNV4/MbmFgIsppBdZ+bW5XlGphqhrg4IL2iAtSrUgxZkzJm41
wGSmuDFHwyMAqSqVDqlmWgl8+AkpVfsC4J+SPLqftJ5Sl2hxvtRs+D7neVGB3MYt
lDMpAoGAH8+AqlRpeyAqHcpHpcDyxQrbw8WD9vS/isvuPqhKY+K+C6HQeHOvR3pv
m9rxzHJl4qzjVLaTOc3w8e77oYG6PH+XRHkzSMTKVkQ8q0iYWihSR5E7nW7bvmFE
lbSoR6gGvDVr9ceTTheKYXk0bNEThIr6POfxtaBiiG6RwfsRNII=
-----END RSA PRIVATE KEY-----`;

    private httpsServer;
    private wss: WebSocket.Server;
    private mockServerPort = 4112;
    constructor() {

        const sslOptions: https.ServerOptions = {
            key: Buffer.alloc(this.randomMockKey.length, this.randomMockKey),
            cert: Buffer.alloc(this.randomMockCert.length, this.randomMockCert),
        };

        this.httpsServer = https.createServer(sslOptions);

        this.wss = new WebSocket.Server({ server: this.httpsServer });

        this.wss.on('connection', (ws) => {
            ws.on('message', function incoming(message) {
                console.log('received: %s', message);
            });

            ws.send(JSON.stringify({
                remoteMessagesType: 'readyToInitialization',
                message: {},
            } as RemoteMessage));
        });

        this.httpsServer.listen(this.mockServerPort, () => {
            logger.info('HTTPS server tester listen on port ' + this.mockServerPort);
        });
    }
}

export const WebSocketMockSinglton = new WebSocketMock();
