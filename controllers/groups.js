const groupsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Chat = require('../models/chat');
const User = require('../models/user');

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};

groupsRouter.post('/', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' });
    }
    const user = await User.findById(decodedToken.id);
    const chat = new Chat({
      users: request.body.users,
      chat: request.body.chat,
      user1: user,
      notify: 0,
    });

    const savedChat = await chat.save();
    savedChat.populate('users');
    response.status(201).json(savedChat);
  } catch (error) {
    next(error);
  }
});

module.exports = groupsRouter;
