import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function getR2Client(): S3Client {
  const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;

  return new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: R2_SECRET_ACCESS_KEY ?? "",
    },
    requestHandler: {
      requestTimeout: 8000,
    },
  });
}

export async function uploadScreenshot(
  file: Buffer,
  fileName: string,
  contentType: string,
  userId: string,
): Promise<{ success: boolean; key?: string; error?: string }> {
  try {
    const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = process.env;

    if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
      console.error("[r2/upload]", "Missing R2 credentials in environment");
      return { success: false, error: "R2 storage not configured" };
    }

    if (file.length > MAX_FILE_SIZE) {
      return { success: false, error: "File exceeds 5MB limit" };
    }

    const key = `payments/${userId}/${Date.now()}-${fileName}`;
    const client = getR2Client();

    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
      }),
    );

    console.log("[r2/upload]", { key, userId, size: file.length });

    return { success: true, key };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[r2/upload]", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function getScreenshotUrl(
  key: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = process.env;

    if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
      console.error("[r2/get-url]", "Missing R2 credentials in environment");
      return { success: false, error: "R2 storage not configured" };
    }

    const client = getR2Client();

    const url = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }),
      { expiresIn: 900 },
    );

    console.log("[r2/get-url]", { key });

    return { success: true, url };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[r2/get-url]", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function deleteScreenshot(
  key: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = process.env;

    if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
      console.error("[r2/delete]", "Missing R2 credentials in environment");
      return { success: false, error: "R2 storage not configured" };
    }

    const client = getR2Client();

    await client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      }),
    );

    console.log("[r2/delete]", { key });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[r2/delete]", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function uploadTestimonialPhoto(
  file: Buffer,
  fileName: string,
  contentType: string,
): Promise<{ success: boolean; key?: string; error?: string }> {
  try {
    const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = process.env;

    if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
      console.error("[r2/upload-testimonial]", "Missing R2 credentials in environment");
      return { success: false, error: "R2 storage not configured" };
    }

    if (file.length > MAX_FILE_SIZE) {
      return { success: false, error: "File exceeds 5MB limit" };
    }

    const key = `testimonials/${Date.now()}-${fileName}`;
    const client = getR2Client();

    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
      }),
    );

    return { success: true, key };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[r2/upload-testimonial]", errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function getTestimonialPhotoUrl(
  key: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = process.env;

    if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
      return { success: false, error: "R2 storage not configured" };
    }

    const client = getR2Client();
    const url = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }),
      { expiresIn: 604800 }, // 7 days — safe with daily ISR revalidation
    );

    return { success: true, url };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[r2/get-testimonial-url]", errorMessage);
    return { success: false, error: errorMessage };
  }
}
