const messagesRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Message = require('../models/message');

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};

messagesRouter.put('/:id', async (request, response, next) => {
  try {
    const { id } = request.params;
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
    const user = await User.findById(decodedToken.id);
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' });
    }
    const message = {
      text: request.body.text,
      user,
    };
    const updatedMessage = await Message.findByIdAndUpdate(id, message, { new: true });
    response.json(updatedMessage);
  } catch (error) {
    next(error);
  }
});

// delete message
messagesRouter.put('/:id/remove', async (request, response, next) => {
  try {
    const { id } = request.params;
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
    const user = await User.findById(decodedToken.id);
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' });
    }
    const message = {
      text: request.body.text,
      user,
      deleted: request.body.deleted,
    };
    const deletedMessage = await Message.findByIdAndUpdate(id, message, { new: true });
    response.json(deletedMessage);
  } catch (error) {
    next(error);
  }
});

module.exports = messagesRouter;
