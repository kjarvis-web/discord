const mongoose = require('mongoose');

const chatSchmea = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  chat: String,
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
});

chatSchmea.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Chat', chatSchmea);
