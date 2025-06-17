import React, { useState } from "react";
import { useUpdatePersonSite, useDeletePerson } from "../hooks/useQueries";

interface PersonCardProps {
  personId: string;
  site: string;
  updatedAt: string | null;
  siteOptions: string[];
  onSiteChange: (newSite: string) => Promise<void>;
  saving?: boolean;
  disableDelete?: boolean;
}

function isToday(dateString: string | null) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function PersonCard({
  personId,
  site,
  updatedAt,
  siteOptions,
  onSiteChange,
  saving = false,
  disableDelete = false,
}: PersonCardProps) {
  const [selected, setSelected] = useState(site);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const updatePersonSiteMutation = useUpdatePersonSite();
  const deletePersonMutation = useDeletePerson();

  const handleSiteChange = async (newSite: string) => {
    setSelected(newSite);
    await updatePersonSiteMutation.mutateAsync({
      personId,
      currentSite: newSite,
    });
  };

  const handleDelete = async () => {
    try {
      await deletePersonMutation.mutateAsync(personId);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete person:", error);
    }
  };

  const dotColor = isToday(updatedAt) ? "bg-green-500" : "bg-red-500";

  return (
    <>
      <div className="flex items-center gap-4 border rounded-lg p-4 shadow bg-white w-full relative">
        {!disableDelete && (
          <button
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete person"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
        <div
          className={`w-3 h-3 rounded-full ${dotColor}`}
          title={isToday(updatedAt) ? "Updated today" : "Not updated today"}
        ></div>
        <div className="flex-1">
          <div className="font-bold text-lg">{personId}</div>
          <div className="text-gray-700 flex items-center gap-2">
            Site:
            <select
              value={selected}
              onChange={(e) => handleSiteChange(e.target.value)}
              className="border p-1 rounded flex-1"
              disabled={saving || updatePersonSiteMutation.isPending}
              name="site"
            >
              <option value="" disabled>
                Select site
              </option>
              {siteOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {saving && (
              <span className="text-xs text-gray-400 ml-2">Saving...</span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Last updated:{" "}
            {updatedAt ? new Date(updatedAt).toLocaleString() : "-"}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 p-2 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Delete Person</h2>
            <p className="mb-4">
              Are you sure you want to delete person{" "}
              <span className="font-semibold">{personId}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                onClick={handleDelete}
                disabled={deletePersonMutation.isPending}
              >
                {deletePersonMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
