'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const mongoose = require('mongoose');
const swaggerDocument = require('./swagger.json');
const { User } = require('./user');
const { logger } = require('./logger');

// fetch our config
const config = require('../../resources/config.json');

const connectString = 'mongodb://mongo:27017/UserCrud';

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(connectString);

// set up express
const app = express();

app.use(bodyParser.json());
// set up swagger api
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (request, response) => {
  response.send({ status: 'running' });
});

app.get('/users', (request, response) => {
  // return all users
  logger.debug('listing all users');
  User.find().then((users) => {
    response.send({ users });
  }, (e) => {
    logger.error(e);
    response.status(404).send(e);
  });
});

app.get('/user/:userid', (request, response) => {
  // get user by id
  logger.debug(`fetching user by id: ${request.params.userid}`);
  User.findById(request.params.userid)
    .then((user) => {
      if (user) {
        response.send(user);
      } else {
        response.status(404).send({ error: `User with id ${request.params.userid} not found` });
      }
    })
    .catch((e) => {
      logger.error(e);
      response.status(400).send(e);
    });
});

app.post('/user', (request, response) => {
  // create new user
  const user = new User(request.body);
  logger.debug(`saving new user ${JSON.stringify(request.body)}`);
  user.save()
    .then((doc) => {
      response.status(201).send(doc);
    })
    .catch((e) => {
      logger.error(e);
      response.status(400).send(e);
    });
});

app.put('/user/:userid', (request, response) => {
  // update user details
  logger.debug(`updating user ${request.params.userid} to ${JSON.stringify(request.body)}`);
  const userid = request.params.userid;
  const newData = request.body;
  // update user and return the updated object
  User.findByIdAndUpdate(userid, { $set: newData }, { new: true })
    .then((user) => {
      if (user) {
        logger.info(`updated ${userid}`);
        response.send(user);
      } else {
        logger.info(`user ${userid} not found`);
        response.status(404).send( { error: `User ${userid} not found` });
      }
    }).catch(e => {
      logger.error(e);
      response.status(400).send(e);
    });
});

app.delete('/user/:userid', (request, response) => {

  // remove a user
  logger.debug(`deleting user ${request.params.userid}`);
  const userid = request.params.userid;

  // remove and return the user
  User.findByIdAndDelete(userid).then(user => {
    if (user) {
      logger.info(`removing ${userid}`);
      response.send(user);
    } else {
      logger.info(`DELETE ${userid}: not found`);
      response.status(404).send({ error: 'User not found' });
    }
  }).catch( e => {
    logger.error(e);
    response.status(400).send(e);
  });
});

app.listen(config.express.port, () => {
  logger.info(`Started on port ${config.express.port}`);
});

module.exports = { app };
