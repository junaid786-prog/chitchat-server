const AWS = require('aws-sdk');
const path = require('path');
require('dotenv').config();

// Configure AWS S3 client
const configureS3 = (config = {}) => {
  const {
    region = process.env.AWS_REGION || 'eu-west-3',
    accessKeyId = process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY,
    bucketName = process.env.S3_BUCKET_NAME || 'default-bucket'
  } = config;

  AWS.config.update({ region });

  const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey
  });

  return {
    s3,
    bucketName,
    region
  };
};

/**
 * Upload a file to S3
 * @param {Object} options - Upload options
 * @param {Buffer} options.fileContent - The file content as a Buffer
 * @param {string} options.folderPath - The folder path to save the file in (without trailing slash)
 * @param {string} options.fileName - The name to save the file as
 * @param {Object} options.s3Config - Optional S3 configuration override
 * @returns {Promise<Object>} Uploaded file details
 */
async function uploadFile({ fileContent, folderPath, fileName, s3Config = {} }) {
  const { s3, bucketName } = configureS3(s3Config);
  
  // Sanitize file name (basic implementation - expand as needed)
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Construct the key (path in S3)
  const key = folderPath ? `${folderPath}/${sanitizedFileName}` : sanitizedFileName;

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
    ContentDisposition: `attachment; filename="${sanitizedFileName}"`,
    ServerSideEncryption: 'AES256', // Enable server-side encryption
  };

  try {
    console.log(`Attempting to upload to ${bucketName}`);
    const data = await s3.upload(params).promise();
    console.log(`File uploaded successfully at ${data.Location}`);
    return {
      url: data.Location,
      key: data.Key
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    console.error('Bucket:', bucketName);
    throw error;
  }
}

/**
 * Generate a pre-signed URL for temporary access to an S3 object
 * @param {Object} options - Options for generating signed URL
 * @param {string} options.key - The S3 object key
 * @param {number} options.expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @param {Object} options.s3Config - Optional S3 configuration override
 * @returns {Promise<string>} Pre-signed URL
 */
async function getSignedUrl({ key, expiresIn = 3600, s3Config = {} }) {
  const { s3, bucketName } = configureS3(s3Config);
  
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: expiresIn
  };

  try {
    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

/**
 * List all files in a specific folder
 * @param {Object} options - Options for listing files
 * @param {string} options.prefix - The prefix/folder path to list files from
 * @param {Object} options.s3Config - Optional S3 configuration override
 * @returns {Promise<Array>} Array of file objects
 */
async function listFiles({ prefix, s3Config = {} }) {
  const { s3, bucketName, region } = configureS3(s3Config);
  
  const params = {
    Bucket: bucketName,
    Prefix: prefix
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    return data.Contents.map(item => {
      return {
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        url: `https://${bucketName}.s3.${region}.amazonaws.com/${item.Key}`
      };
    });
  } catch (error) {
    console.error('Error listing files from S3:', error);
    throw error;
  }
}

/**
 * Delete a file from S3
 * @param {Object} options - Options for deleting a file
 * @param {string} options.key - The S3 key of the file to delete
 * @param {Object} options.s3Config - Optional S3 configuration override
 * @returns {Promise<boolean>} Success status
 */
async function deleteFile({ key, s3Config = {} }) {
  const { s3, bucketName } = configureS3(s3Config);
  
  const params = {
    Bucket: bucketName,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
    console.log(`File ${key} deleted successfully`);
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
}

module.exports = {
  uploadFile,
  getSignedUrl,
  listFiles,
  deleteFile,
  configureS3
};