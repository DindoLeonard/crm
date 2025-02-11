import { getGroupById } from "@/features/groups/data-access/groups";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { CreateOrUpdateGroupForm } from "@/features/groups/components/create-or-update-group-form";
// import { useSession } from "next-auth/react";
// import { auth } from "@/auth";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function GroupsPage(
  props: {
    params: Promise<{ groupId: string }>;
  }
) {
  const params = await props.params;
  const group = await getGroupById(params.groupId);

  return (
    <ContentLayout title="Groups">
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
            <BreadcrumbPage>{group?.groupName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <CreateOrUpdateGroupForm groupData={group} type="update" />

      <div>
        <Separator className="my-3" />

        <Card key={group.groupName} className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>{group?.groupName}</CardTitle>
            <CardDescription>{group?.description}</CardDescription>
          </CardHeader>
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
      </div>
    </ContentLayout>
  );
}
