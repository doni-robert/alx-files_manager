/**
 * DBClient class for interacting with MongoDB.
 */
const { MongoClient } = require('mongodb');

class DBClient {
  /**
     * Creates an instance of DBClient.
     * @param {string} host - The MongoDB host.
     * @param {number} port - The MongoDB port.
     * @param {string} db_name - The name of the database.
     */
  constructor(
    host = process.env.DB_HOST || 'localhost',
    port = process.env.DB_PORT || 27017,
    db_name = process.env.DB_NAME || 'files_manager',
  ) {
    const url = `mongodb://${host}:${port}`;
    const client = new MongoClient(url, { useUnifiedTopology: true });

    // Establish connection to MongoDB
    client.connect()
      .then(() => {
        // Set the database reference
        this.db = client.db(db_name);
      })
      .catch((err) => {
        // Log and handle connection error
        console.error('Error connecting to MongoDB:', err);
        this.db = false;
      });
  }

  /**
     * Checks if the database connection is alive.
     * @returns {boolean} True if the connection is alive, otherwise false.
     */
  isAlive() {
    return Boolean(this.db);
  }

  /**
     * Retrieves the number of users in the database.
     * @returns {Promise<number>} A Promise that resolves with the number of users.
     */
  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  /**
     * Retrieves the number of files in the database.
     * @returns {Promise<number>} A Promise that resolves with the number of files.
     */
  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }
}

// Create an instance of DBClient
const dbClient = new DBClient();

module.exports = dbClient;
