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
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default async function AccountPage() {
  const session = await auth();

  // Check if the user is authenticated
  if (!session) {
    redirect("/api/auth/signin");
  }

  const { user } = session;

  return (
    <ContentLayout title="Account">
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
            <BreadcrumbPage>Account</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Account Information Card */}
      <Card className="max-w-lg mx-auto mt-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <Avatar className="w-16 h-16">
              {user?.image ? (
                <AvatarImage src={user.image} alt={`${user.name}'s profile`} />
              ) : (
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold">
                {user?.name || "User"}
              </CardTitle>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Information */}
          <div className="text-sm">
            <p className="font-medium">Email:</p>
            <p>{user?.email}</p>
          </div>
          {/* Edit Button */}
          <Button variant="default" className="w-full">
            Edit Profile
          </Button>
        </CardContent>
      </Card>
    </ContentLayout>
  );
}
