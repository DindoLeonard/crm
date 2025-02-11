import Link from "next/link";

import PlaceholderContent from "@/components/demo/placeholder-content";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
  deleteAllContacts,
  getImportHistory
} from "@/features/contacts/data-access/contacts";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DeleteAllContactsButton } from "@/features/contacts/components/delete-all-contacts-button";
import { SampleDownloadButton } from "@/features/contacts/components/sample-file-download-button";
import { XlsxReactDropzone } from "@/features/contacts/components/xlsx-react-dropzone";
import { getGroups } from "@/features/groups/data-access/groups";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDateTimeToLocale } from "@/utils";

export default async function ImportPage() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  if (session.user?.role !== "admin") {
    redirect("/unauthorized");
  }

  const importHistoryResponse = await getImportHistory({});

  return (
    <ContentLayout title="Dashboard">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/import">Import</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>History</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* <PlaceholderContent /> */}
      <div className="w-full text-center mb-2">
        <h1 className="text-2xl font-bold">Import History</h1>
      </div>

      <div className="grid grid-cols-1">
        <div>
          <div className="py-3 rounded">
            <div className="w-full flex lg:items-center flex-col lg:flex-row">
              <div className="w-full lg:w-1/2">
                <p className="text-lg font-medium">File Name:</p>
              </div>
              {/* add uploader name */}
              <div className="w-full lg:w-1/2">
                <p className="text-lg font-medium">Uploader Name:</p>
              </div>

              <div className="w-full lg:w-1/2">
                <p className="text-lg font-medium">Date:</p>
              </div>

              <div className="w-full lg:w-1/2">
                <p className="text-lg font-medium">Upload info:</p>
              </div>
              <div className="w-full lg:w-1/2 flex lg:justify-end justify-center"></div>
            </div>
          </div>
          {/* <Separator orientation="horizontal" /> */}
        </div>
        {importHistoryResponse?.results?.map((importHistoryData, index) => (
          <div key={`import-history-${index}`}>
            <div className="py-3 rounded">
              <div className="w-full flex lg:items-center flex-col lg:flex-row">
                <div className="w-full lg:w-1/2">
                  <p className="text-sm">{importHistoryData?.fileName}</p>
                </div>
                {/* add uploader name */}
                <div className="w-full lg:w-1/2">
                  <p className="text-sm">{importHistoryData?.user?.name}</p>
                </div>

                <div className="w-full lg:w-1/2">
                  <p className="text-sm">
                    {importHistoryData?.createdAt
                      ? formatDateTimeToLocale(
                          new Date(importHistoryData?.createdAt)
                        )
                      : "--"}
                  </p>
                </div>

                <div className="w-full lg:w-1/2">
                  <p>New Added: {importHistoryData?.contactsInsertedCount}</p>

                  <p className="text-sm">
                    Deduped: {importHistoryData?.contactsDedupedCount}
                  </p>
                  <p className="text-sm">
                    Total: {importHistoryData?.contactsTotalCount}
                  </p>
                </div>
                {/* <div className="w-full lg:w-1/2 flex lg:justify-end justify-center">
                  <Button variant="link" className="border">
                    Download
                  </Button>
                </div> */}
                <div className="w-full lg:w-1/2 flex lg:justify-end justify-center">
                  {importHistoryData?.fileUrl ? (
                    <a
                      href={importHistoryData.fileUrl}
                      download
                      className="inline-flex"
                    >
                      <Button variant="link" className="border">
                        Download
                      </Button>
                    </a>
                  ) : (
                    <Button variant="link" className="border" disabled>
                      No File
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {index !== 9 && <Separator orientation="horizontal" />}
          </div>
        ))}
      </div>
    </ContentLayout>
  );
}
