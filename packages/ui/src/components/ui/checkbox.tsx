import * as React from "react";
import { CheckIcon } from "lucide-react";

import { cn } from "@repo/ui/utils";

interface CheckboxProps extends Omit<React.ComponentProps<"input">, "type"> {
  onCheckedChange?: (checked: boolean) => void;
}

function Checkbox({
  className,
  checked,
  onCheckedChange,
  onChange,
  ...props
}: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    onCheckedChange?.(isChecked);
    onChange?.(e);
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        data-slot="checkbox"
        checked={checked}
        onChange={handleChange}
        className={cn(
          "peer size-4 shrink-0 rounded-none border border-gray-300 bg-white transition-colors",
          "hover:border-gray-400",
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none",
          "checked:bg-blue-600 checked:border-blue-600",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "sr-only", // Hide default checkbox
          className,
        )}
        {...props}
      />
      <div
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-none border border-gray-300 bg-white transition-colors",
          "peer-hover:border-gray-400",
          "peer-focus:border-blue-500 peer-focus:ring-2 peer-focus:ring-blue-500/20",
          "peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-white",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        )}
      >
        <CheckIcon
          className={cn(
            "size-3 transition-opacity",
            checked ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </div>
  );
}

export { Checkbox };
