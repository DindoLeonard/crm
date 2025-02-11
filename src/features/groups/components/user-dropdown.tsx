"use client";

import { SelectUser } from "@/models";
import { useEffect, useState } from "react";

type UsersDropdownProps = {
  setSelectedUser: (user?: SelectUser | null | undefined) => void;
  selectedUserId: string | undefined;
  groupId?: string;
};

export function UsersDropdown({
  setSelectedUser,
  selectedUserId,
  groupId
}: UsersDropdownProps) {
  const [users, setUsers] = useState<{
    results: SelectUser[];
    totalCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const baseUrl = `${window.location.origin}/api/users`;
        const params: { groupId?: string } = {};
        if (groupId) {
          params["groupId"] = groupId;
        }

        // Create a URL object
        const url = new URL(baseUrl);

        // Append query parameters
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });

        console.log("URL", url.toString());

        const usersResponse = await fetch(url.toString(), {
          headers: {
            "Content-Type": "application/json"
          },
          cache: "no-store"
        });
        const usersData = await usersResponse.json();
        setUsers(usersData);
        if (usersData.results.length > 0) {
          setSelectedUser(usersData.results[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = users?.results.find(
      (user) => user.id === event.target.value
    );
    setSelectedUser(selectedUser);
  };

  return (
    <div className="flex flex-col items-start space-y-2">
      <label htmlFor="group-select" className="text-gray-700 font-medium">
        Select a User
      </label>
      {loading ? (
        <p className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 w-full text-gray-500">
          Loading...
        </p>
      ) : (
        <select
          id="user-select"
          value={selectedUserId}
          onChange={handleSelectChange}
          name="userId"
          className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-primary-90 focus:ring-2 focus:ring-primary w-full"
        >
          <option value="" disabled className="py-2">
            Select a user
          </option>
          {users?.results.map((user) => (
            <option key={user.id} value={user.id} className="py-2">
              {user.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
