'use strict';
const expect = require('expect');
const request = require('supertest');
const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { app } = require('../src/server');
const { User } = require('../src/user');

describe('server.js', () => {

  // seed data
  const data = [
    {
      givenName: 'Joe',
      familyName: 'Smith',
      email: 'jsmith@email.com',
      _id: new ObjectID()
    }, {
      givenName: 'Test',
      familyName: 'Testing',
      email: 'test@test.com',
      _id: new ObjectID()
    }
  ];

  const knownId = data[0]._id;
  const unknownId = new ObjectID();
  const invalidId = '123abc';

  before((done) => {
    // start up our in memory version of mongo, and load in data
    const mongoServer = new MongoMemoryServer();
    mongoServer.getConnectionString().then((mongoUri) => {
      return mongoose.connect(mongoUri, {}, (err) => {
        if (err) done(err);
      });
    }).then(() => {
      data.forEach(u => {
        const user = new User(u);
        user.save();
      });
      done();
    });

  });

  describe('GET /', () => {
    it('should should tell us the server is running', (done) => {
      request(app)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200, done);
    });
  });

  describe('GET /users', () => {
    it('should fetch a list of users', (done) => {
      request(app)
        .get('/users')
        .set('Accept', 'application/json')
        .expect(200, done);
    });
  });

  describe('GET /user/:userid', () => {

    it('should fetch a user with known id', (done) => {
      request(app)
        .get(`/user/${knownId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200, done);
    });

    it('should not fetch an unknown user', (done) => {
      request(app)
        .get(`/user/${unknownId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(404, done);
    });

    it('should not fetch a user with invalid id', (done) => {
      request(app)
        .get(`/user/${invalidId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(400, done);
    });
  });

  describe('POST /user', () => {
    it('should construct user as expected', (done) => {
      const userData = {
        givenName: 'fred',
        familyName: 'jones',
        email: 'fjones@email.com'
      };
      request(app)
        .post('/user')
        .send(userData)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(201)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    it('should not construct a user with missing data', (done) => {
      const invalidData = {
        givenName: 'fred',
        familyName: 'jones'
      };
      request(app)
        .post('/user')
        .send(invalidData)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body.errors).toBeDefined();
          return done();
        });
    });

    it('should not construct a user with invalid data', (done) => {
      const invalidData = {
        givenName: [],
        familyName: 'jones',
        email: 'fsmith2@email.com'
      };
      request(app)
        .post('/user')
        .send(invalidData)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.errors).toBeDefined();
          return done();
        });
    });
  });

  describe('PUT /user/:userid', () => {
    let newData = {
      givenName: 'emily',
      familyName: 'Doe',
      email: 'new@email.com'
    };

    it('should update a user', (done) => {
      request(app)
        .put(`/user/${knownId}`)
        .send(newData)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    it('should fail to update a user that doesn\'t exist', (done) => {
      request(app)
        .put(`/user/${unknownId}`)
        .send(newData)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(404)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    it('should not update a user with invalid id', (done) => {
      request(app)
        .put(`/user/${invalidId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(400, done);
    });
  });

  describe('DELETE /user', () => {
    it('should delete a user', (done) => {
      request(app)
        .delete(`/user/${knownId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200, done);
    });

    it('should fail to delete a user that doesn\'t exist', (done) => {
      request(app)
        .delete(`/user/${unknownId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(404, done);
    });

    it('should not delete a user with invalid id', (done) => {
      request(app)
        .delete(`/user/${invalidId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(400, done);
    });
  });

});
