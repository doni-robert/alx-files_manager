const sha1 = require('sha1');
const dbClient = require('../utils/db');

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
}

module.exports = UsersController;
