import { useState, useEffect } from "react";
import { ADMINS, MANAGERS, WORKERS, LOCATION_OPTIONS } from "../consts";
import {
  getWorkersData,
  updateWorkerLocation,
  getUserLocation,
  updateUserLocation,
} from "../mockApi";
import * as XLSX from "xlsx";

function getUserRole(userId: string) {
  if (ADMINS.includes(userId)) return "admin";
  if (MANAGERS.some((m) => m.id === userId)) return "manager";
  if (WORKERS.includes(userId)) return "worker";
  return null;
}

function setUserLocation(currentLocation: string) {
  const updatedAt = new Date().toISOString();
  localStorage.setItem(
    "user_location",
    JSON.stringify({ currentLocation, updatedAt })
  );
}

export default function WhereYouAt() {
  const [userId, setUserId] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [selected, setSelected] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<{ [id: string]: boolean }>({});
  const [workerLocations, setWorkerLocations] = useState<{
    [id: string]: { currentLocation: string; updatedAt: string | null };
  }>({});

  useEffect(() => {
    const id = localStorage.getItem("login_token") || "";
    setUserId(id);
    // Fetch user location from mock API
    getUserLocation(id).then((userLoc) => {
      setCurrentLocation(userLoc.currentLocation);
      setSelected(userLoc.currentLocation);
      setUpdatedAt(userLoc.updatedAt);
    });
    // Fetch workers data if admin or manager
    const role = getUserRole(id);
    if (role === "admin" || role === "manager") {
      setLoading(true);
      getWorkersData(id).then((data) => {
        setWorkers(data);
        const locations: {
          [id: string]: { currentLocation: string; updatedAt: string | null };
        } = {};
        data.forEach((w: any) => {
          locations[w.worker] = {
            currentLocation: w.currentLocation,
            updatedAt: w.updatedAt,
          };
        });
        setWorkerLocations(locations);
        setLoading(false);
      });
    }
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const updated = await updateUserLocation(userId, selected);
    setCurrentLocation(updated.currentLocation);
    setUpdatedAt(updated.updatedAt);
  }

  function handleWorkerLocationChange(workerId: string, value: string) {
    setWorkerLocations((prev) => ({
      ...prev,
      [workerId]: { ...prev[workerId], currentLocation: value },
    }));
  }

  async function handleWorkerLocationSave(workerId: string) {
    setSaving((prev) => ({ ...prev, [workerId]: true }));
    const updated = await updateWorkerLocation(
      workerId,
      workerLocations[workerId].currentLocation
    );
    setWorkerLocations((prev) => ({
      ...prev,
      [workerId]: { ...prev[workerId], ...updated },
    }));
    setSaving((prev) => ({ ...prev, [workerId]: false }));
  }

  function handleExportExcel() {
    if (!workers.length) return;
    const role = getUserRole(userId);
    const data = workers.map(({ manager, worker }) => ({
      ...(role === "admin" ? { Manager: manager } : {}),
      "Worker ID": worker,
      "Current Location": workerLocations[worker]?.currentLocation || "",
      "Last Updated": workerLocations[worker]?.updatedAt
        ? new Date(workerLocations[worker].updatedAt!).toLocaleString()
        : "-",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Workers");
    XLSX.writeFile(wb, "workers.xlsx");
  }

  const role = getUserRole(userId);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <div className="text-center">
        <div className="text-lg font-bold">User ID: {userId}</div>
        <div className="text-md mt-2">
          Current Location:{" "}
          <span className="font-semibold">{currentLocation || "(none)"}</span>
        </div>
        {updatedAt && (
          <div className="text-xs text-gray-500 mt-1">
            Last updated: {new Date(updatedAt).toLocaleString()}
          </div>
        )}
      </div>
      <form onSubmit={handleSave} className="flex flex-col gap-4 items-center">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border p-2 rounded w-64"
        >
          <option value="" disabled>
            Select your location
          </option>
          {LOCATION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-32"
        >
          Save
        </button>
      </form>
      {(role === "admin" || role === "manager") && (
        <div className="mt-8 w-full max-w-2xl">
          <div className="flex justify-end mb-2">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={handleExportExcel}
              disabled={loading || !workers.length}
            >
              Export to Excel
            </button>
          </div>
          <h2 className="text-xl font-bold mb-4 text-center">Workers</h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <table className="min-w-full border">
              <thead>
                <tr>
                  {role === "admin" && (
                    <th className="border px-4 py-2">Manager</th>
                  )}
                  <th className="border px-4 py-2">Worker ID</th>
                  <th className="border px-4 py-2">Current Location</th>
                  <th className="border px-4 py-2">Last Updated</th>
                  <th className="border px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {workers.map(({ manager, worker }) => (
                  <tr key={worker}>
                    {role === "admin" && (
                      <td className="border px-4 py-2">{manager}</td>
                    )}
                    <td className="border px-4 py-2">{worker}</td>
                    <td className="border px-4 py-2">
                      <select
                        value={workerLocations[worker]?.currentLocation || ""}
                        onChange={(e) =>
                          handleWorkerLocationChange(worker, e.target.value)
                        }
                        className="border p-1 rounded"
                      >
                        <option value="" disabled>
                          Select location
                        </option>
                        {LOCATION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border px-4 py-2 text-xs text-gray-500">
                      {workerLocations[worker]?.updatedAt
                        ? new Date(
                            workerLocations[worker].updatedAt!
                          ).toLocaleString()
                        : "-"}
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                        onClick={() => handleWorkerLocationSave(worker)}
                        disabled={saving[worker]}
                      >
                        {saving[worker] ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
