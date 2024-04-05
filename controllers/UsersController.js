const sha1 = require('sha1');
const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');
const redis = require('../utils/redis');

class UsersController {
  /**
     * Handles the creation of a new user.
     * @param {Object} req - The request object.
     * @param {Object} response - The response object.
     * @returns {Object} The response object containing the new user details or an error message.
     */
  static async postNew(req, response) {
    // Extracting email and password from request body
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    // Checking if email or password is missing
    if (!email) {
      return response.status(400).send({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).send({ error: 'Missing password' });
    }

    // Checking if user with the same email already exists
    if (await dbClient.db.collection('users').findOne({ email })) {
      return response.status(400).send({ Error: 'Already exist' });
    }

    // Hashing the password using sha1
    const hashPassword = sha1(password);

    // Inserting new user into the database
    await dbClient.db.collection('users').insertOne(
      {
        email,
        password: hashPassword,
      },
    );

    // Retrieving newly inserted user from the database
    const newUser = await dbClient.db.collection('users').findOne({ email });

    // Removing password field from the user object before sending response
    delete newUser.password;

    // Sending response with status 201 (Created) and the new user object
    return response.status(201).send(newUser);
  }

  static async getMe(req, res, next) {
    try {
      const token = req.header('X-Token');

      const userId = await redis.get(`auth_${token}`);
      if (!userId || !token) { throw new Error(); }

      const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });

      if (next) {
        req.user = user; // Attach user object to the request
        next();
      } else {
        // If next function is not provided, respond directly to the client
        res.status(200).send({
          id: user._id,
          email: user.email,
        });
      }
    } catch (error) {
      res.status(401).send({ error: 'Unauthorized' });
    }
  }
}

module.exports = UsersController;
