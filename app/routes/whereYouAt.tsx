import { useState, useEffect } from "react";
import { ADMINS, MANAGERS, PEOPLE, SITE_OPTIONS } from "../consts";
import {
  getPeopleData,
  updatePersonSite,
  getUserSite,
  updateUserSite,
} from "../mockApi";
import * as XLSX from "xlsx";
import PersonCard from "./PersonCard";
import Drawer from "./Drawer";

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

  const handleExportExcel = () => {
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
  };

  const role = getUserRole(userId);

  return (
    <>
      <header className="fixed top-0 w-full bg-white shadow flex items-center h-16 px-4 z-10">
        <Drawer
          userId={userId}
          role={role}
          loading={loading}
          people={people}
          personSites={personSites}
        />
        <div className="ml-4 font-bold text-xl">Where You At</div>
      </header>
      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen relative w-full">
        <div className="w-full  p-4">
          <PersonCard
            personId={userId}
            site={currentSite}
            updatedAt={updatedAt}
            siteOptions={SITE_OPTIONS}
            onSiteChange={async (newSite) => {
              setSelected(newSite);
              const updated = await updateUserSite(userId, newSite);
              setCurrentSite(updated.currentSite);
              setUpdatedAt(updated.updatedAt);
            }}
            saving={false}
          />
        </div>

        {(role === "admin" || role === "manager") && (
          <div className="mt-8 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-center">People</h2>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="flex flex-col gap-4 p-4 overflow-x-auto whitespace-nowrap">
                {people.map(({ manager, person }) => (
                  <PersonCard
                    key={person}
                    personId={person}
                    site={personSites[person]?.currentSite || ""}
                    updatedAt={personSites[person]?.updatedAt || null}
                    siteOptions={SITE_OPTIONS}
                    saving={saving[person]}
                    onSiteChange={async (newSite) => {
                      setSaving((prev) => ({ ...prev, [person]: true }));
                      const updated = await updatePersonSite(person, newSite);
                      setPersonSites((prev) => ({
                        ...prev,
                        [person]: { ...prev[person], ...updated },
                      }));
                      setSaving((prev) => ({ ...prev, [person]: false }));
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
