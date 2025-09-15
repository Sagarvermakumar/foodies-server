import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

//Allowed formats
const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

//File filter
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, Webp, and PNG files are allowed."));
  }
};

/**
 *  Dynamic uploader
 * @param {string} folderName - Cloudinary folder name (e.g. 'profilePics', 'menuItems', 'categories')
 */
export const createUploader = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: folderName,
      allowed_formats: allowedMimeTypes.map((type) => type.split("/")[1]),
      public_id: `${folderName}-${Date.now()}`,
    }),
  });

  return multer({ storage, fileFilter });
};
