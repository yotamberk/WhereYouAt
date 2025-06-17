import { MANAGERS, PEOPLE, ADMINS, SITE_OPTIONS } from "./consts";

const STATUS_OPTIONS = ["At Home", "At Work", "On Vacation", "In Transit"];

function getRandomSite() {
  return SITE_OPTIONS[Math.floor(Math.random() * SITE_OPTIONS.length)];
}

function getRandomPastDate() {
  // Random date within the last 7 days
  const now = Date.now();
  const past = now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
  return new Date(past).toISOString();
}

// Initial mock data for people
const initialSites: {
  [id: string]: { currentSite: string; updatedAt: string | null };
} = {};
[...PEOPLE].forEach((person) => {
  initialSites[person] = {
    currentSite: getRandomSite(),
    updatedAt: getRandomPastDate(),
  };
});

// Global mock data state for people
let mockPersonSites: {
  [id: string]: { currentSite: string; updatedAt: string | null };
} = {
  ...initialSites,
};

// Global mock data state for user sites (by userId)
let mockUserSites: {
  [id: string]: { currentSite: string; updatedAt: string | null };
} = {};

export async function getPeopleData(userId: string) {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 200));
  // Determine which people to return based on user role
  if (ADMINS.includes(userId)) {
    // Admins see all managers and their people
    return MANAGERS.flatMap((m) =>
      m.people.map((p) => ({
        manager: m.id,
        person: p,
        ...mockPersonSites[p],
      }))
    );
  }
  const manager = MANAGERS.find((m) => m.id === userId);
  if (manager) {
    return manager.people.map((p) => ({
      manager: userId,
      person: p,
      ...mockPersonSites[p],
    }));
  }
  return [];
}

export async function updatePersonSite(personId: string, currentSite: string) {
  await new Promise((res) => setTimeout(res, 200));
  mockPersonSites[personId] = {
    currentSite,
    updatedAt: new Date().toISOString(),
  };
  return mockPersonSites[personId];
}

export async function getUserSite(userId: string) {
  await new Promise((res) => setTimeout(res, 200));
  if (!mockUserSites[userId]) {
    // Initialize if not present
    mockUserSites[userId] = {
      currentSite: getRandomSite(),
      updatedAt: getRandomPastDate(),
    };
  }
  return mockUserSites[userId];
}

export async function updateUserSite(userId: string, currentSite: string) {
  await new Promise((res) => setTimeout(res, 200));
  mockUserSites[userId] = {
    currentSite,
    updatedAt: new Date().toISOString(),
  };
  return mockUserSites[userId];
}

export async function addNewPerson(managerId: string, personId: string) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Add person to PEOPLE array if not already present
  if (!PEOPLE.includes(personId)) {
    PEOPLE.push(personId);
  }

  // Add person to the manager's people list
  const manager = MANAGERS.find((m) => m.id === managerId);
  if (manager && !manager.people.includes(personId)) {
    manager.people.push(personId);
  }

  // Initialize the person's site data
  mockPersonSites[personId] = {
    currentSite: getRandomSite(),
    updatedAt: new Date().toISOString(),
  };

  return { manager: managerId, person: personId };
}

export async function deletePerson(personId: string) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Remove from PEOPLE array
  const index = PEOPLE.indexOf(personId);
  if (index > -1) {
    PEOPLE.splice(index, 1);
  }

  // Remove from manager's people list
  MANAGERS.forEach((manager) => {
    const personIndex = manager.people.indexOf(personId);
    if (personIndex > -1) {
      manager.people.splice(personIndex, 1);
    }
  });

  // Remove from mockPersonSites
  delete mockPersonSites[personId];

  return { success: true };
}
