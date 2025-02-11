import {
  getGroupById,
  getGroupsUsersByGroupId
} from "@/features/groups/data-access/groups";
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
import { useSession } from "next-auth/react";
import { auth } from "@/auth";
import { UserInfoCard } from "@/features/users/components/user-info-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserTable } from "@/features/groups/components/user-table";
import { getUsers } from "@/features/users/data-access/users";

export default async function GroupsMembersPage(props: {
  params: Promise<{ groupId: string }>;
}) {
  const params = await props.params;
  const members = await getGroupsUsersByGroupId(params.groupId);

  const group = await getGroupById(params.groupId);

  const userResult = await getUsers({});

  const membersIds: { [key: string]: boolean } = {};

  members.forEach((member) => {
    membersIds[member.id] = true;
  });

  const usersNotInGroup = userResult?.results.filter(
    (user) => !membersIds[user.id]
  );

  return (
    <ContentLayout title="Members">
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
                {group?.groupName || "--"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              members {`(${members?.length} total members)`}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Separator className="my-3" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <UserInfoCard
            user={member}
            key={member.id}
            overrideViewContactLink={`/imprints/groups/${params.groupId}/members/${member.id}`}
          />
        ))}
      </div>
      {/* <CreateOrUpdateGroupForm groupData={group} type="update" /> */}
      <Separator className="my-3" />
      <p>Group Members</p>
      <UserTable users={members} groupId={params.groupId} hasRemoveFn />
      <Separator className="my-3" />
      <p>dndo-crm Users</p>
      <UserTable users={usersNotInGroup} groupId={params.groupId} hasAssignFn />
    </ContentLayout>
  );
}
