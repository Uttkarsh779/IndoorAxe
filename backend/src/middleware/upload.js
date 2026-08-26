import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');

function storageFor(subfolder) {
  const dest = path.join(uploadsRoot, subfolder);
  fs.mkdirSync(dest, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
}

const imageFilter = (req, file, cb) => {
  if (/^image\//.test(file.mimetype)) return cb(null, true);
  cb(new Error('Only image uploads are allowed'));
};

export const uploadProductImages = multer({
  storage: storageFor('Product'),
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const blogFieldToSubfolder = { thumbnail: 'blog/thumbnail', banner: 'blog/Banner' };
const blogStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(uploadsRoot, blogFieldToSubfolder[file.fieldname] || 'blog');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

export const uploadBlogImages = multer({
  storage: blogStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadTestimonialImage = multer({
  storage: storageFor('Testimonials'),
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadClientLogo = multer({
  storage: storageFor('Client'),
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export function publicUrlFor(subfolder, filename) {
  if (!filename) return '';
  return `/uploads/${subfolder}/${filename}`;
}
