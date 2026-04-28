import React from "react";
import { Checkbox } from "@repo/ui-admin";

interface Option {
  value: string;
  label: string;
}

interface BoardDisplayOptionsSelectorProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (newSelected: string[]) => void;
}

export function BoardDisplayOptionsSelector({
  label,
  options,
  selected,
  onChange,
}: BoardDisplayOptionsSelectorProps) {
  const handleToggle = (value: string) => {
    let newSelected = [...selected];
    if (newSelected.includes(value)) {
      newSelected = newSelected.filter((v) => v !== value);
    } else {
      newSelected.push(value);
    }
    onChange(newSelected);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={selected.includes(option.value)}
              onCheckedChange={() => handleToggle(option.value)}
            />
            <span className="text-sm text-gray-600">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
