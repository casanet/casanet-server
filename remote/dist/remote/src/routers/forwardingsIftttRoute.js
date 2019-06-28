"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../../backend/src/utilities/logger");
const forwarding_controller_1 = require("../controllers/forwarding-controller");
class ForwardingIftttRouter {
    constructor() {
        this.forwardingController = new forwarding_controller_1.ForwardingController();
    }
    forwardRouter(app) {
        /** Handle all ifttt triggers requests */
        app.post('/API/ifttt/trigger/*', async (req, res) => {
            const iftttTriggerRequest = req.body;
            /** Make sure request contance local server to forward to. */
            if (typeof iftttTriggerRequest !== 'object' || !iftttTriggerRequest.localMac) {
                res.sendStatus(422).send();
                return;
            }
            try {
                /** Forward request as is and wait for request. */
                const response = await this.forwardingController.forwardHttpReq(iftttTriggerRequest.localMac, {
                    requestId: undefined,
                    httpPath: req.originalUrl,
                    httpMethod: req.method.toUpperCase(),
                    httpBody: req.body,
                    httpSession: req.cookies.session,
                });
                /** Set status and data and send response back */
                res.statusCode = response.httpStatus;
                res.send(response.httpBody);
            }
            catch (error) {
                logger_1.logger.debug(`Forwarding ifttt trigger action to local server mac: ${iftttTriggerRequest.localMac},` +
                    `fail ${JSON.stringify(error)}`);
                // Dont tell if its fail becuase of mac not connected or not exist, to avoid attakers to know if mac is valid or not.
                res.status(501).send({ responseCode: 5000 });
            }
        });
    }
}
exports.ForwardingIftttRouter = ForwardingIftttRouter;
//# sourceMappingURL=forwardingsIftttRoute.js.map