import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as moment from 'moment';
import { testLongSpecs } from '../../e2e/prepareRoutesSpecTests.spec';
import { LocalNetworkReader } from './lanManager';

describe('Local network devices util.', () => {

    describe('Get real local network table', () => {

        if (!testLongSpecs) {
            return;
        }

        it('it shuold get table successfuly', async () => {
            const networdTable = await LocalNetworkReader();

            expect(networdTable).to.be.a('array');
        }).timeout(moment.duration(4, 'minutes').asMilliseconds());
    });
});
