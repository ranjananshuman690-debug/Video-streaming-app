import { v2 as cloudinary } from "cloudinary";

/**
 * Returns a freshly-configured Cloudinary instance.
 * Config is applied at call time (not module load time) to avoid
 * stale values from Next.js module caching in dev mode.
 */
export function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
}

export default cloudinary;
