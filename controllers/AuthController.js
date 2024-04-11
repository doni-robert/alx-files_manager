const auth = require('basic-auth');
const { v4: uuid } = require('uuid');
const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redis = require('../utils/redis');

/**
 * Controller class for handling authentication-related operations.
 */
class AuthController {
  /**
   * Handles user authentication and generates a token for the authenticated user.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object} The response object containing a token or an error message.
   */
  static async getConnect(req, res) {
    let foundUser;
    try {
      const user = auth(req); // Extracting basic authentication credentials from request
      const password = sha1(user.pass); // Hashing the password
      const email = user.name; // Extracting the email from the credentials
      if (!user || !email || !password) { throw new Error(); } // Validating credentials

      // Querying the database to find the user by email and password
      foundUser = await dbClient.db.collection('users').findOne({
        email,
        password,
      });
    } catch (error) {
      // Handling authentication errors
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // Generating a unique token
    if (foundUser) {
      const token = uuid();
      const key = `auth_${token}`;
      
      // Storing the user's ID in Redis cache with the token as key
      await redis.set(key, foundUser._id.toString(), 86400);

      // Sending the token in the response
      return res.status(200).send({ token });
    }
  }

  /**
   * Handles user disconnection by removing the token from Redis cache.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object} The response object indicating success or failure.
   */
  static async getDisconnect(req, res) {
    try {
      const token = req.header('X-Token'); // Extracting token from request headers

      // Retrieving user ID from Redis cache using the token
      const user = await redis.get(`auth_${token}`);
      if (!user || !token) { throw new Error(); } // Validating token and user existence
      await redis.del(`auth_${token}`); // Removing token from Redis cache

      // Sending success response
      return res.status(204).send();
    } catch (error) {
      // Handling disconnection errors
      return res.status(401).send({ error: 'Unauthorized' });
    }
  }
}

module.exports = AuthController;