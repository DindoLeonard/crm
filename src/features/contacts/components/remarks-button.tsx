"use client";

import { SquareMenu } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
  // DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SelectContact } from "@/models";
import { updateContactFormAction } from "@/features/contacts/data-access/contacts";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { useActionState, useState } from "react";
import Form from "next/form";

type RemarksButtonProps = {
  contact: Partial<SelectContact>;
};

export function RemarksButtonForm({ contact }: RemarksButtonProps) {
  // const updateContactWithId = updateContactFormAction.bind(
  //   null,
  //   contact?.id || ""
  // );

  //

  const [formState, formAction] = useActionState(updateContactFormAction, {
    success: false,
    message: "",
    error: null
  });

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    >
      <DialogTrigger className="underline w-full flex justify-center">
        <SquareMenu className="text-gray-500" />
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
              <DialogTitle>More details</DialogTitle>

              <DialogDescription>
                Add more details to this contact. This will be visible to all
                users.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <Form action={formAction}>
          <div className="space-y-2">
            <label htmlFor="addRemarks" className="text-sm font-medium">
              Remark
            </label>

            <Textarea
              id="addRemarks"
              name="addRemarks"
              placeholder="Enter new remark (optional)"
              className="w-full h-44"
              // defaultValue={contact.remarks || undefined}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="remarks" className="text-sm font-medium hidden">
              Remarks
            </label>

            <input
              id="contactId"
              name="contactId"
              hidden
              value={contact?.id || ""}
              readOnly
            />

            <Textarea
              id="remarks"
              name="remarks"
              placeholder=""
              className="w-full h-44 hidden"
              defaultValue={contact.remarks || undefined}
              // value={contact.remarks || undefined}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="emailNote" className="text-sm font-medium">
              Email Note
            </label>
            <Textarea
              id="emailNote"
              name="emailNote"
              placeholder="Enter email note (optional)"
              className="w-full"
              defaultValue={contact.emailNote || undefined}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phoneNote" className="text-sm font-medium">
              Phone Note
            </label>
            <Textarea
              id="phoneNote"
              name="phoneNote"
              placeholder="Enter phone note (optional)"
              className="w-full"
              defaultValue={contact.phoneNote || undefined}
            />
          </div>
          <SubmitButton />
          {/* <button type="submit">submit</button> */}
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton({ onClick }: { onClick?: () => void }) {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <Button type="submit" className="w-full mt-4" disabled>
        Updating...
      </Button>
    );
  }
  return (
    <Button type="submit" className="w-full mt-4">
      Save Changes
    </Button>
  );
}
