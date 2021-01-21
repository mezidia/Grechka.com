'use strict';

const mongoose = require('mongoose');

const packageSchema = mongoose.Schema({
  _packageid: mongoose.Schema.Types.ObjectId,
  packageType: String,
});

module.exports = mongoose.model('Package', packageSchema);
