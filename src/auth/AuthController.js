const jwt = require('jsonwebtoken');
const User = require('../app/models/User');
const promisify = require('util').promisify;

const sign = promisify(jwt.sign).bind(jwt);
const verify = promisify(jwt.verify).bind(jwt);

exports.generateToken = async (payload, secretSignature, tokenLife) => {
  try {
    return await sign(
      {
        payload,
      },
      secretSignature,
      {
        algorithm: 'HS256',
        expiresIn: tokenLife,
      },
    );
  } catch (error) {
    console.log(`Error in generate access token:  + ${error}`);
    return null;
  }
};
exports.decodeToken = async (token, secretKey) => {
  try {
    return await verify(token, secretKey, {
      ignoreExpiration: true,
    });
  } catch (error) {
    console.log(`Error in decode access token: ${error}`);
    return null;
  }
};
exports.validatePayload = async (req, res, next) => {
  const { email, phone, password, password_confirmation } = req.body;
  const user = await User.findOne({ email: email });
  if (user) {
    return res.status(409).send({
      error: 'Missing Request',
      message: 'Account already exists.',
    });
  } else {
    if (!email || !phone) {
      return res.status(400).json({
        error: 'Bad Request',
        message: "Missing required information: 'email or phone'",
      });
    }
    if (password !== password_confirmation) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Password is not match with re-password',
      });
    }
  }
  next();
};
exports.verifyAccount = async (req, res, next) => {
  const { refreshToken, refreshTokenAdmin } = req.cookies;
  let token = '';
  if (!refreshToken && !refreshTokenAdmin) {
    token = '';
  } else {
    if (refreshToken && !refreshTokenAdmin) {
      token = refreshToken;
    } else if (!refreshToken && refreshTokenAdmin) {
      token = refreshTokenAdmin;
    } else {
      token = '';
    }
  }
  if (token === '') {
    next();
  } else {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    const verifyToken = await exports.decodeToken(token, refreshTokenSecret);
    if (verifyToken) {
      const { payload } = verifyToken;
      const user = await User.findOneWithDeleted({
        email: payload.email,
        deleted: false,
      });
      if (user) {
        next();
      } else {
        res.clearCookie('refreshToken');
        res.status(401).json({
          message: 'Unauthorization',
        });
      }
    }
  }
};
