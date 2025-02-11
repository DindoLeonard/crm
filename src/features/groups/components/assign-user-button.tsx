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
import { SelectGroups, SelectUser } from "@/models";
import { UsersDropdown } from "./user-dropdown";
import { assignContactsToUsersFormAction } from "@/features/contacts/data-access/contacts";

type AssignButtonProps = {
  contactIds?: string[];
  groupId?: string;
  onUserAssign?: () => void;
};

export function AssignUserButton({
  contactIds = [],
  groupId,
  onUserAssign
}: AssignButtonProps) {
  const [openGroupSelectModal, setOpenGroupSelectModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SelectUser | null>(null);

  const [formState, formAction] = useActionState(
    assignContactsToUsersFormAction,
    { status: "idle", message: "" }
  );

  useEffect(() => {
    if (formState.status === "success") {
      toast.success(`Successfully added contacts to "${selectedUser?.name}"`);
      setOpenGroupSelectModal(false);
      onUserAssign?.();
    }
  }, [formState, onUserAssign, selectedUser]);

  function setSelectedUserFn(user: SelectUser | null | undefined) {
    if (user) {
      setSelectedUser(user);
    }
  }

  return (
    <>
      <Dialog
        open={openGroupSelectModal}
        onOpenChange={(status) => {
          setOpenGroupSelectModal(status);
        }}
      >
        <DialogTrigger asChild>
          <Button variant={"secondary"}>Assign User</Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px]"
          style={{
            top: "10%", // Adjust this value as needed
            transform: "translate(-50%, 0)"
          }}
        >
          <DialogHeader>
            <DialogTitle>Assign to a user</DialogTitle>
            <DialogDescription>Select a user</DialogDescription>
          </DialogHeader>
          <form action={formAction} onSubmit={() => {}}>
            <UsersDropdown
              selectedUserId={selectedUser?.id}
              setSelectedUser={setSelectedUserFn}
              groupId={groupId}
            />
            <div className="my-3"></div>
            <input
              hidden
              name="contactIds"
              value={JSON.stringify(contactIds)}
              readOnly
            />
            <DialogFooter>
              <div
                onChange={(e) => {
                  e.stopPropagation();
                }}
              >
                <FormStatusButton
                  buttonText="Save Changes"
                  pendingText="Saving..."
                />
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
