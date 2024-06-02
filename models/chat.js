const mongoose = require('mongoose');

const chatSchmea = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  chat: String,
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  date: { type: Date, default: Date.now },
  notify: Number,
  created: { type: Number, default: Date.now },
  hidden: { type: Boolean, default: false },
});

chatSchmea.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
    returnedObject.date = new Date(returnedObject.date).toLocaleDateString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  },
});

module.exports = mongoose.model('Chat', chatSchmea);
