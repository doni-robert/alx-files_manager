const { v4: uuid } = require('uuid');
const fs = require('fs');
const { ObjectId } = require('mongodb');
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

  static async getShow(req, res) {
    const fileId = req.params.id || '';
    const user = req.user._id;
    const file = await dbClient.collection('files').findOne({ _id: ObjectId(fileId), userId: user });

    if (!file) return res.status(404).send({ error: 'Not found' });

    return res.send({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  static async getIndex(req, res) {
    const parentId = (req.query.parentId) || 0;
    const page = (req.query.page) || 0;
    const pipeline = [];
    if (parentId !== 0) {
      const aggregationMatch = { $and: [{ parentId }] };
      pipeline.push({ $match: aggregationMatch });
    }

    const skipCount = page * 20;
    pipeline.push({ $skip: skipCount }, { $limit: 20 });

    let fileDocs = [];

    try {
      fileDocs = await dbClient.db.collection('files').aggregate(pipeline).toArray();
    } catch (error) {
      return res.status(500).send(error);
    }

    const filesArray = [];
    fileDocs.forEach((item) => {
      const fileItem = {
        id: item._id,
        userId: item.userId,
        name: item.name,
        type: item.type,
        isPublic: item.isPublic,
        parentId: item.parentId,
      };
      filesArray.push(fileItem);
    });

    return res.send(filesArray);
  }
}

module.exports = FilesController;
