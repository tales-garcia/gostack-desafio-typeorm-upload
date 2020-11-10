import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

const uploadConfig = {
  directory: tmpFolder,

  storage: multer.diskStorage({
    destination: tmpFolder,
    filename: (req, file, callback) => {
      const filename = `${Date.now()}-${crypto.randomBytes(10).toString()}-${file.originalname}`;

      callback(null, filename);
    }
  })
}

export default uploadConfig;
