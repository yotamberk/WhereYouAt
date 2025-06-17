import { useState, useEffect } from "react";
import { ADMINS, MANAGERS, PEOPLE, SITE_OPTIONS } from "../consts";
import * as XLSX from "xlsx";
import PersonCard from "./PersonCard";
import Drawer from "./Drawer";
import {
  usePeopleData,
  useUserSite,
  useUpdateUserSite,
} from "../hooks/useQueries";

function getUserRole(userId: string) {
  if (ADMINS.includes(userId)) return "admin";
  if (MANAGERS.some((m) => m.id === userId)) return "manager";
  if (PEOPLE.includes(userId)) return "person";
  return null;
}

export default function WhereYouAt() {
  const [userId, setUserId] = useState("");
  const [selected, setSelected] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("login_token") || "";
    setUserId(id);
  }, []);

  const { data: userSite, isLoading: userSiteLoading } = useUserSite(userId);
  const { data: people, isLoading: peopleLoading } = usePeopleData(userId);
  const updateUserSiteMutation = useUpdateUserSite();

  const role = getUserRole(userId);

  const handleSiteChange = async (newSite: string) => {
    setSelected(newSite);
    await updateUserSiteMutation.mutateAsync({
      userId,
      currentSite: newSite,
    });
  };

  return (
    <>
      <header className="fixed top-0 w-full bg-white shadow flex items-center h-16 px-4 z-10">
        <Drawer
          userId={userId}
          role={role}
          loading={peopleLoading}
          people={people || []}
          personSites={
            people?.reduce(
              (acc, { person, currentSite, updatedAt }) => ({
                ...acc,
                [person]: { currentSite, updatedAt },
              }),
              {}
            ) || {}
          }
        />
        <div className="ml-4 font-bold text-xl">Where You At</div>
      </header>
      {/* Main content */}
      <div className="flex flex-col items-center justify-center mt-16 min-h-screen relative w-full">
        <div className="w-full p-4">
          <PersonCard
            personId={userId}
            site={userSite?.currentSite || ""}
            updatedAt={userSite?.updatedAt || null}
            siteOptions={SITE_OPTIONS}
            onSiteChange={handleSiteChange}
            saving={updateUserSiteMutation.isPending}
            disableDelete
          />
        </div>

        {(role === "admin" || role === "manager") && (
          <div className="mt-8 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-center">People</h2>
            {peopleLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="flex flex-col gap-4 p-4 overflow-x-auto whitespace-nowrap">
                {people?.map(({ manager, person, currentSite, updatedAt }) => (
                  <PersonCard
                    key={person}
                    personId={person}
                    site={currentSite}
                    updatedAt={updatedAt}
                    siteOptions={SITE_OPTIONS}
                    saving={false}
                    onSiteChange={async (newSite) => {
                      // This will be handled by the PersonCard component
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
