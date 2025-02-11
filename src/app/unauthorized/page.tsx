// app/unauthorized/page.tsx

import { Button } from "@/components/ui/button"; // Assuming you're using shadcn's Button component
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

export default function UnauthorizedPage() {
  return (
    <ContentLayout title="Not allowed">
      {/* <Breadcrumb>
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
            <BreadcrumbPage>Posts</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb> */}
      {/* <PlaceholderContent /> */}
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4">Unauthorized</h1>
        <p className="text-lg mb-8">
          You do not have permission to access this page.
        </p>
        <Link href="/dashboard">
          <Button variant="outline">Go Back to Home</Button>
        </Link>
      </div>
    </ContentLayout>
  );
}

// export default function UnauthorizedPage() {
//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
//       <h1 className="text-4xl font-bold mb-4">Unauthorized</h1>
//       <p className="text-lg mb-8">
//         You do not have permission to access this page.
//       </p>
//       <Link href="/">
//         <Button variant="outline">Go Back to Home</Button>
//       </Link>
//     </div>
//   );
// }
