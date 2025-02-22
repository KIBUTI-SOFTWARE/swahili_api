const { uploadToCloudinary } = require('../config/cloudinary');
const fs = require('fs').promises;

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        data: null,
        errors: ['No file uploaded']
      });
    }

    console.log('File received:', req.file);

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file, req.query.folder || 'general');

    // Delete the temporary file
    await fs.unlink(req.file.path);

    res.json({
      success: true,
      data: {
        imageUrl,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      },
      errors: []
    });
  } catch (err) {
    console.error('Upload error:', err);

    // If there was an error, try to delete the temporary file
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting temporary file:', unlinkErr);
      }
    }

    res.status(500).json({
      success: false,
      data: null,
      errors: [err.message]
    });
  }
};

exports.uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        errors: ['No files uploaded']
      });
    }

    // console.log('Files received:', req.files); 

    const uploadPromises = req.files.map(async (file) => {
      const imageUrl = await uploadToCloudinary(file, req.query.folder || 'general');
      await fs.unlink(file.path);
      return {
        imageUrl,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: {
        images: uploadedImages
      },
      errors: []
    });
  } catch (err) {
    console.error('Upload error:', err); // Add this for debugging

    // Clean up any temporary files
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkErr) {
          console.error('Error deleting temporary file:', unlinkErr);
        }
      }
    }

    res.status(500).json({
      success: false,
      data: null,
      errors: [err.message]
    });
  }
};
