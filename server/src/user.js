'use strict';
const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
  givenName: {
    type: String,
    required: [ true, 'Provide a valid given name' ],
    minlength: 1,
    trim: true
  },
  familyName: {
    type: String,
    required: [ true, 'Provide a valid family name' ],
    minlength: 1,
    trim: true
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    trim: true,
    match: [/[^@]+@[^\.]+\..+/, 'Provide a vaild email address' ]

  },
  created: {
    type: Date,
    required: true,
    default: Date.now
  }
}));

module.exports = { User };
