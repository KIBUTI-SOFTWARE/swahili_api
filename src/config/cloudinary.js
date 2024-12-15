const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Utility function for uploading to Cloudinary
const uploadToCloudinary = async (file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `swahili_marketplace/${folder}`,
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
      transformation: [
        { width: 500, height: 500, crop: 'limit' }
      ]
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Image upload failed');
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary
};