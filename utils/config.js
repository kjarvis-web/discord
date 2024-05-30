require('dotenv').config();

const { PORT } = process.env;
const { MONGODB_URI } = process.env;
const { LOCAL, RENDER } = process.env;
const url = process.env.NODE_ENV === 'development' ? LOCAL : RENDER;

module.exports = {
  PORT,
  MONGODB_URI,
  url,
};
