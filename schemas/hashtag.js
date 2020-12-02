const mongoose = require('mongoose');

const { Schema } = mongoose;
const hashtagSchema = new Schema({
  title: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('hashtag', hashtagSchema);
