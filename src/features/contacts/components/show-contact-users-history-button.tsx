"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { SelectUser } from "@/models";
import { formatDateTimeToLocale } from "@/utils";
import { useEffect, useState } from "react";

export function ShowContactUsersHistoryButton({
  contactId
}: {
  contactId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<SelectUser[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async (contactIdString: string) => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/contacts/contact-history/${contactIdString}`,
          { signal: abortController.signal }
        );
        const { users } = await response.json();
        setData(users);
      } catch (err) {
        console.log("err", err);
      } finally {
        setLoading(false);
      }
    };

    if (contactId) {
      fetchData(contactId);
    }

    return () => {
      abortController.abort("cancelled fetching contact history");
    };
  }, []);

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
        }}
      >
        <DialogTrigger className="flex justify-center">
          <div
            // type="button"
            className="w-full my-2 underline cursor-pointer text-primary"
            // variant={"link"}
            onClick={() => {
              // console.log("Show contact history clicked");
            }}
          >
            Show Users Assigned History
          </div>
        </DialogTrigger>
        <DialogContent
          className="max-h-[96vh] overflow-y-auto"
          onSubmit={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div>
            <div>
              <DialogHeader>
                <DialogTitle>User History</DialogTitle>

                <DialogDescription>
                  History of users who have interacted with this contact
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          {loading && <div>Loading...</div>}

          {!loading && data?.length === 0 && <div>No data</div>}

          {!loading && data && data?.length > 0 && (
            <>
              <div className="w-full">
                {data?.map((user) => (
                  <div key={user.id}>
                    <p>{user.name}</p>
                    {user.createdAt && (
                      <p>{formatDateTimeToLocale(new Date(user.createdAt))}</p>
                    )}
                    <Separator orientation="horizontal" />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* <div>{JSON.stringify(data, null, 3)}</div> */}
        </DialogContent>
      </Dialog>
    </>
  );
}
