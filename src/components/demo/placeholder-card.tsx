import Link from "next/link";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { PropsWithChildren } from "react";

export default function PlaceHolderCard({ children }: PropsWithChildren) {
  return (
    <Card className="rounded-lg border-none mt-6">
      <CardContent className="py-1 px-2">
        <div className="flex flex-col relative">{children}</div>
      </CardContent>
    </Card>
  );
}
