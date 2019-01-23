import { LocalNetworkDevice } from '../../src/models/sharedInterfaces';
import { Delay } from '../../src/utilities/sleep';
import * as moment from 'moment';

export const localNetworkDevicesMock: LocalNetworkDevice[] = [
    {
        mac: '1111111111',
        ip: '192.168.1.1',
    },
    {
        mac: '22222222222',
        ip: '192.168.1.2',
        vendor: 'bla bla brand name',

    },
    {
        mac: '33333333333',
        ip: '192.168.1.3',
    },
    {
        mac: 'ac12345432',
        ip: '192.168.1.90',
    },
    {
        mac: '0987123ac',
        ip: '192.168.1.5',
    },
    {
        mac: '777777bb',
        ip: '192.168.1.55',
    },
    {
        mac: '777777cc',
        ip: '192.168.1.56',
    },
    {
        mac: '777777dd',
        ip: '192.168.1.57',
    },
    {
        mac: '777777ee',
        ip: '192.168.1.58',
        vendor: 'factory name',
    },
    {
        mac: '111111aa',
        ip: '192.168.1.59',
    },
];

export const localNetworkReaderMock = async (): Promise<LocalNetworkDevice[]> => {

    await Delay(moment.duration(1, 'seconds'));
    return localNetworkDevicesMock;
};