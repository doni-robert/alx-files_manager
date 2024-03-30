const redis = require('../utils/redis');
const db = require('../utils/db');

class AppController {
  /**
     * Handles the request to get the status of Redis and the database.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
  static getStatus(req, res) {
    // Getting the status of Redis and the database
    const status = {
      redis: redis.isAlive(), // Checking if Redis is alive
      db: db.isAlive(), // Checking if the database is alive
    };
    // Sending the status response
    res.status(200).send(status);
  }

  /**
     * Handles the request to get statistics about users and files.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
  static async getStats(req, res) {
    // Getting statistics about users and files
    const stats = {
      users: await db.nbUsers(), // Getting the number of users
      files: await db.nbFiles(), // Getting the number of files
    };
    // Sending the statistics response
    res.status(200).send(stats);
  }
}

module.exports = AppController;
