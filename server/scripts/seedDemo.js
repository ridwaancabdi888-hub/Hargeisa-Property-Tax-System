require("dotenv").config();

const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

const DEMO_PREFIX = "[DEMO]";

const demoUsers = [
  { fullName: "Maamule Jaamacadeed Demo", username: "demo_admin", email: "demo.admin@example.com", role: "admin", password: "DemoAdmin!2026_Km9" },
  { fullName: "Nimco Cabdi Demo", username: "demo_agent", email: "demo.agent@example.com", role: "agent", password: "DemoAgent!2026_Aq7" },
  { fullName: "Maxamuud Xasan Demo", username: "demo_viewer", email: "demo.viewer@example.com", role: "viewer", password: "DemoViewer!2026_Zp4" },
];

const clients = [
  ["Axmed Maxamed Warsame", "+252 63 800 1001", "demo.owner01@example.com", "Jigjiga Yar, Hargeisa"],
  ["Hodan Cabdi Xasan", "+252 63 800 1002", "demo.owner02@example.com", "New Hargeisa, Hargeisa"],
  ["Cabdiraxmaan Yuusuf Cali", "+252 63 800 1003", "demo.owner03@example.com", "Maxamed Mooge, Hargeisa"],
  ["Ayaan Maxamed Nuur", "+252 63 800 1004", "demo.owner04@example.com", "Axmed Dhagax, Hargeisa"],
  ["Khadar Cabdi Jaamac", "+252 63 800 1005", "demo.owner05@example.com", "26 June, Hargeisa"],
  ["Sahra Axmed Ismaaciil", "+252 63 800 1006", "demo.owner06@example.com", "Gacan Libaax, Hargeisa"],
  ["Fadumo Ibraahim Aadan", "+252 63 800 1007", "demo.owner07@example.com", "Ibraahim Koodbuur, Hargeisa"],
  ["Xasan Cali Muuse", "+252 63 800 1008", "demo.owner08@example.com", "Maxamed Haybe, Hargeisa"],
  ["Maryan Yuusuf Geelle", "+252 63 800 1009", "demo.owner09@example.com", "Masalaha, Hargeisa"],
  ["Siciid Nuur Ducaale", "+252 63 800 1010", "demo.owner10@example.com", "Sheekh Nuur, Hargeisa"],
  ["Ifraax Jaamac Rooble", "+252 63 800 1011", "demo.owner11@example.com", "Sha'ab Area, Hargeisa"],
  ["Cabdillaahi Axmed Barre", "+252 63 800 1012", "demo.owner12@example.com", "Pepsi Area, Hargeisa"],
  ["Ruqiya Maxamed Cumar", "+252 63 800 1013", "demo.owner13@example.com", "Hargeisa City Centre"],
  ["Bashiir Cabdi Faarax", "+252 63 800 1014", "demo.owner14@example.com", "Airport Road, Hargeisa"],
  ["Deeqa Xasan Warsame", "+252 63 800 1015", "demo.owner15@example.com", "Daarasalaam, Hargeisa"],
].map(([fullName, phone, email, address], index) => ({
  fullName,
  phone,
  email,
  address,
  notes: `${DEMO_PREFIX} Fictional owner ${String(index + 1).padStart(2, "0")} for university demonstration only.`,
}));

const properties = [
  ["DEMO-PR-001", "Modern Three-Bedroom House – Jigjiga Yar", 145000, "Jigjiga Yar", 9.5732, 44.0471, 0, "sale", "available", "Residential house", "240 m²", "3 bedrooms, 2 bathrooms", "2026-03-12", 0],
  ["DEMO-PR-002", "Family Villa – New Hargeisa", 235000, "New Hargeisa", 9.5487, 44.0614, 1, "sale", "sold", "Villa", "380 m²", "5 bedrooms, 4 bathrooms", "2026-02-08", 1],
  ["DEMO-PR-003", "Two-Bedroom Apartment – Maxamed Mooge", 650, "Maxamed Mooge", 9.5314, 44.0873, 2, "rent", "rented", "Apartment", "105 m²", "2 bedrooms, 2 bathrooms", "2026-04-21", 2],
  ["DEMO-PR-004", "Courtyard Home – Axmed Dhagax", 98000, "Axmed Dhagax", 9.5616, 44.0322, 3, "sale", "available", "Residential house", "190 m²", "3 bedrooms, 2 bathrooms", "2026-05-04", 3],
  ["DEMO-PR-005", "Commercial Shop – 26 June", 1800, "26 June", 9.5684, 44.0792, 4, "rent", "rented", "Shop", "85 m²", "street frontage and storage room", "2026-01-19", 4],
  ["DEMO-PR-006", "Office Suite – Gacan Libaax", 1200, "Gacan Libaax", 9.5811, 44.0964, 5, "rent", "available", "Office", "140 m²", "reception plus 4 offices", "2026-06-11", 5],
  ["DEMO-PR-007", "Corner Villa – Ibraahim Koodbuur", 198000, "Ibraahim Koodbuur", 9.5789, 44.0681, 6, "sale", "sold", "Villa", "320 m²", "4 bedrooms, 3 bathrooms", "2026-02-26", 6],
  ["DEMO-PR-008", "Ground-Floor Apartment – Maxamed Haybe", 525, "Maxamed Haybe", 9.5224, 44.0518, 7, "rent", "rented", "Apartment", "92 m²", "2 bedrooms, 1 bathroom", "2026-07-02", 7],
  ["DEMO-PR-009", "Warehouse – Masalaha", 310000, "Masalaha", 9.5007, 44.1035, 8, "sale", "available", "Warehouse", "1,100 m²", "loading yard and secure store", "2026-03-30", 8],
  ["DEMO-PR-010", "Neighbourhood Shop – Sheekh Nuur", 76000, "Sheekh Nuur", 9.5895, 44.0498, 9, "sale", "sold", "Shop", "72 m²", "retail floor and rear store", "2026-04-09", 9],
  ["DEMO-PR-011", "Compact Family House – Sha'ab Area", 110000, "Sha'ab Area", 9.5581, 44.1112, 10, "sale", "available", "Residential house", "205 m²", "3 bedrooms, 2 bathrooms", "2026-05-20", 10],
  ["DEMO-PR-012", "Business Office – Hargeisa City Centre", 2200, "Hargeisa City Centre", 9.5629, 44.0778, 12, "rent", "rented", "Office", "210 m²", "open workspace and 5 offices", "2026-06-03", 11],
  ["DEMO-PR-013", "Serviced Apartment – Pepsi Area", 780, "Pepsi Area", 9.5513, 44.0971, 11, "rent", "available", "Apartment", "118 m²", "3 bedrooms, 2 bathrooms", "2026-07-16", 2],
  ["DEMO-PR-014", "Roadside Commercial Building – Airport Road", 420000, "Airport Road", 9.5205, 44.1262, 13, "sale", "sold", "Commercial building", "720 m²", "8 retail and office units", "2026-01-28", 5],
  ["DEMO-PR-015", "Residential Plot – Daarasalaam", 48000, "Daarasalaam", 9.6042, 44.1187, 14, "sale", "available", "Vacant land", "600 m²", "surveyed corner plot", "2026-02-14", 11],
  ["DEMO-PR-016", "Three-Bedroom Rental House – Jigjiga Yar", 900, "Jigjiga Yar", 9.5761, 44.0525, 0, "rent", "rented", "Residential house", "225 m²", "3 bedrooms, 2 bathrooms", "2026-03-18", 0],
  ["DEMO-PR-017", "Mixed-Use Building – New Hargeisa", 365000, "New Hargeisa", 9.5444, 44.0677, 1, "sale", "sold", "Commercial building", "610 m²", "4 shops plus 2 apartments", "2026-04-27", 1],
  ["DEMO-PR-018", "Small Office – 26 June", 88000, "26 June", 9.5668, 44.0839, 4, "sale", "available", "Office", "78 m²", "reception plus 2 offices", "2026-05-29", 3],
  ["DEMO-PR-019", "Secure Storage Warehouse – Maxamed Mooge", 1450, "Maxamed Mooge", 9.5158, 44.0921, 2, "rent", "rented", "Warehouse", "540 m²", "truck access and office room", "2026-06-24", 8],
  ["DEMO-PR-020", "Development Land – Masalaha", 82000, "Masalaha", 9.4949, 44.0968, 8, "sale", "available", "Vacant land", "1,200 m²", "level plot near an access road", "2026-08-02", 9],
].map(([reference, title, price, location, latitude, longitude, clientIndex, type, status, category, size, features, createdAt, imageIndex]) => ({
  reference,
  title: `[${reference}] ${title}`,
  price,
  location,
  latitude,
  longitude,
  clientIndex,
  type,
  status,
  createdAt,
  imageIndex,
  description: `${DEMO_PREFIX} Fictional ${category.toLowerCase()} listing for university demonstration. Reference: ${reference}. Address: ${location}, Hargeisa (area-level only). Size: ${size}; ${features}. ${type === "rent" ? "Price shown is the monthly rent in USD." : "Price shown is the fictional assessed/listing value in USD."} Registration date: ${createdAt}.`,
}));

const imageFiles = [
  "demo-house-modern.jpg", "demo-house-estate.jpg", "demo-apartment-brown.jpg", "demo-apartment-aimco.jpg",
  "demo-commercial-centre.jpg", "demo-shop-exterior.jpg", "demo-office-cummins.jpg", "demo-office-dulles.jpg",
  "demo-warehouse-cold-storage.jpg", "demo-warehouse-municipal.jpg", "demo-land-buffalo.jpg", "demo-land-detroit.jpg",
];

function connectionOptions() {
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

async function resetDemo(connection) {
  const [propertyRows] = await connection.query("SELECT id FROM properties WHERE title LIKE '[DEMO-PR-%'");
  const [clientRows] = await connection.query("SELECT id FROM clients WHERE email LIKE 'demo.owner%@example.com'");
  const [userRows] = await connection.query("SELECT id FROM users WHERE username LIKE 'demo\\_%'");
  const propertyIds = propertyRows.map((row) => row.id);
  const clientIds = clientRows.map((row) => row.id);
  const userIds = userRows.map((row) => row.id);

  await connection.query("DELETE FROM activity_logs WHERE description LIKE '[DEMO]%' ESCAPE '='");
  if (propertyIds.length) {
    await connection.query("DELETE FROM notifications WHERE related_property_id IN (?) OR message LIKE '%[DEMO-PR-%'", [propertyIds]);
    await connection.query("DELETE FROM properties WHERE id IN (?)", [propertyIds]);
  }
  if (clientIds.length) await connection.query("DELETE FROM clients WHERE id IN (?)", [clientIds]);
  if (userIds.length) await connection.query("DELETE FROM users WHERE id IN (?)", [userIds]);

  return { users: userIds.length, clients: clientIds.length, properties: propertyIds.length };
}

async function seedDemo(connection) {
  const [[admin]] = await connection.query("SELECT id FROM users WHERE role = 'admin' AND is_active = 1 ORDER BY id LIMIT 1");
  if (!admin) throw new Error("An active administrator is required before demo seeding.");

  for (const user of demoUsers) {
    const passwordHash = await bcrypt.hash(user.password, 12);
    const [existing] = await connection.query("SELECT id FROM users WHERE username = ? LIMIT 1", [user.username]);
    if (existing.length) {
      await connection.query(
        "UPDATE users SET full_name = ?, email = ?, password_hash = ?, role = ?, is_active = 1 WHERE id = ?",
        [user.fullName, user.email, passwordHash, user.role, existing[0].id]
      );
    } else {
      await connection.query(
        "INSERT INTO users (full_name, username, email, password_hash, role, created_by, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)",
        [user.fullName, user.username, user.email, passwordHash, user.role, admin.id]
      );
    }
  }

  const clientIds = [];
  for (const client of clients) {
    const [existing] = await connection.query("SELECT id FROM clients WHERE email = ? LIMIT 1", [client.email]);
    if (existing.length) {
      await connection.query(
        "UPDATE clients SET full_name = ?, phone = ?, address = ?, notes = ?, created_by = ? WHERE id = ?",
        [client.fullName, client.phone, client.address, client.notes, admin.id, existing[0].id]
      );
      clientIds.push(existing[0].id);
    } else {
      const [result] = await connection.query(
        "INSERT INTO clients (full_name, phone, email, address, notes, created_by) VALUES (?, ?, ?, ?, ?, ?)",
        [client.fullName, client.phone, client.email, client.address, client.notes, admin.id]
      );
      clientIds.push(result.insertId);
    }
  }

  const propertyIds = [];
  for (const property of properties) {
    const values = [property.description, property.price, property.location, property.latitude, property.longitude, clientIds[property.clientIndex], property.type, property.status, admin.id, property.createdAt];
    const [existing] = await connection.query("SELECT id FROM properties WHERE title = ? LIMIT 1", [property.title]);
    let propertyId;
    if (existing.length) {
      propertyId = existing[0].id;
      await connection.query(
        "UPDATE properties SET description = ?, price = ?, location = ?, latitude = ?, longitude = ?, client_id = ?, type = ?, status = ?, created_by = ?, created_at = ? WHERE id = ?",
        [...values, propertyId]
      );
    } else {
      const [result] = await connection.query(
        "INSERT INTO properties (title, description, price, location, latitude, longitude, client_id, type, status, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [property.title, ...values]
      );
      propertyId = result.insertId;
    }
    propertyIds.push(propertyId);
    const imageUrl = `/demo-images/properties/${imageFiles[property.imageIndex]}`;
    await connection.query("DELETE FROM property_images WHERE property_id = ? AND url LIKE '/demo-images/properties/%'", [propertyId]);
    await connection.query("INSERT INTO property_images (property_id, url, created_at) VALUES (?, ?, ?)", [propertyId, imageUrl, property.createdAt]);
  }

  await connection.query("DELETE FROM activity_logs WHERE description LIKE '[DEMO]%' ESCAPE '='");
  for (let index = 0; index < clients.length; index += 1) {
    await connection.query(
      "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, ip_address, created_at) VALUES (?, 'client_created', 'client', ?, ?, '127.0.0.1', ?)",
      [admin.id, clientIds[index], `${DEMO_PREFIX} Demo seeder registered fictional client "${clients[index].fullName}"`, `${properties[index % properties.length].createdAt} 09:00:00`]
    );
  }
  for (let index = 0; index < properties.length; index += 1) {
    await connection.query(
      "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, ip_address, created_at) VALUES (?, 'property_created', 'property', ?, ?, '127.0.0.1', ?)",
      [admin.id, propertyIds[index], `${DEMO_PREFIX} Demo seeder created or refreshed ${properties[index].reference}`, `${properties[index].createdAt} 10:00:00`]
    );
  }

  return { users: demoUsers.length, clients: clients.length, properties: properties.length };
}

async function main() {
  const connection = await mysql.createConnection(connectionOptions());
  try {
    await connection.beginTransaction();
    const result = process.argv.includes("--reset") ? await resetDemo(connection) : await seedDemo(connection);
    await connection.commit();
    console.log(`${process.argv.includes("--reset") ? "Removed" : "Seeded"} demo records: ${result.users} users, ${result.clients} clients, ${result.properties} properties.`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Demo seeding failed:", error.message);
  process.exit(1);
});
