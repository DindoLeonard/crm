"use client";

import { Button } from "@/components/ui/button";
import { deleteAllContacts } from "@/features/contacts/data-access/contacts";
import { useFormStatus } from "react-dom";

export function DeleteAllContactsButton() {
  const { pending } = useFormStatus();

  if (pending) {
    return <Button disabled>Deleting Contacts..</Button>;
  }

  return (
    <>
      <Button type="submit">Delete All Contacts</Button>
    </>
  );
}
