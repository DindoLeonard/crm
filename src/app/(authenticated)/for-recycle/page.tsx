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
  getContactsByUser,
  getContactsForRecycle
} from "@/features/contacts/data-access/contacts";
import { CONTACTS_TOTAL_PAGE_SIZE } from "@/constants";
import { auth } from "@/auth";
import { ContactsDataTable } from "@/features/contacts/components/crm-table-modified";
import { ContactsDataTableForRecycle } from "@/features/contacts/components/crm-table-recycle";
// import { normalizeSearchParamsToArray } from "@/utils";

export const dynamic = "force-dynamic";

export default async function ForRecyclePage(
  props: {
    params: Promise<{}>;
    searchParams: Promise<{
      search: string;
      leadStatus: string | string[];
      sortColumn: string;
      sortOrder: string;
      page: number;
      limit: number;
      days: number;
      daysOrder: "lessThan" | "moreThan" | (string & {});
    }>;
  }
) {
  const searchParams = await props.searchParams;
  // const leadStatusNormalized = normalizeSearchParamsToArray(
  //   searchParams.leadStatus
  // );

  // if (!searchParams.search) {
  //   revalidatePageByPath("/contacts");
  // }

  const contacts = await getContactsForRecycle({
    limit: CONTACTS_TOTAL_PAGE_SIZE,
    // leadStatus: [],
    // add leadstatus array except for pipe and sold author
    leadStatus: [
      "not_in_service",
      "no_answer",
      "wrong_number",
      "hung_up",
      "not_interested"
    ],
    page: searchParams.page,
    search: searchParams.search,
    allowedRoles: ["admin"],
    days: searchParams.days ? Number(searchParams.days) : 0,
    daysOrder: searchParams.daysOrder
  });

  return (
    <ContentLayout title="For Recycle">
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
            <BreadcrumbPage>For Recycle</BreadcrumbPage>
            {contacts?.totalCount
              ? ` (${contacts.totalCount} total contact)`
              : ""}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-2">
        <ContactsDataTableForRecycle
          contacts={contacts?.results || []}
          totalCount={contacts?.totalCount || 0}
          page={searchParams?.page}
          search={searchParams?.search}
          role="admin"
        />
      </div>
    </ContentLayout>
  );
}
