import React from "react";

interface PersonCardProps {
  personId: string;
  site: string;
  updatedAt: string | null;
  siteOptions: string[];
  onSiteChange: (newSite: string) => void;
  saving?: boolean;
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
}: PersonCardProps) {
  const dotColor = isToday(updatedAt) ? "bg-green-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-4 border rounded-lg p-4 shadow bg-white w-full">
      <div
        className={`w-3 h-3 rounded-full ${dotColor}`}
        title={isToday(updatedAt) ? "Updated today" : "Not updated today"}
      ></div>
      <div className="flex-1">
        <div className="font-bold text-lg">{personId}</div>
        <div className="text-gray-700 flex items-center gap-2">
          Site:
          <select
            value={site}
            onChange={(e) => onSiteChange(e.target.value)}
            className="border p-1 rounded flex-1"
            disabled={saving}
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
          Last updated: {updatedAt ? new Date(updatedAt).toLocaleString() : "-"}
        </div>
      </div>
    </div>
  );
}
