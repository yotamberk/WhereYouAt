import React, { useState } from "react";
import * as XLSX from "xlsx";
import PersonModal from "./PersonModal";

interface DrawerProps {
  userId: string;
  role: string | null;
  loading: boolean;
  people: any[];
  personSites: {
    [id: string]: { currentSite: string; updatedAt: string | null };
  };
}

// Mock API function to add a new person
async function addNewPerson(managerId: string, personId: string) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { manager: managerId, person: personId };
}

export default function Drawer({
  userId,
  role,
  loading,
  people,
  personSites,
}: DrawerProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("login_token");
    window.location.href = "/login";
  };

  const handleExportExcel = () => {
    if (!people.length) return;
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

  return (
    <>
      {/* Menu Button */}
      <button
        className="p-2 rounded hover:bg-gray-200 focus:outline-none"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open menu"
      >
        <svg
          width="28"
          height="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      {/* Side Drawer */}
      {/* Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-20"
          onClick={() => setDrawerOpen(false)}
        ></div>
      )}
      {/* Drawer itself, always rendered for animation */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-30 flex flex-col transition-transform duration-300 transform ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ willChange: "transform" }}
      >
        <button
          className="self-end m-4 p-1 rounded hover:bg-gray-200"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close menu"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="flex-1 flex flex-col gap-4">
          <ul className="flex flex-col border-t border-gray-300">
            <li className="p-2 border-b border-gray-300 hover:opacity-80">
              <button
                className="w-full disabled:opacity-50 text-left"
                onClick={handleExportExcel}
                disabled={loading || !people.length}
              >
                Export to Excel
              </button>
            </li>
            <li className="p-2 border-b border-gray-300 hover:opacity-80">
              <button
                className="w-full text-left"
                onClick={() => setModalOpen(true)}
              >
                Add person
              </button>
            </li>
          </ul>
        </div>
        <button
          className="mt-8 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <PersonModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
      />
    </>
  );
}
