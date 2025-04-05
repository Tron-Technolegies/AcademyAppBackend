import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (
  buffer,
  resourceType = "auto",
  folder = "chat_media"
) => {
  try {
    // Create a promise wrapper around the upload_stream callback
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType, folder },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Convert buffer to readable stream and pipe to Cloudinary
      const bufferStream = Readable.from(buffer);
      bufferStream.pipe(uploadStream);
    });

    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error; // Re-throw the error for the caller to handle
  }
};

export default uploadToCloudinary;
