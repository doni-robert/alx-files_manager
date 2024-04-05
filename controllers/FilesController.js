const { v4: uuid } = require('uuid');
const fs = require('fs');
const dbClient = require('../utils/db');

/**
 * Controller class for handling file-related operations.
 */
class FilesController {
  /**
   * Handles the upload of a new file.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object} The response object containing the uploaded file details or an error message.
   */
  static async postUpload(req, res) {
    // Extracting necessary data from request body
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    // Validating required fields
    if (!name) {
      return res.status(400).send({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).send({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).send({ error: 'Missing data' });
    }

    // Validating parent if provided
    if (parentId) {
      const foundFile = await dbClient.db.collection('files').findOne({ parentId });

      if (!foundFile) {
        return res.status(400).send({ error: 'Parent not found' });
      }
      if (foundFile.type !== 'folder') {
        return res.status(400).send({ error: 'Parent is not a folder' });
      }
    }

    // Creating file object
    const file = {
      userId: req.user._id,
      name,
      type,
      isPublic,
      parentId,
    };

    // Handling folder type separately
    if (type === 'folder') {
      // Inserting folder data into database
      await dbClient.db.collection('files').insertOne(file);
      return res.status(201).send({
        ...file,
        _id: undefined,
        id: file._id,
      });
    }

    // Handling non-folder types (files, images)
    const pathDir = process.env.FOLDER_PATH || '/tmp/files_manager';
    const fileUuid = uuid();
    const pathFile = `${pathDir}/${fileUuid}`;

    // Creating directory if it doesn't exist
    await fs.mkdir(pathDir, { recursive: true }, (error) => {
      if (error) return res.status(400).send({ error: error.message });
      return true;
    });

    // Writing file data to disk
    const buff = Buffer.from(data, 'base64');
    await fs.writeFile(pathFile, buff, (error) => {
      if (error) return res.status(400).send({ error: error.message });
      return true;
    });

    file.localPath = pathFile;

    // Inserting file data into database
    await dbClient.db.collection('files').insertOne(file);

    return res.status(201).send({
      ...file,
      _id: undefined,
      id: file._id,
      localPath: undefined,
    });
  }
}

module.exports = FilesController;
