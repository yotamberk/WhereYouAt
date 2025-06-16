import { MANAGERS, WORKERS, ADMINS, LOCATION_OPTIONS } from "./consts";

const STATUS_OPTIONS = ["At Home", "At Work", "On Vacation", "In Transit"];

function getRandomLocation() {
  return LOCATION_OPTIONS[Math.floor(Math.random() * LOCATION_OPTIONS.length)];
}

function getRandomPastDate() {
  // Random date within the last 7 days
  const now = Date.now();
  const past = now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
  return new Date(past).toISOString();
}

// Initial mock data for workers
const initialLocations: {
  [id: string]: { currentLocation: string; updatedAt: string | null };
} = {};
[...WORKERS].forEach((worker) => {
  initialLocations[worker] = {
    currentLocation: getRandomLocation(),
    updatedAt: getRandomPastDate(),
  };
});

// Global mock data state for workers
let mockWorkerLocations: {
  [id: string]: { currentLocation: string; updatedAt: string | null };
} = {
  ...initialLocations,
};

// Global mock data state for user locations (by userId)
let mockUserLocations: {
  [id: string]: { currentLocation: string; updatedAt: string | null };
} = {};

export async function getWorkersData(userId: string) {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 200));
  // Determine which workers to return based on user role
  if (ADMINS.includes(userId)) {
    // Admins see all managers and their workers
    return MANAGERS.flatMap((m) =>
      m.workers.map((w) => ({
        manager: m.id,
        worker: w,
        ...mockWorkerLocations[w],
      }))
    );
  }
  const manager = MANAGERS.find((m) => m.id === userId);
  if (manager) {
    return manager.workers.map((w) => ({
      manager: userId,
      worker: w,
      ...mockWorkerLocations[w],
    }));
  }
  return [];
}

export async function updateWorkerLocation(
  workerId: string,
  currentLocation: string
) {
  await new Promise((res) => setTimeout(res, 200));
  mockWorkerLocations[workerId] = {
    currentLocation,
    updatedAt: new Date().toISOString(),
  };
  return mockWorkerLocations[workerId];
}

export async function getUserLocation(userId: string) {
  await new Promise((res) => setTimeout(res, 200));
  if (!mockUserLocations[userId]) {
    // Initialize if not present
    mockUserLocations[userId] = {
      currentLocation: getRandomLocation(),
      updatedAt: getRandomPastDate(),
    };
  }
  return mockUserLocations[userId];
}

export async function updateUserLocation(
  userId: string,
  currentLocation: string
) {
  await new Promise((res) => setTimeout(res, 200));
  mockUserLocations[userId] = {
    currentLocation,
    updatedAt: new Date().toISOString(),
  };
  return mockUserLocations[userId];
}
