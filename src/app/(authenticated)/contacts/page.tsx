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
import { ContactsDataTable } from "../../../features/contacts/components/crm-table-modified";
import {
  getContacts,
  getContactsByUser
} from "@/features/contacts/data-access/contacts";
import { CONTACTS_TOTAL_PAGE_SIZE } from "@/constants";
import { auth } from "@/auth";
// import { normalizeSearchParamsToArray } from "@/utils";

export const dynamic = "force-dynamic";

export default async function ContactsPage(props: {
  params: Promise<{}>;
  searchParams: Promise<{
    search: string;
    leadStatus: string | string[];
    sortColumn: string;
    sortOrder: string;
    page: number;
    limit: number;
  }>;
}) {
  const searchParams = await props.searchParams;
  // const leadStatusNormalized = normalizeSearchParamsToArray(
  //   searchParams.leadStatus
  // );

  // if (!searchParams.search) {
  //   revalidatePageByPath("/contacts");
  // }

  const contacts = await getContacts({
    limit: CONTACTS_TOTAL_PAGE_SIZE,
    // leadStatus: [],
    // add leadstatus array except for pipe and sold author
    leadStatus: [
      "new",
      "no_answer",
      "not_in_service",
      "wrong_number",
      // "do_not_call",
      "hung_up",
      "call_back",
      "not_interested",
      "refund",
      "contacts"
    ],
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
              ? ` (${contacts.totalCount} total result assigned to you)`
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
        />
      </div>
    </ContentLayout>
  );
}
