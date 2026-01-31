const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Default folder structure: tutor-platform/{folder_name}/{user_id_if_exists}
        let folderName = req.uploadFolder || 'misc';
        let subFolder = req.user ? req.user.id : 'anonymous';

        return {
            folder: `tutor-platform/${folderName}/${subFolder}`,
            resource_type: 'auto', // Support image, video, raw
            allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'webm', 'mov'],
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
        };
    },
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;
