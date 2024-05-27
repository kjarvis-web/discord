const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

usersRouter.post('/', async (request, response, next) => {
  try {
    const { username, password } = request.body;
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      passwordHash,
    });

    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
});

// get all users
usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('chats').populate('friends');

  response.json(users);
});

// get logged user
usersRouter.get('/:id', async (request, response, next) => {
  try {
    const user = await User.findById(request.params.id)
      .populate('friends')
      .populate({ path: 'chats', populate: { path: 'messages' } });
    response.json(user);
  } catch (error) {
    next(error);
  }
});

// send friend request
const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};
usersRouter.post('/:id/friend_request', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' });
    }
    // get logged user
    const loggedUser = await User.findById(decodedToken.id);

    // get user to send friend request to
    const user = await User.findById(request.params.id);
    const friendRequest = {
      from: loggedUser.id,
      status: 'pending',
    };
    user.friendRequests = user.friendRequests.concat(friendRequest);
    const newUser = await user.save();
    response.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// accept friend request
usersRouter.post('/:id/accept_friend_request', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' });
    }

    // logged user
    const user = await User.findById(decodedToken.id);
    // user who sent friend request
    const from = await User.findById(request.params.id);
    const newFriendRequests = user.friendRequests.filter((r) => r.from.toString() !== from.id);
    const accepted = {
      from: from.id,
      status: 'accepted',
    };
    if (user.friends.find((f) => f.toString() === from.id)) {
      return response.status(401).json({ error: `already friends with ${from.username}` });
    }
    user.friendRequests = [...newFriendRequests, accepted];
    user.friends = [...user.friends, from];

    from.friends = from.friends.concat(user.id);
    await user.save();
    const newUser = await from.save();

    response.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// reject friend request
usersRouter.post('/:id/reject_friend_request', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' });
    }
    // logged user
    const user = await User.findById(decodedToken.id);
    // user who sent friend request
    const from = await User.findById(request.params.id);
    const newFriendRequests = user.friendRequests.filter((r) => r.from.toString() !== from.id);
    const rejected = {
      from: from.id,
      status: 'rejected',
    };
    if (user.friends.find((f) => f.toString() === from.id)) {
      const removeFriend = user.friends.filter((f) => f.toString() !== from.id);
      user.friends = [...removeFriend];
      from.friends = from.friends.filter((f) => f.toString() !== user.id);
      await from.save();
      await user.save();
    }
    user.friendRequests = [...newFriendRequests, rejected];

    const newUser = await user.save();
    response.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
