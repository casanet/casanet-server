"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
const iftttIntegrationBl_1 = require("../business-layer/iftttIntegrationBl");
let IftttController = class IftttController extends tsoa_1.Controller {
    /**
     * Is IFTTT inegration enabled.
     */
    async isIftttEnabled() {
        const iftttSettings = await iftttIntegrationBl_1.IftttIntegrationBlSingleton.getIftttIntergrationSettings();
        return iftttSettings.enableIntegration;
    }
    /**
     * Put ifttt integration settings.
     */
    async setIftttIntegrationSettings(iftttIntegrationSettings) {
        await iftttIntegrationBl_1.IftttIntegrationBlSingleton.setIftttIntergrationSettings(iftttIntegrationSettings);
    }
    /**
     * Ifttt webhooks triggering casa-net action API.
     * when all details in body only, to allow send all data ion one text line.
     * Example to use: SMS trigger has only simple text that can pass to IFTTT activity,
     * and by current request, it is possible to control any minion by one single line of text.
     * so fill the SMS text with JSON and by IFTTT set it to be the request body.
     * @param iftttActionTriggered status to and minion to set.
     */
    async triggeredSomeAction(iftttRawActionTriggerd) {
        const { apiKey, minionId, setStatus } = iftttRawActionTriggerd;
        await iftttIntegrationBl_1.IftttIntegrationBlSingleton.triggeredMinionAction(minionId, {
            apiKey,
            setStatus,
        });
    }
    /**
     * Ifttt webhooks triggering casa-net *minion* action API.
     * @param minionId minion to set status.
     * @param iftttActionTriggered status to set.
     */
    async triggeredMinionAction(minionId, iftttActionTriggered) {
        await iftttIntegrationBl_1.IftttIntegrationBlSingleton.triggeredMinionAction(minionId, iftttActionTriggered);
    }
    /**
     * Ifttt webhooks triggering casa-net *operation* action API.
     * @param operationId operation to invoke.
     * @param iftttActionTriggeredRequest Ifttt request auth and redirect data.
     */
    async triggeredOperationAction(operationId, iftttActionTriggeredRequest) {
        await iftttIntegrationBl_1.IftttIntegrationBlSingleton.triggeredOperationAction(operationId);
    }
};
__decorate([
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Security('userAuth'),
    tsoa_1.Get('/settings')
], IftttController.prototype, "isIftttEnabled", null);
__decorate([
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Put('/settings'),
    __param(0, tsoa_1.Body())
], IftttController.prototype, "setIftttIntegrationSettings", null);
__decorate([
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Security('iftttAuth'),
    tsoa_1.Post('/trigger/minions/raw/'),
    __param(0, tsoa_1.Body())
], IftttController.prototype, "triggeredSomeAction", null);
__decorate([
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Security('iftttAuth'),
    tsoa_1.Post('/trigger/minions/{minionId}/'),
    __param(1, tsoa_1.Body())
], IftttController.prototype, "triggeredMinionAction", null);
__decorate([
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Security('iftttAuth'),
    tsoa_1.Post('/trigger/operations/{operationId}/'),
    __param(1, tsoa_1.Body())
], IftttController.prototype, "triggeredOperationAction", null);
IftttController = __decorate([
    tsoa_1.Tags('Ifttt'),
    tsoa_1.Route('ifttt')
], IftttController);
exports.IftttController = IftttController;
//# sourceMappingURL=iftttController.js.map