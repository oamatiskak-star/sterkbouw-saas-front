import multer from 'multer';
import { createRouter } from 'next-connect';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
destination: function (req, file, cb) {
cb(null, uploadDir);
},
filename: function (req, file, cb) {
const uniqueId = uuidv4();
const extension = path.extname(file.originalname);
cb(null, ${uniqueId}${extension});
},
});

const upload = multer({
storage: storage,
limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
fileFilter: (req, file, cb) => {
const allowedTypes = ['.ifc', '.rvt', '.pdf', '.jpg', '.jpeg', '.png'];
const extension = path.extname(file.originalname).toLowerCase();
if (allowedTypes.includes(extension)) {
cb(null, true);
} else {
cb(new Error('Invalid file type'), false);
}
},
});

const router = createRouter();

router.use(upload.single('file'));

router.post((req, res) => {
try {
if (!req.file) {
return res.status(400).json({ error: 'No file uploaded' });
}

text
const fileInfo = {
  id: uuidv4(),
  originalName: req.file.originalname,
  fileName: req.file.filename,
  path: req.file.path,
  size: req.file.size,
  mimetype: req.file.mimetype,
  uploadedAt: new Date().toISOString(),
};

// In a real app, save to database
console.log('File uploaded:', fileInfo);

res.status(200).json({
  success: true,
  message: 'File uploaded successfully',
  file: fileInfo,
});
} catch (error) {
console.error('Upload error:', error);
res.status(500).json({ error: 'Upload failed' });
}
});

export default router.handler();

export const config = {
api: {
bodyParser: false,
},
};
