
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dqvqkfkti',
  api_key: '394625577664157',
  api_secret: process.env.CLOUDINARY_SECRET
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { public_id, resource_type = 'image' } = req.body;

  if (!public_id) {
    return res.status(400).json({ error: 'public_id is required' });
  }

  if (!process.env.CLOUDINARY_SECRET) {
    return res.status(500).json({ error: 'CLOUDINARY_SECRET not configured' });
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type
    });

    if (result.result === 'ok' || result.result === 'not found') {
      return res.status(200).json({ success: true, result: result.result });
    } else {
      return res.status(500).json({ error: 'Cloudinary deletion failed', details: result });
    }
  } catch (err) {
    console.error("Cloudinary Delete Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
