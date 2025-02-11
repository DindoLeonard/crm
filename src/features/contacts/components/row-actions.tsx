"use client";

import { useActionState, useState } from "react";
import { MoreHorizontal, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  // DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
  // SheetTrigger
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectContact } from "@/models";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateContactFormAction } from "@/features/contacts/data-access/contacts";
import { useFormStatus } from "react-dom";
import { LeadStatusDopdown } from "./lead-status-select-dropdown";
import { ShowContactUsersHistoryButton } from "./show-contact-users-history-button";

type RowActionsProps = {
  contact: Partial<SelectContact>;
};

export function RowActions({ contact }: RowActionsProps) {
  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);

  const [formState, formAction] = useActionState(updateContactFormAction, {
    success: false,
    message: "",
    error: null
  });

  return (
    <>
      {/* <DropdownMenu
        open={dropdownIsOpen}
        onOpenChange={(open) => {
          setDropdownIsOpen(open);
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            type="button"
            onClick={() => setDropdownIsOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
      {/* <DropdownMenuItem
          // onClick={() => navigator.clipboard.writeText(payment.id as string)}
          >
            Copy Customer ID
          </DropdownMenuItem> */}
      {/* <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setSheetIsOpen(true);
              setDropdownIsOpen(false); // Close dropdown when opening sheet
            }}
          >
            View customer
          </DropdownMenuItem> */}

      {/* <DropdownMenuItem> */}
      {/* <DialogTrigger>Edit notes</DialogTrigger> */}
      {/* </DropdownMenuItem> */}
      {/* <DropdownMenuItem>View payment details</DropdownMenuItem> */}
      {/* </DropdownMenuContent>
      </DropdownMenu> */}

      <div className="w-full flex justify-center">
        <EyeIcon
          onClick={() => {
            setSheetIsOpen(true);
            setDropdownIsOpen(false);
          }}
          className="text-gray-500 cursor-pointer"
        />
      </div>

      <Sheet
        open={sheetIsOpen}
        onOpenChange={(open) => {
          setSheetIsOpen(open);
        }}
      >
        {/* <SheetTrigger onClick={() => toggleSheet()} className="hidden">
          Open
        </SheetTrigger> */}
        <SheetContent className="w-[90vw] lg:min-w-[40vw]">
          <ScrollArea className="h-[100vh] px-[-1] pb-6">
            <SheetHeader>
              <SheetTitle>Customer Details</SheetTitle>
              <SheetDescription>
                View customer information and payment details
              </SheetDescription>
            </SheetHeader>
            <div
              className="my-2 p-1"
              onSubmit={(e) => {
                e.stopPropagation();
                setSheetIsOpen(false);
                // e.preventDefault();
              }}
            >
              <form action={formAction}>
                <input
                  id="contactId"
                  name="contactId"
                  hidden
                  value={contact?.id || ""}
                  readOnly
                />
                <div className="py-2 w-1/2">
                  <Label htmlFor="leadStatus">Lead Status</Label>
                  <LeadStatusDopdown
                    defaultValue={contact.leadStatus || undefined}
                    name={"leadStatus"}
                  />
                </div>

                {contact?.id && (
                  <ShowContactUsersHistoryButton contactId={contact.id} />
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    defaultValue={contact.email || undefined}
                  />
                </div>

                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    defaultValue={contact.name || undefined}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    defaultValue={contact?.phone || undefined}
                  />
                </div>

                <div>
                  <Label htmlFor="bookTitle">Book Title</Label>
                  <Input
                    id="bookTitle"
                    name="bookTitle"
                    type="text"
                    required
                    defaultValue={contact?.bookTitle || undefined}
                  />
                </div>

                <div>
                  <Label htmlFor="emailNote">Email Note</Label>
                  <Textarea
                    id="emailNote"
                    name="emailNote"
                    rows={3}
                    defaultValue={contact?.emailNote || undefined}
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNote">Phone Note</Label>
                  <Textarea
                    id="phoneNote"
                    name="phoneNote"
                    rows={3}
                    defaultValue={contact?.phoneNote || undefined}
                  />
                </div>

                <div>
                  <Label htmlFor="remarks">Remarks History</Label>
                  <Textarea
                    id="remarks"
                    name="remarks"
                    className="w-full h-44"
                    defaultValue={contact?.remarks || undefined}
                    disabled
                  />
                </div>

                {/* <div>
                  <Label htmlFor="lastDateOfContact">
                    Last Date of Contact
                  </Label>
                  <Input
                    id="lastDateOfContact"
                    name="lastDateOfContact"
                    type="date"
                  />
                </div> */}

                {/* <Button type="submit" className="w-full mt-4">
                  Save Contact
                </Button> */}
                <SaveContactButton />
              </form>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

function SaveContactButton() {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <Button disabled type="submit" className="w-full mt-4">
        Updating....
      </Button>
    );
  }

  return (
    <Button type="submit" className="w-full mt-4">
      Save Contact
    </Button>
  );
}
