import multer from "multer";
import path from 'path';



const storage = multer.memoryStorage(); // store in memory

const uploadFile = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB
  },
});


export const uploadAvatar = uploadFile.single("avatar");
export const attachment = uploadFile.array("files",5);