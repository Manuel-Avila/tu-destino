import crypto from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadBufferToCloudinary } from './cloudinary.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const reportUploadsDirectory = path.resolve(currentDirectory, '../uploads/reportes');

const extensionsByMimeType = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function hasCloudinaryCredentials() {
  const values = [
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET,
  ];
  return values.every((value) => (
    value
    && !/^(tu_|your_|change_|replace_|placeholder)/i.test(value)
  ));
}

/** Usa Cloudinary cuando está configurado y almacenamiento local como respaldo de desarrollo. */
export async function saveReportEvidence(file, baseUrl) {
  if (hasCloudinaryCredentials()) {
    return uploadBufferToCloudinary(
      file.buffer,
      'tudestino/reportes',
      file.mimetype
    );
  }

  await mkdir(reportUploadsDirectory, { recursive: true });
  const extension = extensionsByMimeType[file.mimetype];
  const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  await writeFile(path.join(reportUploadsDirectory, fileName), file.buffer, { flag: 'wx' });
  return `${baseUrl}/uploads/reportes/${fileName}`;
}
