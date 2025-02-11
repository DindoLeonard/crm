"use client";

import { uploadFileToS3 } from "@/data-access";
import { formatFileNameWithTimestamp } from "@/utils";
import React, { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState<string>("uploads"); // userId
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file");
      return;
    }

    // Convert file to Base64
    const fileAsBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string); // Base64 string
      reader.onerror = reject;
      reader.readAsDataURL(file); // Read as Base64
    });

    const formattedFileName = formatFileNameWithTimestamp(file.name);

    const response = await uploadFileToS3(
      process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
      folder,
      formattedFileName,
      fileAsBase64
    );

    if (response.success) {
      setMessage("File uploaded successfully!");
    } else {
      setMessage(`Error: ${response.error}`);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Folder name"
        value={folder}
        onChange={(e) => setFolder(e.target.value)}
      />
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
}
