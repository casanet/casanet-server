import { expect } from 'chai';
import * as moment from 'moment';
import { MinionsDalSingleton } from '../../src/data-layer/minionsDal';
import {
  ErrorResponse,
  Minion,
  MinionRename,
  MinionStatus,
  SetMinionAutoTurnOff,
} from '../../src/models/sharedInterfaces';
import { validUserAgent } from './prepareRoutesSpecTests.spec';

const minioinMock: Minion = {
  device: {
    brand: 'mock',
    model: 'switch demo',
    pysicalDevice: {
      mac: '45543544',
    },
  },
  isProperlyCommunicated: true,
  minionId: 'm1',
  minionType: 'switch',
  minionStatus: {},
  name: 'bla bla 1',
};
MinionsDalSingleton.createMinion(minioinMock)
  .then(() => {
    console.log('Generate mock minion in data successfuly');
  })
  .catch(() => {
    console.warn('Fail to generate mock minion in data');
  });

const minioinAcMock: Minion = {
  device: {
    brand: 'mock',
    model: 'ac demo',
    pysicalDevice: {
      mac: '45543dd544',
    },
  },
  isProperlyCommunicated: true,
  minionId: 'm2',
  minionType: 'airConditioning',
  minionStatus: {},
  name: 'bla bla ac 2',
};
MinionsDalSingleton.createMinion(minioinAcMock)
  .then(() => {
    console.log('Generate mock ac minion in data successfully');
  })
  .catch(() => {
    console.warn('Fail to generate mock ac minion in data');
  });

describe('Minions routing API', () => {
  describe('/GET minions', () => {
    it('it should respond 20x as status code', done => {
      validUserAgent.get('/API/minions').end((err, res) => {
        expect(res.statusType).eql(2);
        done();
      });
    });
  });

  describe('/GET minions/{minionId}', () => {
    it('it should respond 20x as status code', done => {
      validUserAgent.get('/API/minions/m1').end((err, res) => {
        expect(res.statusType).eql(2);
        done();
      });
    });
  });

  describe('/POST minions', () => {
    it('it should respond 501 as status code', done => {
      const minion: Minion = {
        device: {
          brand: 'mock',
          model: 'ac demo',
          pysicalDevice: {
            mac: '????????',
          },
        },
        minionType: 'light',
        name: 'dfdf',
        minionStatus: {},
      };
      validUserAgent
        .post('/API/minions')
        .send(minion)
        .end((err, res) => {
          const errorResponse: ErrorResponse = {
            responseCode: 2404,
            message: 'device not exist in lan network',
          };
          expect(res.body).to.be.deep.equal(errorResponse);
          done();
        });
    });
  });

  describe('/PUT minions/{minionId}', () => {
    it('it should respond 20x as status code', done => {
      const minionStatus: MinionStatus = {
        switch: {
          status: 'off',
        },
      };
      validUserAgent
        .put('/API/minions/m1')
        .send(minionStatus)
        .end((err, res) => {
          expect(res.statusType).eql(2);
          done();
        });
    });
  });

  describe('/DELETE minions/{minionId}', () => {
    it('it should respond 501 as status code', done => {
      validUserAgent.del('/API/minions/minionId').end((err, res) => {
        const errorResponse: ErrorResponse = {
          responseCode: 1404,
          message: 'minion not exist',
        };
        expect(res.body).to.be.deep.equal(errorResponse);
        done();
      });
    });
  });

  describe('/PUT minions/timeout/{minionId}', () => {
    it('it should respond 20x as status code', done => {
      const minionUpdate: SetMinionAutoTurnOff = {
        setAutoTurnOffMS: 50000,
      };
      validUserAgent
        .put('/API/minions/timeout/m1')
        .send(minionUpdate)
        .end((err, res) => {
          expect(res.statusType).eql(2);
          done();
        });
    });
  });

  describe('/PUT minions/rename/{minionId}', () => {
    it('it should change the minion name successfully', async () => {
      const minionUpdate: MinionRename = {
        name: 'other name',
      };
      const response = await validUserAgent.put('/API/minions/rename/m1').send(minionUpdate);

      expect(response.statusType).eql(2);

      const getResponse = await validUserAgent.get('/API/minions/m1').send();

      expect(getResponse.body)
        .to.have.property('name')
        .eq('other name');
    });
  });

  describe('/POST rf/record/{minionId}', () => {
    it('it should respond 20x as status code', done => {
      const minionStatus: MinionStatus = {
        airConditioning: {
          fanStrength: 'high',
          mode: 'auto',
          status: 'on',
          temperature: 21,
        },
      };
      validUserAgent
        .post('/API/rf/record/m2')
        .send(minionStatus)
        .end((err, res) => {
          expect(res.statusType).eql(2);
          done();
        });
    });
  });

  describe('/POST rf/generate/{minionId}', () => {
    it('it should respond 20x as status code', done => {
      const minionStatus: MinionStatus = {
        airConditioning: {
          fanStrength: 'high',
          mode: 'auto',
          status: 'on',
          temperature: 21,
        },
      };
      validUserAgent
        .post('/API/rf/generate/m2')
        .send(minionStatus)
        .end((err, res) => {
          expect(res.statusType).eql(2);
          done();
        });
    });
  });

  describe('/POST minions/rescan', () => {
    it('it should respond 20x as status code', done => {
      validUserAgent.post('/API/minions/rescan').end((err, res) => {
        expect(res.statusType).eql(2);
        done();
      });
    }).timeout(moment.duration(5, 'seconds').asMilliseconds());
  });

  describe('/POST minions/rescan/{minionId}', () => {
    it('it should respond 20x as status code', done => {
      validUserAgent.post('/API/minions/rescan/m1').end((err, res) => {
        expect(res.statusType).eql(2);
        done();
      });
    });
  });
});
