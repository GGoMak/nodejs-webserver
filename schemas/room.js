const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const roomSchema = new Schema({
  sender: {
    type: ObjectId,
    required: true,
  },
  receiver: {
    type: ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
roomSchema.plugin(findOrCreate);
module.exports = mongoose.model('Room', roomSchema);
