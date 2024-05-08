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

usersRouter.get('/', async (request, response) => {
  const users = await User.find({});
  response.json(users);
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
      from: loggedUser,
      status: 'pending',
    };
    user.friendRequests = user.friendRequests.concat(friendRequest);
    const newUser = await user.save();
    response.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
