import { useState, useEffect } from "react";
import { ADMINS, MANAGERS, PEOPLE, SITE_OPTIONS } from "../consts";
import {
  getPeopleData,
  updatePersonSite,
  getUserSite,
  updateUserSite,
} from "../mockApi";
import * as XLSX from "xlsx";

function getUserRole(userId: string) {
  if (ADMINS.includes(userId)) return "admin";
  if (MANAGERS.some((m) => m.id === userId)) return "manager";
  if (PEOPLE.includes(userId)) return "person";
  return null;
}

function setUserSite(currentSite: string) {
  const updatedAt = new Date().toISOString();
  localStorage.setItem("user_site", JSON.stringify({ currentSite, updatedAt }));
}

export default function WhereYouAt() {
  const [userId, setUserId] = useState("");
  const [currentSite, setCurrentSite] = useState("");
  const [selected, setSelected] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<{ [id: string]: boolean }>({});
  const [personSites, setPersonSites] = useState<{
    [id: string]: { currentSite: string; updatedAt: string | null };
  }>({});

  useEffect(() => {
    const id = localStorage.getItem("login_token") || "";
    setUserId(id);
    // Fetch user site from mock API
    getUserSite(id).then((userSite) => {
      setCurrentSite(userSite.currentSite);
      setSelected(userSite.currentSite);
      setUpdatedAt(userSite.updatedAt);
    });
    // Fetch people data if admin or manager
    const role = getUserRole(id);
    if (role === "admin" || role === "manager") {
      setLoading(true);
      getPeopleData(id).then((data) => {
        setPeople(data);
        const sites: {
          [id: string]: { currentSite: string; updatedAt: string | null };
        } = {};
        data.forEach((p: any) => {
          sites[p.person] = {
            currentSite: p.currentSite,
            updatedAt: p.updatedAt,
          };
        });
        setPersonSites(sites);
        setLoading(false);
      });
    }
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const updated = await updateUserSite(userId, selected);
    setCurrentSite(updated.currentSite);
    setUpdatedAt(updated.updatedAt);
  }

  function handlePersonSiteChange(personId: string, value: string) {
    setPersonSites((prev) => ({
      ...prev,
      [personId]: { ...prev[personId], currentSite: value },
    }));
  }

  async function handlePersonSiteSave(personId: string) {
    setSaving((prev) => ({ ...prev, [personId]: true }));
    const updated = await updatePersonSite(
      personId,
      personSites[personId].currentSite
    );
    setPersonSites((prev) => ({
      ...prev,
      [personId]: { ...prev[personId], ...updated },
    }));
    setSaving((prev) => ({ ...prev, [personId]: false }));
  }

  function handleExportExcel() {
    if (!people.length) return;
    const role = getUserRole(userId);
    const data = people.map(({ manager, person }) => ({
      ...(role === "admin" ? { Manager: manager } : {}),
      "Person ID": person,
      "Current Site": personSites[person]?.currentSite || "",
      "Last Updated": personSites[person]?.updatedAt
        ? new Date(personSites[person].updatedAt!).toLocaleString()
        : "-",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "People");
    XLSX.writeFile(wb, "people.xlsx");
  }

  const role = getUserRole(userId);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <div className="text-center">
        <div className="text-lg font-bold">User ID: {userId}</div>
        <div className="text-md mt-2">
          Current Site:{" "}
          <span className="font-semibold">{currentSite || "(none)"}</span>
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
            Select your site
          </option>
          {SITE_OPTIONS.map((opt) => (
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
              disabled={loading || !people.length}
            >
              Export to Excel
            </button>
          </div>
          <h2 className="text-xl font-bold mb-4 text-center">People</h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <table className="min-w-full border">
              <thead>
                <tr>
                  {role === "admin" && (
                    <th className="border px-4 py-2">Manager</th>
                  )}
                  <th className="border px-4 py-2">Person ID</th>
                  <th className="border px-4 py-2">Current Site</th>
                  <th className="border px-4 py-2">Last Updated</th>
                  <th className="border px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {people.map(({ manager, person }) => (
                  <tr key={person}>
                    {role === "admin" && (
                      <td className="border px-4 py-2">{manager}</td>
                    )}
                    <td className="border px-4 py-2">{person}</td>
                    <td className="border px-4 py-2">
                      <select
                        value={personSites[person]?.currentSite || ""}
                        onChange={(e) =>
                          handlePersonSiteChange(person, e.target.value)
                        }
                        className="border p-1 rounded"
                      >
                        <option value="" disabled>
                          Select site
                        </option>
                        {SITE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border px-4 py-2 text-xs text-gray-500">
                      {personSites[person]?.updatedAt
                        ? new Date(
                            personSites[person].updatedAt!
                          ).toLocaleString()
                        : "-"}
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                        onClick={() => handlePersonSiteSave(person)}
                        disabled={saving[person]}
                      >
                        {saving[person] ? "Saving..." : "Save"}
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
