import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

type LeadStatusDopdownProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
};

export function LeadStatusDopdown({
  value,
  defaultValue,
  onValueChange,
  name
}: LeadStatusDopdownProps) {
  // export const leadStatusEnum = pgEnum("lead_status_enum", [
  //   "new",
  //   "no_answer",
  //   "not_in_service",
  //   "wrong_number",
  //   "do_not_call",
  //   "hung_up",
  //   "call_back",
  //   "not_interested",
  //   "pipe",
  //   "sold_author",
  //   "refund",
  //   "contacts"
  // ]);

  // DNC (Do Not Call)
  // NA (No Answer)
  // WN (Wrong Number)
  // NIS (Not In Service)
  // HU (Hung Up)
  // NI (Not Interested)
  // CB (Callback)
  // PI (Pipe)
  // SA (Sold Author)
  // RF (Refund)
  // CB (Chargeback)
  // C (Contacts)

  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
    >
      <SelectTrigger className="w-full capitalize">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="no_answer">NA</SelectItem>
          <SelectItem value="not_in_service">NIS</SelectItem>
          <SelectItem value="wrong_number">WN</SelectItem>
          <SelectItem value="do_not_call">DNC</SelectItem>
          <SelectItem value="hung_up">HU</SelectItem>
          <SelectItem value="call_back">CB</SelectItem>
          <SelectItem value="charge_back">CHBK</SelectItem>
          <SelectItem value="not_interested">NI</SelectItem>
          <SelectItem value="pipe">PI</SelectItem>
          <SelectItem value="sold_author">SA</SelectItem>
          <SelectItem value="refund">RF</SelectItem>
          <SelectItem value="contacts">C</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
