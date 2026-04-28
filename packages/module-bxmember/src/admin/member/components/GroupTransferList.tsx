import React, { useState } from 'react';
import { Button, Label } from "@repo/ui-admin";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface GroupTransferListProps {
  groups: string[];
  selectedGroups: string[];
  setSelectedGroups: (value: string[]) => void;
}

export function GroupTransferList({
  groups,
  selectedGroups,
  setSelectedGroups,
}: GroupTransferListProps) {
  const [leftSelection, setLeftSelection] = useState<string[]>([]);
  const [rightSelection, setRightSelection] = useState<string[]>([]);

  // Filter available groups (exclude already selected)
  const availableGroups = groups.filter(g => !selectedGroups.includes(g));

  const handleLeftSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setLeftSelection(selected);
  };

  const handleRightSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setRightSelection(selected);
  };

  const moveToRight = () => {
    if (leftSelection.length === 0) return;
    setSelectedGroups([...selectedGroups, ...leftSelection]);
    setLeftSelection([]); // Clear selection after move
  };

  const moveToLeft = () => {
    if (rightSelection.length === 0) return;
    setSelectedGroups(selectedGroups.filter(g => !rightSelection.includes(g)));
    setRightSelection([]); // Clear selection after move
  };

  const moveAllToRight = () => {
    if (availableGroups.length === 0) return;
    setSelectedGroups([...selectedGroups, ...availableGroups]);
    setLeftSelection([]);
  };

  const moveAllToLeft = () => {
    if (selectedGroups.length === 0) return;
    setSelectedGroups([]);
    setRightSelection([]);
  };

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 h-[400px] items-start">
      {/* Left List: Available */}
      <div className="flex flex-col h-full space-y-2">
        <Label>전체 그룹 ({availableGroups.length})</Label>
        <select
          multiple
          className="flex-1 w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none overflow-y-auto"
          value={leftSelection}
          onChange={handleLeftSelect}
        >
          {availableGroups.map(group => (
            <option key={group} value={group} className="py-1 px-2 cursor-pointer hover:bg-gray-100">
              {group}
            </option>
          ))}
        </select>
        <div className="text-xs text-gray-500">
           Shift/Ctrl(Cmd) + 클릭으로 다중 선택 가능
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col justify-center gap-2 h-full pt-6">
         <Button variant="outline" size="icon" onClick={moveAllToRight} title="전체 추가">
          <span className="text-xs font-bold">ALL &gt;</span>
        </Button>
        <Button variant="outline" size="icon" onClick={moveToRight} disabled={leftSelection.length === 0} title="선택 추가">
          <ArrowRight size={16} />
        </Button>
        <Button variant="outline" size="icon" onClick={moveToLeft} disabled={rightSelection.length === 0} title="선택 제거">
          <ArrowLeft size={16} />
        </Button>
        <Button variant="outline" size="icon" onClick={moveAllToLeft} title="전체 제거">
          <span className="text-xs font-bold">&lt; ALL</span>
        </Button>
      </div>

      {/* Right List: Selected */}
      <div className="flex flex-col h-full space-y-2">
        <Label>선택된 그룹 ({selectedGroups.length})</Label>
        <select
          multiple
          className="flex-1 w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none overflow-y-auto bg-indigo-50"
          value={rightSelection}
          onChange={handleRightSelect}
        >
          {selectedGroups.map(group => (
            <option key={group} value={group} className="py-1 px-2 cursor-pointer hover:bg-indigo-100">
              {group}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
