import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const BUCKET_NAMES: Record<string, string> = {
  "hero":           "gamma-hero",
  "gallery":        "gamma-gallery",
  "about":          "gamma-about",
  "extra-services": "gamma-extra-services",
  "apartments":     "gamma-apartments",
};

const PUBLIC_URLS: Record<string, string | undefined> = {
  "hero":           process.env.NEXT_PUBLIC_R2_HERO_URL,
  "gallery":        process.env.NEXT_PUBLIC_R2_GALLERY_URL,
  "about":          process.env.NEXT_PUBLIC_R2_ABOUT_URL,
  "extra-services": process.env.NEXT_PUBLIC_R2_EXTRA_SERVICES_URL,
  "apartments":     process.env.NEXT_PUBLIC_R2_APARTMENTS_URL,
};

export function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 env változók nincsenek beállítva!");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function getBucketName(bucket: string): string {
  const name = BUCKET_NAMES[bucket];
  if (!name) throw new Error(`Ismeretlen bucket: ${bucket}`);
  return name;
}

export function getPublicUrl(bucket: string, filename: string): string {
  const base = PUBLIC_URLS[bucket];
  if (!base) throw new Error(`Hiányzó public URL env var: ${bucket}`);
  return `${base}/${filename}`;
}

export async function deleteFromR2(bucket: string, imageUrl: string) {
  const filename = imageUrl.split("/").pop();
  if (!filename) return;
  const r2 = getR2Client();
  await r2.send(new DeleteObjectCommand({
    Bucket: getBucketName(bucket),
    Key: filename,
  }));
}

export { PutObjectCommand };
