import { v2 as cloudinary } from 'cloudinary';

export const uploadBufferToCloudinary = (buffer, folder = 'tudestino') => {
  return new Promise((resolve, reject) => {
    const b64 = Buffer.from(buffer).toString('base64');
    const dataURI = `data:image/jpeg;base64,${b64}`;
    cloudinary.uploader.upload(dataURI, { folder, resource_type: 'auto' })
      .then(result => resolve(result.secure_url))
      .catch(err => reject(err));
  });
};
