"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
var isAuth = function (_a, next) {
    var context = _a.context;
    if (!context.req.session.userId) {
        throw new Error("Not Authenticated");
    }
    return next();
};
exports.isAuth = isAuth;
//# sourceMappingURL=isAuth.js.map