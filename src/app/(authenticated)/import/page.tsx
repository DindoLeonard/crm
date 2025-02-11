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
import { deleteAllContacts } from "@/features/contacts/data-access/contacts";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DeleteAllContactsButton } from "@/features/contacts/components/delete-all-contacts-button";
import { SampleDownloadButton } from "@/features/contacts/components/sample-file-download-button";
import { XlsxReactDropzone } from "@/features/contacts/components/xlsx-react-dropzone";
import { getGroups } from "@/features/groups/data-access/groups";
import { Button } from "@/components/ui/button";

export default async function ImportPage() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  if (session.user?.role !== "admin") {
    redirect("/unauthorized");
  }

  const groups = await getGroups({});

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
            <BreadcrumbPage>Import</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* <PlaceholderContent /> */}
      <div className="w-full text-center mb-2">
        <h1 className="text-2xl font-bold">**For uploading xlsx file**</h1>

        <Link href={"/import/history"}>
          <Button variant={"link"} className="border">
            Import History
          </Button>
        </Link>
      </div>

      {/* <form
        action={deleteAllContacts}
        // method="post"
        className="w-full flex flex-col space-y-2 mb-2 lg:flex-row lg:space-x-2 lg:space-y-0 lg:justify-center"
      >
        <DeleteAllContactsButton /> */}
      <SampleDownloadButton />
      {/* </form> */}

      <XlsxReactDropzone groups={groups.results} />
    </ContentLayout>
  );
}
