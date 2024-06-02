const chatsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Chat = require('../models/chat');
const User = require('../models/user');
const Message = require('../models/message');

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};

chatsRouter.get('/', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);

    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' });
    }
    const user = await User.findById(decodedToken.id);
    const chats = await Chat.find({ $or: [{ user1: user }, { user2: user }] }).populate({
      path: 'messages',
      populate: { path: 'user' },
    });

    response.json(chats);
  } catch (error) {
    next(error);
  }
});

chatsRouter.get('/:id', async (request, response, next) => {
  try {
    const chat = await Chat.findById(request.params.id).populate({
      path: 'messages',
      populate: { path: 'user' },
    });
    response.json(chat);
  } catch (error) {
    next(error);
  }
});

// post new chat
chatsRouter.post('/', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
    const user = await User.findById(decodedToken.id);
    const recipient = await User.findById(request.body.recipient);

    const chat = new Chat({
      chat: request.body.chat,
      user1: user.id,
      user2: recipient.id,
      notify: 0,
    });

    const savedChat = await chat.save();
    user.chats = user.chats.concat(savedChat);
    recipient.chats = recipient.chats.concat(savedChat);
    await user.save();
    await recipient.save();

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
      chatId: request.body.chatId,
    });
    const savedMessage = await newMessage.save();

    findChat.messages = findChat.messages.concat(savedMessage);
    findChat.hidden = false;
    await findChat.save();
    response.status(201).json(savedMessage);
  } catch (error) {
    next(error);
  }
});

// notify
chatsRouter.put('/:id', async (request, response, next) => {
  try {
    const { id } = request.params;
    const chat = {
      // chat: request.body.text,
      notify: request.body.notify,
    };
    const updatedMessage = await Chat.findByIdAndUpdate(id, chat, { new: true });
    response.json(updatedMessage);
  } catch (error) {
    next(error);
  }
});

// hide
chatsRouter.put('/:id/hide', async (request, response, next) => {
  try {
    const { id } = request.params;
    const chat = {
      hidden: request.body.hidden,
    };
    const updatedMessage = await Chat.findByIdAndUpdate(id, chat, { new: true });
    response.json(updatedMessage);
  } catch (error) {
    next(error);
  }
});

module.exports = chatsRouter;
