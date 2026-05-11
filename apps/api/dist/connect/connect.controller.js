"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectController = void 0;
const common_1 = require("@nestjs/common");
const service_credentials_guard_1 = require("../service-api/service-credentials.guard");
const connect_service_1 = require("./connect.service");
const authorize_query_dto_1 = require("./dto/authorize-query.dto");
const complete_authorization_dto_1 = require("./dto/complete-authorization.dto");
const token_request_dto_1 = require("./dto/token-request.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const approve_authorization_session_dto_1 = require("./dto/approve-authorization-session.dto");
const reject_authorization_session_dto_1 = require("./dto/reject-authorization-session.dto");
let ConnectController = class ConnectController {
    connectService;
    constructor(connectService) {
        this.connectService = connectService;
    }
    authorize(query) {
        return this.connectService.createAuthorizationSession(query);
    }
    completeAuthorizationForDev(body, masterSecret) {
        return this.connectService.completeAuthorizationForDev(body, masterSecret);
    }
    exchangeToken(body, req) {
        return this.connectService.exchangeAuthorizationCode({
            body,
            serviceAuth: {
                serviceId: req.serviceAuth.serviceId,
                clientId: req.serviceAuth.clientId,
            },
        });
    }
    getAuthorizationSession(sessionId, req) {
        return this.connectService.getAuthorizationSessionForUser({
            sessionId,
            userId: req.user.sub,
        });
    }
    approveAuthorizationSession(sessionId, body, req) {
        return this.connectService.approveAuthorizationSession({
            sessionId,
            userId: req.user.sub,
            body,
        });
    }
    rejectAuthorizationSession(sessionId, body, req) {
        return this.connectService.rejectAuthorizationSession({
            sessionId,
            userId: req.user.sub,
            body,
        });
    }
};
exports.ConnectController = ConnectController;
__decorate([
    (0, common_1.Get)('authorize'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authorize_query_dto_1.AuthorizeQueryDto]),
    __metadata("design:returntype", Promise)
], ConnectController.prototype, "authorize", null);
__decorate([
    (0, common_1.Post)('dev/authorize/complete'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-master-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [complete_authorization_dto_1.CompleteAuthorizationDto, Object]),
    __metadata("design:returntype", Promise)
], ConnectController.prototype, "completeAuthorizationForDev", null);
__decorate([
    (0, common_1.UseGuards)(service_credentials_guard_1.ServiceCredentialsGuard),
    (0, common_1.Post)('token'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [token_request_dto_1.TokenRequestDto, Object]),
    __metadata("design:returntype", void 0)
], ConnectController.prototype, "exchangeToken", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('authorization-sessions/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConnectController.prototype, "getAuthorizationSession", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('authorization-sessions/:sessionId/approve'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approve_authorization_session_dto_1.ApproveAuthorizationSessionDto, Object]),
    __metadata("design:returntype", Promise)
], ConnectController.prototype, "approveAuthorizationSession", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('authorization-sessions/:sessionId/reject'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reject_authorization_session_dto_1.RejectAuthorizationSessionDto, Object]),
    __metadata("design:returntype", Promise)
], ConnectController.prototype, "rejectAuthorizationSession", null);
exports.ConnectController = ConnectController = __decorate([
    (0, common_1.Controller)('connect'),
    __metadata("design:paramtypes", [connect_service_1.ConnectService])
], ConnectController);
//# sourceMappingURL=connect.controller.js.map