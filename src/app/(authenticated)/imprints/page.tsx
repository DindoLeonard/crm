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
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getGroups } from "@/features/groups/data-access/groups";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export default async function ImprintsPage() {
  // const session = await auth();

  // console.log("session", session);

  // if (!session) {
  //   redirect("/api/auth/signin");
  // }

  const groups = await getGroups({});

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
          {/* <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/example">Imprints</Link>
            </BreadcrumbLink>
          </BreadcrumbItem> */}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="my-2">
        <Link href={`/imprints/new`}>
          <Button type="button">Add New Group</Button>
        </Link>
      </div>
      <hr className="my-5" />
      {/* <PlaceholderContent /> */}
      {/* Groups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups?.results.map((group) => (
          <Card key={group.groupName} className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{group?.groupName}</CardTitle>
              <CardDescription>{group?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/imprints/groups/${group.id}`}>
                <Button variant="link" type="button">
                  Group Info
                </Button>
              </Link>
            </CardContent>
            <CardContent>
              <Link href={`/imprints/groups/${group.id}/contacts`}>
                <Button variant="link" type="button">
                  Group Contacts
                </Button>
              </Link>
            </CardContent>
            <CardContent>
              <Link href={`/imprints/groups/${group.id}/members`}>
                <Button variant="link" type="button">
                  Group Members
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </ContentLayout>
  );
}
