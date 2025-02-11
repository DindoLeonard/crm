"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function PaginationIndicator({
  page,
  totalPages
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);

  function handlePageSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // get form value
    const form = e.currentTarget;
    const formData = new FormData(form);
    const pageNumber = Number(formData.get("page-number"));

    // validate form value
    if (pageNumber < 1 || pageNumber > totalPages) {
      return;
    }

    // update page
    const params = new URLSearchParams(searchParams);
    params.set("page", String(pageNumber));
    router.replace(`${pathname}?${params.toString()}`);

    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(onOpenChangeVal) => {
        console.log(onOpenChangeVal);
        setOpen(onOpenChangeVal);
      }}
    >
      <DialogTrigger
        className="rounded border min-w-12 text-center"
        type="button"
      >
        {/* <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setOpen(true);
          }}
        > */}
        <div className="text-sm">
          <span>{totalPages === 0 ? 0 : page}</span>
          <span>/</span>
          <span>{totalPages}</span>
        </div>
        {/* </Button> */}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Jump to page</DialogTitle>
          <form onSubmit={handlePageSubmit}>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                up to {totalPages} pages
              </label>
              <Input
                id="page-number-input"
                type="number"
                name="page-number"
                className="text-right"
                placeholder={page.toString()}
              />

              <Button type="submit" variant="outline" className="w-full">
                Go
              </Button>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
