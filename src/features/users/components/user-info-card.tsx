import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SelectUser } from "@/models";
import { getInitials } from "@/utils";

type UserInfoCardProps = {
  user: Partial<SelectUser>;
  overrideViewContactLink?: string;
};

export function UserInfoCard({
  user,
  overrideViewContactLink
}: UserInfoCardProps) {
  return (
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
            <AvatarFallback>{getInitials(user.name || "--")}</AvatarFallback>
          )}
        </Avatar>
        <CardTitle>{user?.name}</CardTitle>
        <CardDescription>{user?.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={`/users/${user.id}`}>
          <Button variant="link" className="mt-2">
            User info
          </Button>
        </Link>
        <Link href={overrideViewContactLink || `/users/${user.id}/contacts`}>
          <Button variant="link" className="mt-2">
            User contacts
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
