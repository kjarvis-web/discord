const chatsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const config = require('../utils/config');
const Chat = require('../models/chat');
const User = require('../models/user');
const Message = require('../models/message');
const logger = require('../utils/logger');

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};

chatsRouter.get('/', async (request, response) => {
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  const user = await User.findById(decodedToken.id);
  const chats = await Chat.find({ $or: [{ user1: user }, { user2: user }] });
  response.json(chats);
});

// post new chat
chatsRouter.post('/', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
    const user = await User.findById(decodedToken.id);

    const chat = new Chat({
      chat: request.body.text,
      user1: user.id,
      user2: request.body.recipient,
    });

    const savedChat = await chat.save();
    response.status(201).json(savedChat);
  } catch (error) {
    next(error);
  }
});

chatsRouter.post('/:id', async (request, response, next) => {
  try {
    const { id } = request.params;
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
    const user = await User.findById(decodedToken.id);
    const findChat = await Chat.findById(id);

    const newMessage = new Message({
      text: request.body.text,
      user,
    });
    const savedMessage = await newMessage.save();

    findChat.chat = findChat.chat.concat(savedMessage);
    await findChat.save();
    response.status(201).json(savedMessage);
  } catch (error) {
    next(error);
  }
});
