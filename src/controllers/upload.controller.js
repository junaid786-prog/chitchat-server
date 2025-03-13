const { CatchAsync } = require("../utils/CatchAsync");
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { uploadFile, getSignedUrl } = require("../utils/s3");

const uploadController = {
    uploadFile: CatchAsync(async (req, res, next) => {
        try {
            // Check if file exists in request
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            // Extract file details
            const { originalname, buffer, mimetype } = req.file;

            // Get folder path from request body or use default
            const folderPath = req.body.folderPath || 'uploads';

            // Generate a unique filename
            const fileExtension = path.extname(originalname);
            const fileName = `${uuidv4()}${fileExtension}`;

            // Upload file to S3
            const uploadResult = await uploadFile({
                fileContent: buffer,
                folderPath: folderPath,
                fileName: fileName,
                // You can add metadata if needed
                metadata: {
                    contentType: mimetype,
                    originalName: originalname
                }
            });

            // Get a signed URL that expires in 1 hour
            const signedUrl = await getSignedUrl({
                key: uploadResult.key,
                expiresIn: 3600 // 1 hour
            });

            // Return successful response
            res.status(200).json({
                success: true,
                message: 'File uploaded successfully',
                data: {
                    ...uploadResult,
                    signedUrl,
                    originalName: originalname,
                    contentType: mimetype
                }
            });
        } catch (error) {
            next(error);
        }
    })
}

module.exports = uploadController;