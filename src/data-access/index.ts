"use server";

import s3Client from "@/lib/s3Client";
import { formatFileNameWithTimestamp } from "@/utils";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

// export async function uploadFileToS3(
//   bucket: string,
//   key: string,
//   file: Buffer
// ) {
//   try {
//     const command = new PutObjectCommand({
//       Bucket: bucket,
//       Key: key,
//       Body: file
//     });

//     const response = await s3Client.send(command);
//     return { success: true, data: response };
//   } catch (error) {
//     console.error("S3 Upload Error:", error);
//     const errorObj = error as Error;
//     return { success: false, error: errorObj.message };
//   }
// }

export async function uploadFileToS3(
  bucket: string,
  folder: string,
  fileName: string,
  fileBase64: string
) {
  try {
    // Extract the actual Base64 content from `data:<type>;base64,...`
    const base64Content = fileBase64.split(",")[1];
    const fileBuffer = Buffer.from(base64Content, "base64");

    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileBuffer
    });

    const response = await s3Client.send(command);
    return { success: true, data: response };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    const errorObj = error as Error;
    return { success: false, error: errorObj.message };
  }
}

export async function fetchFileContent(bucket: string, key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });

    const response = await s3Client.send(command);

    if (response.Body instanceof Readable) {
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      return { success: true, fileContent: buffer.toString("base64") };
    }

    return { success: false, error: "Invalid file content" };
  } catch (error) {
    console.error("Error fetching file content:", error);
    const errorObj = error as Error;
    return { success: false, error: errorObj.message };
  }
}
