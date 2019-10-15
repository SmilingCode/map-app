const request = require('supertest');

const app = require('../src/app');

describe('GET /api/v1', () => {
  it('responds with a json message', function(done) {
    request(app)
      .get('/api/v1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: 'API - 👋🌎🌍🌏' 
      }, done);
  });
});

describe('POST /api/v1/messages', () => {
  it('response with inserted message', function(done) {
    const sendMsg = {
      name: 'Jon',
      message: 'i do not know what is wrong',
      latitude: '-20',
      longitude: '115'
    };

    const recMsg = {
      ...sendMsg,
      _id: '5da5bd1b8a010d9db7bedf98',
      date: '2019-10-15T12:44:03.063Z'
    }

    request(app)
      .post('/api/v1/messages')
      .send(sendMsg)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(res => {
        console.log(res.body)
        res.body._id = '5da5bd1b8a010d9db7bedf98',
        res.body.date = '2019-10-15T12:44:03.063Z'
      })
      .expect(200, recMsg, done);
  });
});
