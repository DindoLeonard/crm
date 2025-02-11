"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { deleteAllContacts } from "@/features/contacts/data-access/contacts";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useFormStatus } from "react-dom";

type FormStatusButtonProps = {
  pendingText: string;
  buttonText: string;
  pendingButtonProps?: ButtonProps;
  submitButtonProps?: ButtonProps;
  onSubmitClick?: () => void;
};

export function FormStatusButton({
  pendingText,
  buttonText,
  pendingButtonProps,
  submitButtonProps,
  onSubmitClick
}: FormStatusButtonProps) {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <Button disabled {...pendingButtonProps}>
        {pendingText}
      </Button>
    );
  }

  return (
    <>
      <Button type="submit" {...submitButtonProps} onClick={onSubmitClick}>
        {buttonText}
      </Button>
    </>
  );
}
