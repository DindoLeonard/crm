import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeadStatus, leadStatusEnum } from "@/db/schema";
import { useState } from "react";
import { cn } from "@/lib/utils";

type LeadStatusPopoverProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
};

export function getLeadStatusStyles(
  status: string,
  additionalClasses?: string
) {
  const leadStatusStyles: Record<
    string,
    {
      textColor: string;
      bgColor: string;
      hoverTextColor: string;
      hoverBgColor: string;
    }
  > = {
    new: {
      textColor: "text-[#4880FF]",
      bgColor: "bg-[#DAE6FF]",
      hoverTextColor: "hover:text-[#3369CC]",
      hoverBgColor: "hover:bg-[#C9E1FF]"
    },
    contacts: {
      textColor: "text-[#D456FD]",
      bgColor: "bg-[rgba(212,86,253,0.2)]",
      hoverTextColor: "hover:text-[#B33BCF]",
      hoverBgColor: "hover:bg-[rgba(178,59,207,0.2)]"
    },
    sold_author: {
      textColor: "text-[#07E1AA]",
      bgColor: "bg-[rgba(7,225,170,0.2)]",
      hoverTextColor: "hover:text-[#06C593]",
      hoverBgColor: "hover:bg-[rgba(6,197,147,0.2)]"
    },
    pipe: {
      textColor: "text-[#6A30F0]",
      bgColor: "bg-[rgba(106,48,240,0.2)]",
      hoverTextColor: "hover:text-[#5828C4]",
      hoverBgColor: "hover:bg-[rgba(88,40,196,0.2)]"
    },
    charge_back: {
      textColor: "text-[#FF7B00]",
      bgColor: "bg-[rgba(255,123,0,0.2)]",
      hoverTextColor: "hover:text-[#E06900]",
      hoverBgColor: "hover:bg-[rgba(224,105,0,0.2)]"
    },
    refund: {
      textColor: "text-[#DC3545]",
      bgColor: "bg-[rgba(220,53,69,0.2)]",
      hoverTextColor: "hover:text-[#C22F3C]",
      hoverBgColor: "hover:bg-[rgba(194,47,60,0.2)]"
    },
    do_not_call: {
      textColor: "text-[#DC6735]",
      bgColor: "bg-[rgba(220,103,53,0.2)]",
      hoverTextColor: "hover:text-[#B5532A]",
      hoverBgColor: "hover:bg-[rgba(181,83,42,0.2)]"
    },
    wrong_number: {
      textColor: "text-[#62636C]",
      bgColor: "bg-[rgba(98,99,108,0.2)]",
      hoverTextColor: "hover:text-[#4E4F58]",
      hoverBgColor: "hover:bg-[rgba(78,79,88,0.2)]"
    },
    no_answer: {
      textColor: "text-[#62636C]",
      bgColor: "bg-[rgba(98,99,108,0.2)]",
      hoverTextColor: "hover:text-[#4E4F58]",
      hoverBgColor: "hover:bg-[rgba(78,79,88,0.2)]"
    },
    not_interested: {
      textColor: "text-[#62636C]",
      bgColor: "bg-[rgba(98,99,108,0.2)]",
      hoverTextColor: "hover:text-[#4E4F58]",
      hoverBgColor: "hover:bg-[rgba(78,79,88,0.2)]"
    },
    hung_up: {
      textColor: "text-[#62636C]",
      bgColor: "bg-[rgba(98,99,108,0.2)]",
      hoverTextColor: "hover:text-[#4E4F58]",
      hoverBgColor: "hover:bg-[rgba(78,79,88,0.2)]"
    }
  };

  const { textColor, bgColor, hoverTextColor, hoverBgColor } = leadStatusStyles[
    status
  ] || {
    textColor: "text-gray-500",
    bgColor: "bg-gray-200",
    hoverTextColor: "hover:text-gray-400",
    hoverBgColor: "hover:bg-gray-300"
  };

  return cn(
    textColor,
    bgColor,
    hoverTextColor,
    hoverBgColor,
    additionalClasses
  );
}

export function LeadStatusPopover({
  value,
  defaultValue,
  onValueChange,
  name
}: LeadStatusPopoverProps) {
  const [open, setOpen] = useState<boolean>(false);

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

  // Helper function to add spaces to CamelCase
  const toSentenceCase = (str: string) =>
    str.replace(/([a-z])([A-Z])/g, "$1 $2");

  const desiredOrder: LeadStatus[] = [
    LeadStatus.New,
    LeadStatus.Contacts,
    LeadStatus.SoldAuthor,
    LeadStatus.ChargeBack,
    LeadStatus.Refund,
    LeadStatus.Pipe,
    LeadStatus.DoNotCall,
    LeadStatus.WrongNumber,
    LeadStatus.NoAnswer,
    LeadStatus.NotInterested,
    LeadStatus.HungUp,
    LeadStatus.CallBack,
    LeadStatus.NotInService
  ];

  // Creating an object with enum values as keys and formatted keys as values
  const leadStatusObject = Object.entries(LeadStatus).reduce(
    (obj, [key, value]) => {
      obj[value] = toSentenceCase(key); // Format the key with spaces
      return obj;
    },
    {} as Record<LeadStatus, string>
  );

  const orderedLeadStatusObject = desiredOrder.reduce((obj, key) => {
    if (leadStatusObject[key]) {
      obj[key] = leadStatusObject[key];
    }
    return obj;
  }, {} as Record<LeadStatus, string>);

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
      }}
    >
      <PopoverTrigger asChild>
        {value && (
          <Button
            variant="outline"
            className={getLeadStatusStyles(value, "w-full")}
          >
            {leadStatusObject[value as keyof typeof leadStatusObject]}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div>
          <div>
            <p className="font-semibold text-lg">Status</p>
          </div>

          <div className="flex flex-wrap">
            {Object.keys(orderedLeadStatusObject).map((status, i) => {
              return (
                <Button
                  key={`${status}-${i}`}
                  onClick={() => {
                    setOpen(false);
                    onValueChange && onValueChange(status);
                  }}
                  variant="outline"
                  className={getLeadStatusStyles(status, "h-7 my-1 mx-1")}
                  type="button"
                >
                  {leadStatusObject[status as keyof typeof leadStatusObject]}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
