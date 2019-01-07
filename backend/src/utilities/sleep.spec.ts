import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as moment from 'moment';
import { Delay } from './sleep';

describe('Sleep utility tests', () => {
    it('it should wait requestd time', async () => {
        const bedorDelay = new Date().getTime();

        const delayDuration = moment.duration(3, 'seconds');
        await Delay(delayDuration);

        const afterDelay = new Date().getTime();

        // Allow range of 10 ms fauls.
        expect(afterDelay).to.be
            .above(bedorDelay + (delayDuration.asMilliseconds() - 10))
            .below(bedorDelay + (delayDuration.asMilliseconds() + 10));
    }).timeout(moment.duration(7, 'seconds').asMilliseconds());
});
