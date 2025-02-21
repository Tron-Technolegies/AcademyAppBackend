import multer from "multer";
import DataParser from "datauri/parser.js";
import path from "path";

const storage = multer.memoryStorage(); //setting up a memory storage for the incoming file

const upload = multer({ storage }); //middle ware function of melter

const parser = new DataParser(); // creating an instance of parser because the file in memory storage is buffer

export const formatImage = (file) => {
  //function to retrive the file content from the buffer
  const fileExtension = path.extname(file.originalname).toString();
  return parser.format(fileExtension, file.buffer).content;
};

export default upload;
