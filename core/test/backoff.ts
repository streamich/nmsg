/// <reference path="../../typings/test.d.ts" />
import {expect} from 'chai';
import * as backoff from '../backoff';


describe('backoff', function() {
    describe('Exponential', function() {

        it('number', function (done) {
            this.timeout(15000);
            var mybackoff = new backoff.BackoffExponential();
            var cnt = 0;
            var time = +new Date();
            var operation = (success, error) => {
                cnt++;
                var diff = (+new Date()) - time;
                var expected_time = 1000 * (2 ** (cnt - 1)) - 1000;
                expect(diff - expected_time >= 0).to.equal(true);
                if(cnt < 4) error();
                else {
                    success();
                    done();
                }
            };
            mybackoff.attempt(operation);
        });

    });
});
