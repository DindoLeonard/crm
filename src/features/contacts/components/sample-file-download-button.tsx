"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "nextjs-toploader/app";

export function SampleDownloadButton() {
  const router = useRouter();
  const onDownloadSample = () => {
    // Update the URL to point to your Next.js API route
    const fileUrl = "/api/download-sample";
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", "Sample.lead.file.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    router.push("/contacts/payment");
  };

  return (
    <div className="mb-4">
      <Button onClick={onDownloadSample} className="w-full">
        Download Sample
      </Button>
    </div>
  );
}
