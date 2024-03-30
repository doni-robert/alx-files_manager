const { createClient } = require('redis');
const { promisify } = require ('util');
/**
 * Represents a Redis client.
 */
class RedisClient {
  constructor() {
    // Create a Redis client instance
    this.client = createClient();

    // Promisify the 'get' method of the client
    this.getAsync = promisify(this.client.get).bind(this.client);

    // Error handling: log any errors that occur
    this.client.on('error', (err) => console.log(err));

    // Ensure connection: handle connection events
    this.client.on_connect();
  }

  /**
     * Checks if the client is connected.
     * @returns {boolean} True if the client is connected, otherwise false.
     */
  isAlive() {
    return this.client.connected;
  }

  /**
     * Asynchronously retrieves the value of a key.
     * @param {string} key - The key to retrieve the value for.
     * @returns {Promise<any>} A Promise that resolves with the value of the key.
     */
  async get(key) {
    return this.getAsync(key);
  }

  /**
     * Asynchronously sets a key-value pair with expiry.
     * @param {string} key - The key to set.
     * @param {any} value - The value to set for the key.
     * @param {number} duration - The duration (in seconds) for the key set to expire.
     * @returns {Promise<void>} A Promise that resolves when the key-value pair is successfully set.
     */
  async set(key, value, duration) {
    await this.client.set(key, value, 'EX', duration);
  }

  /**
     * Asynchronously deletes a key.
     * @param {string} key - The key to delete.
     * @returns {Promise<void>} A Promise that resolves when the key is successfully deleted.
     */
  async del(key) {
    await this.client.del(key);
  }
}

// Create an instance of RedisClient
const redisClient = new RedisClient();

// Export the Redis client instance
module.exports = redisClient;