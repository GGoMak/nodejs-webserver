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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Gallery', gallerySchema);
