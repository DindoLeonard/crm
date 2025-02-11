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
import { getUserById } from "@/features/users/data-access/users";
import { CreateOrUpdateUserForm } from "@/features/users/components/create-or-update-user-info";
import { UserInfoCard } from "@/features/users/components/user-info-card";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils";
import { Button } from "@/components/ui/button";

export default async function GroupsPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const user = await getUserById(params.id);

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
            <Link href="/users">Users</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{user.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <CreateOrUpdateUserForm userData={user} type="update" />
      </div>
      <div>
        <Separator className="my-3" />
        <Card key={user.email} className="hover:shadow-lg transition">
          <CardHeader>
            <Avatar className="w-16 h-16">
              {user?.image ? (
                <AvatarImage
                  src={user.image}
                  alt={`${user.name}'s profile picture`}
                  className="rounded-full object-cover"
                />
              ) : (
                <AvatarFallback>
                  {getInitials(user.name || "--")}
                </AvatarFallback>
              )}
            </Avatar>
            <CardTitle>{user?.name}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/users/${user.id}/contacts`}>
              <Button variant="link" className="mt-2">
                User contacts
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
