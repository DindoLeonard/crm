"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";

export function EditableEmailCell({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [localValue, setLocalValue] = useState<string>(value);

  const handleBlur = () => {
    onChange(localValue);
  };

  return (
    <Input
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      className="lowercase min-w-36"
    />
  );
}
