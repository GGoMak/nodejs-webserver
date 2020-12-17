const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const hashtagSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  boards: [{
    type: ObjectId,
    required: true,
    ref: 'Board',
  }],
});

hashtagSchema.methods.addBoard = function (info) {
  this.boards.push(info);
  return this.save();
};

hashtagSchema.plugin(findOrCreate);
module.exports = mongoose.model('hashtag', hashtagSchema);
