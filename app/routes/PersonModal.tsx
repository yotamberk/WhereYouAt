import React, { useState } from "react";
import { useAddNewPerson } from "../hooks/useQueries";

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function PersonModal({
  isOpen,
  onClose,
  userId,
}: PersonModalProps) {
  const [newPersonId, setNewPersonId] = useState("");
  const addPersonMutation = useAddNewPerson();

  const handleSave = async () => {
    if (!newPersonId.trim()) return;
    try {
      await addPersonMutation.mutateAsync({
        managerId: userId,
        personId: newPersonId.trim(),
      });
      setNewPersonId("");
      onClose();
    } catch (error) {
      console.error("Failed to add person:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 p-2 bg-black/50 z-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Add New Person</h2>
        <div className="mb-4">
          <label
            htmlFor="personId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Person ID
          </label>
          <input
            type="text"
            id="personId"
            value={newPersonId}
            onChange={(e) => setNewPersonId(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter person ID"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            onClick={handleSave}
            disabled={addPersonMutation.isPending || !newPersonId.trim()}
          >
            {addPersonMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
