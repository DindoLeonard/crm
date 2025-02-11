"use client";

import { SelectGroups } from "@/models";
import { useEffect, useState } from "react";

type GroupDropdownProps = {
  setSelectedGroup: (group?: SelectGroups | null | undefined) => void;
  selectedGroupId: string | undefined;
};

export function GroupDropdown({
  setSelectedGroup,
  selectedGroupId
}: GroupDropdownProps) {
  const [groups, setGroups] = useState<{
    results: SelectGroups[];
    totalCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const groupsResponse = await fetch("/api/groups", {
          headers: {
            "Content-Type": "application/json"
          },
          cache: "no-store"
        });
        const groupsData = await groupsResponse.json();
        setGroups(groupsData);
        if (groupsData.results.length > 0) {
          setSelectedGroup(groupsData.results[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGroup = groups?.results.find(
      (group) => group.id === event.target.value
    );
    setSelectedGroup(selectedGroup);
  };

  return (
    <div className="flex flex-col items-start space-y-2">
      <label htmlFor="group-select" className="text-gray-700 font-medium">
        Select a Group
      </label>
      {loading ? (
        <p className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 w-full text-gray-500">
          Loading...
        </p>
      ) : (
        <select
          id="group-select"
          value={selectedGroupId}
          onChange={handleSelectChange}
          name="groupId"
          className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 w-full"
        >
          <option value="" disabled className="py-2">
            Select a group
          </option>
          {groups?.results.map((group) => (
            <option key={group.id} value={group.id} className="py-2">
              {group.groupName}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
