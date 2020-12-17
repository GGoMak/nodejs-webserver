const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const gallerySchema = new Schema({
  img: {
    type: String,
    required: true,
  },
  author: {
    type: ObjectId,
    required: true,
    ref: 'User',
  },
  content: {
    type: String,
    required: false,
  },
  hashtags: [{
    type: String,
  }]
}, {
  timestamps: true,
});

module.exports = mongoose.model('Gallery', gallerySchema);
