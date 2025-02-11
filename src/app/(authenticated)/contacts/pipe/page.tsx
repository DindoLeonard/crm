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
  getContacts,
  getContactsByUser
} from "@/features/contacts/data-access/contacts";
import { CONTACTS_TOTAL_PAGE_SIZE } from "@/constants";
import { normalizeSearchParamsToArray } from "@/utils";
import { ContactsDataTable } from "../../../../features/contacts/components/crm-table-modified";

export const dynamic = "force-dynamic";

export default async function ContatsPage(
  props: {
    params: Promise<{}>;
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
  // const leadStatusNormalized = normalizeSearchParamsToArray(
  //   searchParams.leadStatus
  // );

  const contacts = await getContacts({
    limit: CONTACTS_TOTAL_PAGE_SIZE,
    // leadStatus: [],
    // add leadstatus array except for pipe and sold author
    leadStatus: ["pipe"],
    page: searchParams.page,
    search: searchParams.search,
    allowedRoles: [
      "admin",
      "ceo",
      "sales_director",
      "sales_operations_manager",
      "sales_rep",
      "team_lead",
      "viewer"
    ]
  });

  return (
    <ContentLayout title="Contacts">
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
            <BreadcrumbPage>Contacts</BreadcrumbPage>
            {contacts?.totalCount
              ? ` (${contacts.totalCount} total result)`
              : ""}
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Pipe</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-2">
        <ContactsDataTable
          contacts={contacts.results}
          totalCount={contacts.totalCount}
          page={searchParams?.page}
          search={searchParams.search}
        />
      </div>
    </ContentLayout>
  );
}
