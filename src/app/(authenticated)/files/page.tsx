"use client";

import { fetchFileContent } from "@/data-access";
import React, { useState } from "react";

export default function ViewFileContent() {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const fetchFile = async () => {
    const response = await fetchFileContent(
      "bridgebooks-import-history",
      "test/467480345_9600662966615123_2520341689836854706_n.png"
    );
    if (response.success) {
      if (response.fileContent) {
        setFileContent(response.fileContent);
        setMessage("File content loaded");
      }
    } else {
      setMessage(`Error: ${response.error}`);
    }
  };

  return (
    <div>
      <button onClick={fetchFile}>Get File Content</button>
      {message && <p>{message}</p>}
      {fileContent && (
        <div>
          <img
            src={`data:image/png;base64,${fileContent}`}
            alt="Fetched File"
          />
        </div>
      )}
      {
        <img
          src="https://bridgebooks-import-history.s3.ap-southeast-1.amazonaws.com/09b1d1f9-235e-4794-8038-d2c77110a00c/frame-(1)-1736308871959.png"
          alt="asdsad"
        />
      }
    </div>
  );
}
