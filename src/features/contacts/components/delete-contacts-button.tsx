"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { useEffect, useState, useActionState } from "react";
import { FormStatusButton } from "@/components/form-status-button.tsx/form-status-button";
import { toast } from "sonner";
import { deleteContactsFormAction } from "@/features/contacts/data-access/contacts";

type DeleteContactsButtonProps = {
  contactIds?: string[];
  onContactDelete?: () => void;
};

export function DeleteContactsButton({
  contactIds = [],
  onContactDelete
}: DeleteContactsButtonProps) {
  const [openDeleteContactsModal, setOpenGroupSelectModal] = useState(false);
  const [formSubmitClicked, setFormSubmitClicked] = useState(false);

  const [formState, formAction] = useActionState(deleteContactsFormAction, {
    status: "idle",
    message: ""
  });

  useEffect(() => {
    if (formState?.status === "success") {
      toast.success(`Successfully deleted ${contactIds.length} contacts`);
      setOpenGroupSelectModal(false);
      onContactDelete?.();
    }

    return () => {
      setFormSubmitClicked(false);
    };
  }, [
    contactIds.length,
    formState?.status,
    formSubmitClicked,
    onContactDelete
  ]);

  return (
    <>
      <Dialog
        open={openDeleteContactsModal}
        onOpenChange={(status) => {
          setOpenGroupSelectModal(status);
        }}
      >
        <DialogTrigger asChild>
          <Button variant={"secondary"}>{`Delete Contact(s)`}</Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px]"
          style={{
            top: "10%", // Adjust this value as needed
            transform: "translate(-50%, 0)"
          }}
        >
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              Deleting contacts cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">
            Deleting {contactIds.length || 0} {`contact(s)`}
          </p>
          <form action={formAction}>
            <input
              type="hidden"
              name="contactIds"
              value={JSON.stringify(contactIds)}
            />
            <DialogFooter>
              <div
                onChange={(e) => {
                  e.stopPropagation();
                }}
              >
                <FormStatusButton
                  buttonText="Delete"
                  pendingText="Deleting..."
                  submitButtonProps={{ variant: "destructive" }}
                  pendingButtonProps={{ variant: "destructive" }}
                />
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
