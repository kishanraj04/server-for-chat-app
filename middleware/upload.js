import multer from "multer";
import path from 'path';

// Configure storage destination and filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

const uploadFile = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,  
  },
});

export const uploadAvatar = uploadFile.single("avatar");