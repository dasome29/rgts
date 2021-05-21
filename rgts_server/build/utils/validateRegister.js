"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
function validateRegister(options) {
    if (options.username.length <= 2) {
        return [{
                field: 'username',
                message: "Length must be greater than 2."
            }];
    }
    if (options.username.includes("@")) {
        return [{
                field: 'username',
                message: "Username cannot include '@' symbol."
            }];
    }
    if (!options.email.includes("@")) {
        return [{
                field: 'email',
                message: "Invalid Email."
            }];
    }
    if (options.password.length <= 3) {
        return [{
                field: 'password',
                message: "Length must be greater than 3."
            }];
    }
    return null;
}
exports.validateRegister = validateRegister;
//# sourceMappingURL=validateRegister.js.map