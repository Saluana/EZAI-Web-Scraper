"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instanceOfError = exports.instanceOfSuccess = void 0;
function instanceOfSuccess(data) {
    return 'status' in data;
}
exports.instanceOfSuccess = instanceOfSuccess;
function instanceOfError(data) {
    return 'message' in data;
}
exports.instanceOfError = instanceOfError;
