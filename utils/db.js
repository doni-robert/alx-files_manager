// import { MongoClient } from 'mongodb';

// class DBClient {
//   /**
//    * Initializes a new instance of DBClient
//    */
//   constructor() {
//     const HOST = process.env.DB_HOST || 'localhost';
//     const PORT = process.env.BD_PORT || 27017;
//     const DATABASE = process.env.DB_DATABASE || 'files_manager';
//     const URI = `mongodb://${HOST}:${PORT}`;
//     this.mongoClient = new MongoClient(URI, { useUnifiedTopology: true });
//     this.mongoClient.connect((error) => {
//       if (!error) this.db = this.mongoClient.db(DATABASE);
//     });
//   }

//   /**
//    * Check mongodb client's connection status
//    * @returns {boolean} mongoClient connection status
//    */
//   isAlive() {
//     return this.mongoClient.isConnected();
//   }

//   /**
//    * Retrieves specified collection from database
//    * @returns {import("mongodb").Collection} - users collection object
//    */
//   getCollection(collectionName) {
//     const collection = this.db.collection(collectionName);
//     return collection;
//   }

//   async nbUsers() {
//     const usersCollection = this.getCollection('users');
//     const numberOfUsers = await usersCollection.countDocuments();
//     return numberOfUsers;
//   }

//   /**
//    * Queries 'files' collection
//    * @returns {number} - number of documents in files collection
//    */
//   async nbFiles() {
//     const filesCollection = this.getCollection('files');
//     const numberOfFiles = filesCollection.countDocuments();
//     return numberOfFiles;
//   }

//   /**
//    * Closes connection to mongodb client
//    */
//   async close() {
//     await this.mongoClient.close();
//   }
// }

// const dbClient = new DBClient();
// export default dbClient;

import { MongoClient } from 'mongodb';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';

const url = `mongodb://${HOST}:${PORT}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(url, { useUnifiedTopology: true, useNewUrlParser: true });
    this.client.connect().then(() => {
      this.db = this.client.db(`${DATABASE}`);
    }).catch((err) => {
      console.log(err);
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const users = this.db.collection('users');
    const usersNum = await users.countDocuments();
    return usersNum;
  }

  async nbFiles() {
    const files = this.db.collection('files');
    const filesNum = await files.countDocuments();
    return filesNum;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;