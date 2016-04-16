"use strict";
/// <reference path="./typing.d.ts" />
var chai_1 = require('chai');
var backoff = require('../src/backoff');
describe('backoff', function () {
    describe('Exponential', function () {
        it('number', function (done) {
            this.timeout(15000);
            var mybackoff = new backoff.BackoffExponential();
            var cnt = 0;
            var time = +new Date();
            var operation = function (success, error) {
                cnt++;
                var diff = (+new Date()) - time;
                var expected_time = 1000 * (Math.pow(2, (cnt - 1))) - 1000;
                chai_1.expect(diff - expected_time >= 0).to.equal(true);
                if (cnt < 4)
                    error();
                else {
                    success();
                    done();
                }
            };
            mybackoff.attempt(operation);
        });
    });
});
