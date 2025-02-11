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
import { ContactsDataTable } from "@/features/contacts/components/crm-table-modified";
import { getContactsByGroupId } from "@/features/contacts/data-access/contacts";
import { CONTACTS_TOTAL_PAGE_SIZE } from "@/constants";
import { auth } from "@/auth";
import { getGroupById } from "@/features/groups/data-access/groups";

export default async function GroupsContactsPage(
  props: {
    params: Promise<{ groupId: string }>;
    searchParams: Promise<{
      search: string;
      leadStatus: string | string[];
      sortColumn: string;
      sortOrder: string;
      page: number;
      limit: number;
    }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const contacts = await getContactsByGroupId({
    limit: CONTACTS_TOTAL_PAGE_SIZE,
    // leadStatus: [],
    // add leadstatus array except for pipe and sold author
    leadStatus: [
      "new",
      "no_answer",
      "not_in_service",
      "wrong_number",
      "do_not_call",
      "hung_up",
      "call_back",
      "not_interested",
      "refund",
      "contacts",
      "pipe",
      "charge_back",
      "sold_author"
    ],
    page: searchParams.page,
    search: searchParams.search,
    allowedRoles: ["admin"],
    groupId: params.groupId
  });

  const groupInfo = await getGroupById(params.groupId);

  return (
    <ContentLayout title="Imprints">
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
              <Link href="/imprints">Imprints</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/imprints/groups/${params.groupId}`}>
                {groupInfo?.groupName || "--"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Contacts</BreadcrumbPage>{" "}
            {contacts?.totalCount
              ? ` (${contacts.totalCount} total result)`
              : ""}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-2">
        <ContactsDataTable
          contacts={contacts?.results || []}
          totalCount={contacts?.totalCount || 0}
          page={searchParams?.page}
          search={searchParams?.search}
          role={"admin"}
          groupId={params.groupId}
        />
      </div>
      {/* <PlaceholderContent /> */}
    </ContentLayout>
  );
}
