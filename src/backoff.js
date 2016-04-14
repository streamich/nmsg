"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Backoff = (function () {
    function Backoff() {
        this.retryCount = 0;
    }
    Backoff.prototype.onSuccess = function () {
        this.retryCount = 0;
    };
    Backoff.prototype.retry = function () {
        this.retryCount++;
        this.operation(this.onSuccess.bind(this), this.onError.bind(this));
    };
    Backoff.prototype.attempt = function (operation) {
        this.operation = operation;
        this.retry();
    };
    return Backoff;
}());
exports.Backoff = Backoff;
var BackoffRetry = (function (_super) {
    __extends(BackoffRetry, _super);
    function BackoffRetry(max_retries) {
        if (max_retries === void 0) { max_retries = 3; }
        _super.call(this);
        this.maxRetries = 3;
        this.maxRetries = max_retries;
    }
    BackoffRetry.prototype.onError = function (err) {
        if (this.retryCount < this.maxRetries)
            this.retry();
    };
    return BackoffRetry;
}(Backoff));
exports.BackoffRetry = BackoffRetry;
var BackoffExponential = (function (_super) {
    __extends(BackoffExponential, _super);
    function BackoffExponential() {
        _super.apply(this, arguments);
        this.minTimeout = 1000;
        this.base = 2;
        this.maxTimeout = 1000 * 60 * 60;
    }
    BackoffExponential.prototype.onError = function (err) {
        var ms = this.minTimeout * (Math.pow(this.base, (this.retryCount - 1)));
        if (ms < this.maxTimeout)
            setTimeout(this.retry.bind(this), ms);
    };
    return BackoffExponential;
}(Backoff));
exports.BackoffExponential = BackoffExponential;
