const mongoose = require('mongoose');

const chatSchmea = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  chat: [{ type: mongoose.schema.Types.ObjectId, ref: 'Message' }],
});

module.exports = mongoose.model('Chat', chatSchmea);
