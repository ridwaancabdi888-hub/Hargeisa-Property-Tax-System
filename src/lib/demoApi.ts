type DemoRole = "admin" | "agent" | "viewer";
type DemoListingType = "rent" | "sale";
type DemoListingStatus = "available" | "sold" | "rented";

interface DemoUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: DemoRole;
  isActive: boolean;
  createdBy: number | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  password: string;
}

interface DemoClient {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

interface DemoPropertyImage {
  id: number;
  url: string;
  createdAt: string;
}

interface DemoProperty {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  clientId: number | null;
  clientName: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  coverImageUrl: string | null;
  type: DemoListingType;
  status: DemoListingStatus;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  images: DemoPropertyImage[];
}

interface DemoNotification {
  id: number;
  type: string;
  message: string;
  relatedPropertyId: number | null;
  isRead: boolean;
  createdAt: string;
}

interface DemoActivity {
  id: number;
  userId: number | null;
  userFullName: string | null;
  userUsername: string | null;
  action: string;
  entityType: string | null;
  entityId: number | null;
  description: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

interface DemoSettings {
  theme: "light" | "dark";
  language: string;
  timezone: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  notifyPropertyCreated: boolean;
  notifyPropertySold: boolean;
  notifyPropertyDeleted: boolean;
  updatedAt: string;
}

interface DemoBackup {
  filename: string;
  sizeBytes: number;
  createdAt: string;
}

interface DemoState {
  version: number;
  sessionUserId: number | null;
  users: DemoUser[];
  clients: DemoClient[];
  properties: DemoProperty[];
  notifications: DemoNotification[];
  activities: DemoActivity[];
  settings: Record<string, DemoSettings>;
  backups: DemoBackup[];
}

const STORAGE_KEY = "hargeisa-tax-public-demo-v3";
const DEMO_VERSION = 3;

function nowIso() {
  return new Date().toISOString();
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function imageUrl(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;
}

function makeProperty(
  id: number,
  title: string,
  location: string,
  price: number,
  type: DemoListingType,
  status: DemoListingStatus,
  client: DemoClient,
  latitude: number,
  longitude: number,
  image: string,
  ageDays: number,
): DemoProperty {
  const createdAt = daysAgo(ageDays);
  const cover = imageUrl(image);
  return {
    id,
    title,
    description: `${title} is a verified ${type === "sale" ? "sale" : "rental"} property in ${location}, Hargeisa. This record is part of the public portfolio demonstration dataset.`,
    price,
    location,
    latitude,
    longitude,
    clientId: client.id,
    clientName: client.fullName,
    clientPhone: client.phone,
    clientEmail: client.email,
    coverImageUrl: cover,
    type,
    status,
    createdBy: 1,
    createdAt,
    updatedAt: createdAt,
    images: [{ id: id * 10, url: cover, createdAt }],
  };
}

function seedState(): DemoState {
  const createdAt = daysAgo(180);
  const users: DemoUser[] = [
    {
      id: 1,
      fullName: "Ridwaan Cabdirahman",
      username: "ridwan",
      email: "admin@hargeisatax.demo",
      role: "admin",
      isActive: true,
      createdBy: null,
      avatarUrl: null,
      createdAt,
      updatedAt: createdAt,
      password: "ridwan123",
    },
    {
      id: 2,
      fullName: "Ayaan Mohamed",
      username: "ayaan.agent",
      email: "ayaan@hargeisatax.demo",
      role: "agent",
      isActive: true,
      createdBy: 1,
      avatarUrl: null,
      createdAt: daysAgo(150),
      updatedAt: daysAgo(150),
      password: "Demo1234",
    },
    {
      id: 3,
      fullName: "Ahmed Ali",
      username: "ahmed.viewer",
      email: "ahmed@hargeisatax.demo",
      role: "viewer",
      isActive: true,
      createdBy: 1,
      avatarUrl: null,
      createdAt: daysAgo(120),
      updatedAt: daysAgo(120),
      password: "Demo1234",
    },
  ];

  const clients: DemoClient[] = [
    { id: 1, fullName: "Hodan Hassan", phone: "+252 63 410 2201", email: "hodan@example.com", address: "Jigjiga Yar, Hargeisa", notes: "Residential owner", createdBy: 1, createdAt: daysAgo(170), updatedAt: daysAgo(170) },
    { id: 2, fullName: "Mohamed Abdi", phone: "+252 63 420 1130", email: "mohamed@example.com", address: "New Hargeisa", notes: "Commercial portfolio", createdBy: 1, createdAt: daysAgo(160), updatedAt: daysAgo(160) },
    { id: 3, fullName: "Sahra Yusuf", phone: "+252 63 430 4412", email: "sahra@example.com", address: "Masalaha, Hargeisa", notes: "Prefers phone contact", createdBy: 1, createdAt: daysAgo(145), updatedAt: daysAgo(145) },
    { id: 4, fullName: "Abdirahman Jama", phone: "+252 63 440 3188", email: "abdirahman@example.com", address: "Sha'ab Area", notes: null, createdBy: 1, createdAt: daysAgo(132), updatedAt: daysAgo(132) },
    { id: 5, fullName: "Fadumo Omar", phone: "+252 63 450 7610", email: "fadumo@example.com", address: "Mohamed Mooge", notes: "Rental properties", createdBy: 1, createdAt: daysAgo(115), updatedAt: daysAgo(115) },
    { id: 6, fullName: "Khalid Ismail", phone: "+252 63 460 8824", email: "khalid@example.com", address: "Pepsi Area", notes: null, createdBy: 1, createdAt: daysAgo(90), updatedAt: daysAgo(90) },
  ];

  const properties = [
    makeProperty(1, "Jigjiga Yar Family Villa", "Jigjiga Yar", 185000, "sale", "available", clients[0], 9.5598, 44.0614, "photo-1600585154340-be6161a56a0c", 155),
    makeProperty(2, "New Hargeisa Offices", "New Hargeisa", 320000, "sale", "sold", clients[1], 9.5486, 44.0505, "photo-1497366754035-f200968a6e72", 137),
    makeProperty(3, "Masalaha Modern Home", "Masalaha", 1250, "rent", "rented", clients[2], 9.5322, 44.0414, "photo-1600566753086-00f18fb6b3ea", 121),
    makeProperty(4, "Sha'ab Corner Shops", "Sha'ab", 210000, "sale", "available", clients[3], 9.5669, 44.0802, "photo-1486406146926-c627a92ad1ab", 104),
    makeProperty(5, "Mohamed Mooge Apartments", "Mohamed Mooge", 950, "rent", "available", clients[4], 9.5355, 44.0715, "photo-1522708323590-d24dbb6b0267", 88),
    makeProperty(6, "Pepsi Executive House", "Pepsi", 1500, "rent", "rented", clients[5], 9.5758, 44.0473, "photo-1600607687939-ce8a6c25118c", 71),
    makeProperty(7, "26 June Retail Block", "26 June", 275000, "sale", "available", clients[1], 9.5625, 44.0651, "photo-1556761175-b413da4baf72", 58),
    makeProperty(8, "Ahmed Dhagah Townhouse", "Ahmed Dhagah", 142000, "sale", "sold", clients[0], 9.5528, 44.0874, "photo-1600047509807-ba8f99d2cdde", 45),
    makeProperty(9, "Gacan Libaax Residence", "Gacan Libaax", 1100, "rent", "available", clients[3], 9.5792, 44.0936, "photo-1600585154526-990dced4db0d", 34),
    makeProperty(10, "Ibrahim Koodbuur Warehouse", "Ibrahim Koodbuur", 198000, "sale", "available", clients[5], 9.5704, 44.0349, "photo-1500382017468-9049fed747ef", 22),
    makeProperty(11, "Hawl Wadaag Duplex", "Hawl Wadaag", 850, "rent", "rented", clients[2], 9.5444, 44.0958, "photo-1600566753190-17f0baa2a6c3", 12),
    makeProperty(12, "Central Hargeisa Business Suite", "City Centre", 2400, "rent", "available", clients[4], 9.5624, 44.0770, "photo-1497366811353-6870744d04b2", 3),
  ];

  return {
    version: DEMO_VERSION,
    sessionUserId: null,
    users,
    clients,
    properties,
    notifications: [
      { id: 1, type: "property_created", message: '"Central Hargeisa Business Suite" was added to the register', relatedPropertyId: 12, isRead: false, createdAt: daysAgo(3) },
      { id: 2, type: "property_updated", message: '"Hawl Wadaag Duplex" tax record was reviewed', relatedPropertyId: 11, isRead: false, createdAt: daysAgo(6) },
      { id: 3, type: "property_sold", message: '"Ahmed Dhagah Townhouse" was marked sold', relatedPropertyId: 8, isRead: true, createdAt: daysAgo(20) },
    ],
    activities: [
      { id: 1, userId: 1, userFullName: "Ridwaan Cabdirahman", userUsername: "ridwan", action: "property_created", entityType: "property", entityId: 12, description: 'Created property "Central Hargeisa Business Suite"', oldValues: null, newValues: { status: "available" }, ipAddress: "demo", createdAt: daysAgo(3) },
      { id: 2, userId: 2, userFullName: "Ayaan Mohamed", userUsername: "ayaan.agent", action: "property_updated", entityType: "property", entityId: 11, description: 'Updated property "Hawl Wadaag Duplex"', oldValues: { status: "available" }, newValues: { status: "rented" }, ipAddress: "demo", createdAt: daysAgo(6) },
      { id: 3, userId: 1, userFullName: "Ridwaan Cabdirahman", userUsername: "ridwan", action: "profile_updated", entityType: "user", entityId: 1, description: "Updated administrator profile", oldValues: null, newValues: null, ipAddress: "demo", createdAt: daysAgo(18) },
    ],
    settings: {
      "1": { theme: "light", language: "en", timezone: "Africa/Mogadishu", dateFormat: "DD/MM/YYYY", notifyPropertyCreated: true, notifyPropertySold: true, notifyPropertyDeleted: true, updatedAt: nowIso() },
      "2": { theme: "light", language: "en", timezone: "Africa/Mogadishu", dateFormat: "DD/MM/YYYY", notifyPropertyCreated: true, notifyPropertySold: true, notifyPropertyDeleted: false, updatedAt: nowIso() },
      "3": { theme: "light", language: "en", timezone: "Africa/Mogadishu", dateFormat: "DD/MM/YYYY", notifyPropertyCreated: false, notifyPropertySold: false, notifyPropertyDeleted: false, updatedAt: nowIso() },
    },
    backups: [
      { filename: "demo-backup-initial.sql", sizeBytes: 84231, createdAt: daysAgo(30) },
    ],
  };
}

function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed.version === DEMO_VERSION) return parsed;
    }
  } catch {
    // Ignore malformed or unavailable storage and reset the isolated demo dataset.
  }
  const state = seedState();
  saveState(state);
  return state;
}

function saveState(state: DemoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The demo remains usable in-memory even when storage is unavailable/full.
  }
}

function publicUser(user: DemoUser) {
  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

function managedUser(user: DemoUser) {
  return {
    ...publicUser(user),
    isActive: user.isActive,
    createdBy: user.createdBy,
    updatedAt: user.updatedAt,
  };
}

function currentUser(state: DemoState) {
  return state.users.find((user) => user.id === state.sessionUserId && user.isActive) ?? null;
}

function requireUser(state: DemoState) {
  const user = currentUser(state);
  if (!user) throw new Error("Please sign in to continue");
  return user;
}

function parseBody(options: RequestInit) {
  if (typeof options.body !== "string" || options.body.length === 0) return {} as Record<string, unknown>;
  try {
    return JSON.parse(options.body) as Record<string, unknown>;
  } catch {
    return {} as Record<string, unknown>;
  }
}

function nextId(items: Array<{ id: number }>) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function paginate<T>(items: T[], url: URL) {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") ?? 10)));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: { total, totalPages, currentPage, limit },
  };
}

function addActivity(state: DemoState, action: string, description: string, entityType: string | null = null, entityId: number | null = null) {
  const user = currentUser(state);
  state.activities.unshift({
    id: nextId(state.activities),
    userId: user?.id ?? null,
    userFullName: user?.fullName ?? null,
    userUsername: user?.username ?? null,
    action,
    entityType,
    entityId,
    description,
    oldValues: null,
    newValues: null,
    ipAddress: "public-demo",
    createdAt: nowIso(),
  });
}

function addNotification(state: DemoState, type: string, message: string, relatedPropertyId: number | null) {
  state.notifications.unshift({
    id: nextId(state.notifications),
    type,
    message,
    relatedPropertyId,
    isRead: false,
    createdAt: nowIso(),
  });
}

function listingWithoutImages(property: DemoProperty) {
  const { images: _images, ...listing } = property;
  return listing;
}

function syncOwner(property: DemoProperty, client: DemoClient | null) {
  property.clientId = client?.id ?? null;
  property.clientName = client?.fullName ?? null;
  property.clientPhone = client?.phone ?? null;
  property.clientEmail = client?.email ?? null;
}

function monthlyTrend(properties: DemoProperty[]) {
  const result: { month: string; count: number }[] = [];
  const now = new Date();
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const count = properties.filter((property) => {
      const created = new Date(property.createdAt);
      return created.getFullYear() === year && created.getMonth() === month;
    }).length;
    result.push({ month: date.toLocaleDateString("en-US", { month: "short" }), count });
  }
  return result;
}

function demoSvgDataUrl(label: string) {
  const safe = label.replace(/[<>&"']/g, "").slice(0, 40);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="100%" height="100%" fill="#0f2747"/><circle cx="450" cy="260" r="90" fill="#3b82f6" opacity=".35"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="36">${safe || "Property image"}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function isDemoDeployment() {
  if (typeof window === "undefined") return false;
  return import.meta.env.VITE_DEMO_MODE === "true" || /(?:^|\.)vercel\.app$/i.test(window.location.hostname);
}

export async function demoApiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const state = loadState();
  const method = (options.method ?? "GET").toUpperCase();
  const url = new URL(path, "https://demo.local");
  const pathname = url.pathname;
  const body = parseBody(options);

  if (pathname === "/auth/login" && method === "POST") {
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");
    const user = state.users.find((candidate) => candidate.username.toLowerCase() === username.toLowerCase());
    if (!user || !user.isActive || user.password !== password) {
      throw new Error("Invalid username or password. Demo login: ridwan / ridwan123");
    }
    state.sessionUserId = user.id;
    addActivity(state, "login", `${user.username} logged in to the public demo`);
    saveState(state);
    return { success: true, user: publicUser(user) } as T;
  }

  if (pathname === "/auth/logout" && method === "POST") {
    const user = currentUser(state);
    if (user) addActivity(state, "logout", `${user.username} logged out`);
    state.sessionUserId = null;
    saveState(state);
    return { success: true, message: "Logged out" } as T;
  }

  if (pathname === "/auth/me" && method === "GET") {
    const user = requireUser(state);
    return { success: true, user: publicUser(user) } as T;
  }

  if (pathname === "/property-listings/counts" && method === "GET") {
    requireUser(state);
    const total = state.properties.length;
    const available = state.properties.filter((item) => item.status === "available").length;
    const sold = state.properties.filter((item) => item.status === "sold").length;
    const rented = state.properties.filter((item) => item.status === "rented").length;
    const rent = state.properties.filter((item) => item.type === "rent").length;
    const sale = state.properties.filter((item) => item.type === "sale").length;
    const assessedValue = state.properties.reduce((sum, item) => sum + item.price, 0);
    return { success: true, data: { total, available, sold, rented, rent, sale, assessedValue } } as T;
  }

  if (pathname === "/property-listings" && method === "GET") {
    requireUser(state);
    let rows = [...state.properties];
    const search = (url.searchParams.get("search") ?? "").toLowerCase();
    const type = url.searchParams.get("type");
    const status = url.searchParams.get("status");
    const clientId = url.searchParams.get("client_id");
    const minPrice = url.searchParams.get("min_price");
    const maxPrice = url.searchParams.get("max_price");
    if (search) rows = rows.filter((item) => `${item.title} ${item.location} ${item.clientName ?? ""}`.toLowerCase().includes(search));
    if (type === "rent" || type === "sale") rows = rows.filter((item) => item.type === type);
    if (status === "available" || status === "sold" || status === "rented") rows = rows.filter((item) => item.status === status);
    if (clientId) rows = rows.filter((item) => item.clientId === Number(clientId));
    if (minPrice) rows = rows.filter((item) => item.price >= Number(minPrice));
    if (maxPrice) rows = rows.filter((item) => item.price <= Number(maxPrice));
    rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const page = paginate(rows.map(listingWithoutImages), url);
    return { success: true, ...page } as T;
  }

  if (pathname === "/property-listings" && method === "POST") {
    const user = requireUser(state);
    if (user.role === "viewer") throw new Error("Viewer accounts cannot create properties");
    const id = nextId(state.properties);
    const client = state.clients.find((item) => item.id === Number(body.clientId)) ?? null;
    const property: DemoProperty = {
      id,
      title: String(body.title ?? "Untitled property"),
      description: String(body.description ?? ""),
      price: Number(body.price ?? 0),
      location: String(body.location ?? "Hargeisa"),
      latitude: body.latitude === null || body.latitude === undefined ? null : Number(body.latitude),
      longitude: body.longitude === null || body.longitude === undefined ? null : Number(body.longitude),
      clientId: null,
      clientName: null,
      clientPhone: null,
      clientEmail: null,
      coverImageUrl: null,
      type: body.type === "rent" ? "rent" : "sale",
      status: body.status === "sold" || body.status === "rented" ? body.status : "available",
      createdBy: user.id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      images: [],
    };
    syncOwner(property, client);
    state.properties.unshift(property);
    addActivity(state, "property_created", `Created property "${property.title}"`, "property", property.id);
    addNotification(state, "property_created", `"${property.title}" was added to the property register`, property.id);
    saveState(state);
    return { success: true, data: listingWithoutImages(property) } as T;
  }

  const propertyMatch = pathname.match(/^\/property-listings\/(\d+)$/);
  if (propertyMatch) {
    const user = requireUser(state);
    const id = Number(propertyMatch[1]);
    const property = state.properties.find((item) => item.id === id);
    if (!property) throw new Error("Property not found");
    if (method === "GET") return { success: true, data: property } as T;
    if (method === "PUT") {
      if (user.role === "viewer") throw new Error("Viewer accounts cannot edit properties");
      const client = state.clients.find((item) => item.id === Number(body.clientId)) ?? null;
      property.title = String(body.title ?? property.title);
      property.description = String(body.description ?? property.description);
      property.price = Number(body.price ?? property.price);
      property.location = String(body.location ?? property.location);
      property.latitude = body.latitude === null ? null : Number(body.latitude ?? property.latitude);
      property.longitude = body.longitude === null ? null : Number(body.longitude ?? property.longitude);
      if (body.type === "rent" || body.type === "sale") property.type = body.type;
      if (body.status === "available" || body.status === "sold" || body.status === "rented") property.status = body.status;
      syncOwner(property, client);
      property.updatedAt = nowIso();
      addActivity(state, "property_updated", `Updated property "${property.title}"`, "property", property.id);
      saveState(state);
      return { success: true, data: listingWithoutImages(property) } as T;
    }
    if (method === "DELETE") {
      if (user.role !== "admin") throw new Error("Only administrators can delete properties");
      state.properties = state.properties.filter((item) => item.id !== id);
      addActivity(state, "property_deleted", `Deleted property "${property.title}"`, "property", id);
      addNotification(state, "property_deleted", `"${property.title}" was removed from the register`, id);
      saveState(state);
      return { success: true, message: "Property deleted" } as T;
    }
  }

  const imageDeleteMatch = pathname.match(/^\/property-listings\/(\d+)\/images\/(\d+)$/);
  if (imageDeleteMatch && method === "DELETE") {
    requireUser(state);
    const property = state.properties.find((item) => item.id === Number(imageDeleteMatch[1]));
    if (!property) throw new Error("Property not found");
    property.images = property.images.filter((image) => image.id !== Number(imageDeleteMatch[2]));
    property.coverImageUrl = property.images[0]?.url ?? null;
    property.updatedAt = nowIso();
    saveState(state);
    return { success: true, message: "Image removed" } as T;
  }

  if (pathname === "/clients" && method === "GET") {
    requireUser(state);
    let rows = [...state.clients];
    const search = (url.searchParams.get("search") ?? "").toLowerCase();
    if (search) rows = rows.filter((item) => `${item.fullName} ${item.phone ?? ""} ${item.email ?? ""} ${item.address ?? ""}`.toLowerCase().includes(search));
    rows.sort((a, b) => b.id - a.id);
    const page = paginate(rows, url);
    return { success: true, ...page } as T;
  }

  if (pathname === "/clients" && method === "POST") {
    const user = requireUser(state);
    if (user.role === "viewer") throw new Error("Viewer accounts cannot create clients");
    const client: DemoClient = {
      id: nextId(state.clients),
      fullName: String(body.fullName ?? "Unnamed client"),
      phone: body.phone ? String(body.phone) : null,
      email: body.email ? String(body.email) : null,
      address: body.address ? String(body.address) : null,
      notes: body.notes ? String(body.notes) : null,
      createdBy: user.id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.clients.unshift(client);
    addActivity(state, "client_created", `Created client "${client.fullName}"`, "client", client.id);
    saveState(state);
    return { success: true, data: client } as T;
  }

  const clientMatch = pathname.match(/^\/clients\/(\d+)$/);
  if (clientMatch) {
    const user = requireUser(state);
    const id = Number(clientMatch[1]);
    const client = state.clients.find((item) => item.id === id);
    if (!client) throw new Error("Client not found");
    if (method === "GET") {
      return { success: true, data: { ...client, propertyCount: state.properties.filter((property) => property.clientId === id).length } } as T;
    }
    if (method === "PUT") {
      if (user.role === "viewer") throw new Error("Viewer accounts cannot edit clients");
      client.fullName = String(body.fullName ?? client.fullName);
      client.phone = body.phone ? String(body.phone) : null;
      client.email = body.email ? String(body.email) : null;
      client.address = body.address ? String(body.address) : null;
      client.notes = body.notes ? String(body.notes) : null;
      client.updatedAt = nowIso();
      state.properties.filter((property) => property.clientId === id).forEach((property) => syncOwner(property, client));
      addActivity(state, "client_updated", `Updated client "${client.fullName}"`, "client", id);
      saveState(state);
      return { success: true, data: client } as T;
    }
    if (method === "DELETE") {
      if (user.role !== "admin") throw new Error("Only administrators can delete clients");
      state.clients = state.clients.filter((item) => item.id !== id);
      state.properties.filter((property) => property.clientId === id).forEach((property) => syncOwner(property, null));
      addActivity(state, "client_deleted", `Deleted client "${client.fullName}"`, "client", id);
      saveState(state);
      return { success: true, message: "Client deleted" } as T;
    }
  }

  if (pathname === "/analytics" && method === "GET") {
    requireUser(state);
    const total = state.properties.length;
    const available = state.properties.filter((item) => item.status === "available").length;
    const sold = state.properties.filter((item) => item.status === "sold").length;
    const rented = state.properties.filter((item) => item.status === "rented").length;
    const byType = (["rent", "sale"] as DemoListingType[]).map((type) => ({ type, count: state.properties.filter((item) => item.type === type).length }));
    const revenue = state.properties.filter((item) => item.status === "sold").reduce((sum, item) => sum + item.price * 0.01, 0);
    return { success: true, data: { totals: { total, available, sold, rented }, revenue, byType, monthlyTrend: monthlyTrend(state.properties) } } as T;
  }

  if (pathname === "/notifications" && method === "GET") {
    requireUser(state);
    return { success: true, data: state.notifications, meta: { unreadCount: state.notifications.filter((item) => !item.isRead).length } } as T;
  }

  const notificationMatch = pathname.match(/^\/notifications\/(\d+)\/read$/);
  if (notificationMatch && method === "POST") {
    requireUser(state);
    const item = state.notifications.find((notification) => notification.id === Number(notificationMatch[1]));
    if (item) item.isRead = true;
    saveState(state);
    return { success: true, message: "Notification marked as read" } as T;
  }

  if (pathname === "/profile" && method === "PATCH") {
    const user = requireUser(state);
    user.fullName = String(body.fullName ?? user.fullName);
    user.email = String(body.email ?? user.email);
    user.updatedAt = nowIso();
    addActivity(state, "profile_updated", "Updated profile", "user", user.id);
    saveState(state);
    return { success: true, data: publicUser(user) } as T;
  }

  if (pathname === "/profile/password" && method === "PATCH") {
    const user = requireUser(state);
    if (String(body.currentPassword ?? "") !== user.password) throw new Error("Current password is incorrect");
    user.password = String(body.newPassword ?? user.password);
    user.updatedAt = nowIso();
    addActivity(state, "password_changed", "Changed account password", "user", user.id);
    saveState(state);
    return { success: true, message: "Password changed" } as T;
  }

  if (pathname === "/profile/avatar" && method === "DELETE") {
    const user = requireUser(state);
    user.avatarUrl = null;
    user.updatedAt = nowIso();
    saveState(state);
    return { success: true, data: publicUser(user) } as T;
  }

  if (pathname === "/settings" && method === "GET") {
    const user = requireUser(state);
    return { success: true, data: state.settings[String(user.id)] ?? seedState().settings["1"] } as T;
  }

  if (pathname === "/settings" && method === "PUT") {
    const user = requireUser(state);
    const current = state.settings[String(user.id)] ?? seedState().settings["1"];
    const next: DemoSettings = {
      ...current,
      ...(body.theme === "light" || body.theme === "dark" ? { theme: body.theme } : {}),
      ...(typeof body.language === "string" ? { language: body.language } : {}),
      ...(typeof body.timezone === "string" ? { timezone: body.timezone } : {}),
      ...(body.dateFormat === "MM/DD/YYYY" || body.dateFormat === "DD/MM/YYYY" || body.dateFormat === "YYYY-MM-DD" ? { dateFormat: body.dateFormat } : {}),
      ...(typeof body.notifyPropertyCreated === "boolean" ? { notifyPropertyCreated: body.notifyPropertyCreated } : {}),
      ...(typeof body.notifyPropertySold === "boolean" ? { notifyPropertySold: body.notifyPropertySold } : {}),
      ...(typeof body.notifyPropertyDeleted === "boolean" ? { notifyPropertyDeleted: body.notifyPropertyDeleted } : {}),
      updatedAt: nowIso(),
    };
    state.settings[String(user.id)] = next;
    saveState(state);
    return { success: true, data: next } as T;
  }

  if (pathname === "/users" && method === "GET") {
    const user = requireUser(state);
    if (user.role !== "admin") throw new Error("Administrator access required");
    let rows = state.users.map(managedUser);
    const search = (url.searchParams.get("search") ?? "").toLowerCase();
    const role = url.searchParams.get("role");
    if (search) rows = rows.filter((item) => `${item.fullName} ${item.username} ${item.email}`.toLowerCase().includes(search));
    if (role === "admin" || role === "agent" || role === "viewer") rows = rows.filter((item) => item.role === role);
    const page = paginate(rows, url);
    return { success: true, ...page } as T;
  }

  if (pathname === "/users" && method === "POST") {
    const admin = requireUser(state);
    if (admin.role !== "admin") throw new Error("Administrator access required");
    const username = String(body.username ?? "");
    const email = String(body.email ?? "");
    if (state.users.some((item) => item.username.toLowerCase() === username.toLowerCase() || item.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Username or email is already in use");
    }
    const role: DemoRole = body.role === "admin" || body.role === "viewer" ? body.role : "agent";
    const user: DemoUser = {
      id: nextId(state.users),
      fullName: String(body.fullName ?? username),
      username,
      email,
      role,
      isActive: true,
      createdBy: admin.id,
      avatarUrl: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      password: String(body.password ?? "Demo1234"),
    };
    state.users.push(user);
    addActivity(state, "user_created", `Created user "${user.username}"`, "user", user.id);
    saveState(state);
    return { success: true, user: publicUser(user) } as T;
  }

  const statusMatch = pathname.match(/^\/users\/(\d+)\/status$/);
  if (statusMatch && method === "PATCH") {
    const admin = requireUser(state);
    if (admin.role !== "admin") throw new Error("Administrator access required");
    const target = state.users.find((item) => item.id === Number(statusMatch[1]));
    if (!target) throw new Error("User not found");
    if (target.id === admin.id || target.role === "admin") throw new Error("This account cannot be deactivated from the demo");
    target.isActive = Boolean(body.isActive);
    target.updatedAt = nowIso();
    saveState(state);
    return { success: true, data: managedUser(target) } as T;
  }

  const roleMatch = pathname.match(/^\/users\/(\d+)\/role$/);
  if (roleMatch && method === "PATCH") {
    const admin = requireUser(state);
    if (admin.role !== "admin") throw new Error("Administrator access required");
    const target = state.users.find((item) => item.id === Number(roleMatch[1]));
    if (!target) throw new Error("User not found");
    if (target.id === admin.id || target.role === "admin") throw new Error("This account role cannot be changed");
    if (body.role === "agent" || body.role === "viewer") target.role = body.role;
    target.updatedAt = nowIso();
    saveState(state);
    return { success: true, data: managedUser(target) } as T;
  }

  const passwordMatch = pathname.match(/^\/users\/(\d+)\/password$/);
  if (passwordMatch && method === "PATCH") {
    const admin = requireUser(state);
    if (admin.role !== "admin") throw new Error("Administrator access required");
    const target = state.users.find((item) => item.id === Number(passwordMatch[1]));
    if (!target) throw new Error("User not found");
    target.password = String(body.newPassword ?? target.password);
    target.updatedAt = nowIso();
    saveState(state);
    return { success: true, message: "Password reset" } as T;
  }

  if (pathname === "/activity-logs" && method === "GET") {
    const user = requireUser(state);
    if (user.role !== "admin") throw new Error("Administrator access required");
    let rows = [...state.activities];
    const search = (url.searchParams.get("search") ?? "").toLowerCase();
    const action = url.searchParams.get("action");
    const userId = url.searchParams.get("userId");
    const dateFrom = url.searchParams.get("date_from");
    const dateTo = url.searchParams.get("date_to");
    if (search) rows = rows.filter((item) => `${item.description} ${item.userFullName ?? ""} ${item.userUsername ?? ""}`.toLowerCase().includes(search));
    if (action) rows = rows.filter((item) => item.action === action);
    if (userId) rows = rows.filter((item) => item.userId === Number(userId));
    if (dateFrom) rows = rows.filter((item) => new Date(item.createdAt).getTime() >= new Date(dateFrom).getTime());
    if (dateTo) rows = rows.filter((item) => new Date(item.createdAt).getTime() <= new Date(`${dateTo}T23:59:59`).getTime());
    const page = paginate(rows, url);
    return { success: true, ...page } as T;
  }

  if (pathname === "/backups" && method === "GET") {
    const user = requireUser(state);
    if (user.role !== "admin") throw new Error("Administrator access required");
    return { success: true, data: state.backups } as T;
  }

  if (pathname === "/backups" && method === "POST") {
    const user = requireUser(state);
    if (user.role !== "admin") throw new Error("Administrator access required");
    const filename = `demo-backup-${Date.now()}.sql`;
    state.backups.unshift({ filename, sizeBytes: 86000 + state.properties.length * 750, createdAt: nowIso() });
    addActivity(state, "backup_created", `Created demo backup ${filename}`, "backup", null);
    saveState(state);
    return { success: true, data: { filename } } as T;
  }

  throw new Error(`This demo action is not available yet: ${method} ${pathname}`);
}

export async function demoApiUpload<T>(path: string, formData: FormData): Promise<T> {
  const state = loadState();
  const user = requireUser(state);

  const propertyImagesMatch = path.match(/^\/property-listings\/(\d+)\/images$/);
  if (propertyImagesMatch) {
    if (user.role === "viewer") throw new Error("Viewer accounts cannot upload property images");
    const property = state.properties.find((item) => item.id === Number(propertyImagesMatch[1]));
    if (!property) throw new Error("Property not found");
    const files = formData.getAll("images").filter((item): item is File => item instanceof File);
    const images = files.map((file, index) => ({
      id: Math.max(0, ...property.images.map((image) => image.id)) + index + 1,
      url: demoSvgDataUrl(file.name),
      createdAt: nowIso(),
    }));
    property.images.push(...images);
    property.coverImageUrl = property.images[0]?.url ?? null;
    property.updatedAt = nowIso();
    saveState(state);
    return { success: true, data: images } as T;
  }

  if (path === "/profile/avatar") {
    const file = formData.get("avatar");
    user.avatarUrl = demoSvgDataUrl(file instanceof File ? file.name : user.fullName);
    user.updatedAt = nowIso();
    saveState(state);
    return { success: true, data: publicUser(user) } as T;
  }

  if (path === "/backups/restore") {
    if (user.role !== "admin") throw new Error("Administrator access required");
    const safetyBackup = `pre-restore-demo-${Date.now()}.sql`;
    state.backups.unshift({ filename: safetyBackup, sizeBytes: 90000, createdAt: nowIso() });
    addActivity(state, "backup_restored", "Restored a demo backup file", "backup", null);
    saveState(state);
    return { success: true, data: { safetyBackup } } as T;
  }

  throw new Error(`This demo upload is not available yet: ${path}`);
}

export function demoCsvUrl() {
  const state = loadState();
  const header = "ID,Title,Location,Price,Type,Status,Owner\n";
  const rows = state.properties.map((item) => [item.id, item.title, item.location, item.price, item.type, item.status, item.clientName ?? ""].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  return `data:text/csv;charset=utf-8,${encodeURIComponent(header + rows)}`;
}

export function demoExcelUrl() {
  return demoCsvUrl().replace("text/csv", "application/vnd.ms-excel");
}

export function demoTaxBillUrl(propertyId: number) {
  const state = loadState();
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property) return "data:text/plain,Property%20not%20found";
  const bill = [
    "HARGEISA MUNICIPAL PROPERTY TAX - DEMO BILL",
    "",
    `Property: ${property.title}`,
    `Location: ${property.location}`,
    `Owner: ${property.clientName ?? "Unassigned"}`,
    `Assessed value: $${property.price.toLocaleString("en-US")}`,
    `Illustrative tax (1%): $${(property.price * 0.01).toLocaleString("en-US")}`,
    "",
    "Portfolio demonstration only - not an official municipal tax invoice.",
  ].join("\n");
  return `data:text/plain;charset=utf-8,${encodeURIComponent(bill)}`;
}

export function demoBackupUrl(filename: string) {
  const text = `-- Hargeisa Tax public portfolio demo backup\n-- File: ${filename}\n-- This is a demonstration export and contains no real citizen data.\n`;
  return `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;
}
