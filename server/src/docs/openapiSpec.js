const successEnvelope = (dataSchema, metaExample = null) => ({
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string", example: "Request successful" },
    data: dataSchema,
    meta: { type: "object", nullable: true, example: metaExample },
  },
});

const errorEnvelope = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string", example: "Something went wrong" },
  },
};

const cookieAuth = { cookieAuth: [] };

const userSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 1 },
    fullName: { type: "string", example: "System Administrator" },
    username: { type: "string", example: "admin" },
    email: { type: "string", example: "admin@hargeisatax.gov.so" },
    role: { type: "string", enum: ["admin", "agent", "viewer"], example: "admin" },
    avatarUrl: { type: "string", nullable: true, example: null },
    createdAt: { type: "string", example: "2026-01-01 12:00:00" },
  },
};

const propertySchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 12 },
    title: { type: "string", example: "Sunset Villa" },
    description: { type: "string", example: "Spacious villa near the coast" },
    price: { type: "number", example: 250000 },
    location: { type: "string", example: "Jigjiga Yar" },
    latitude: { type: "number", nullable: true, example: 9.5624 },
    longitude: { type: "number", nullable: true, example: 44.077 },
    type: { type: "string", enum: ["rent", "sale"], example: "sale" },
    status: { type: "string", enum: ["available", "sold", "rented"], example: "available" },
    createdBy: { type: "integer", nullable: true, example: 1 },
    createdAt: { type: "string", example: "2026-01-01 12:00:00" },
    updatedAt: { type: "string", example: "2026-01-01 12:00:00" },
  },
};

const notificationSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 5 },
    type: { type: "string", example: "property_created" },
    message: { type: "string", example: '"Sunset Villa" was added to the property listings' },
    relatedPropertyId: { type: "integer", nullable: true, example: 12 },
    isRead: { type: "boolean", example: false },
    createdAt: { type: "string", example: "2026-01-01 12:00:00" },
  },
};

const settingsSchema = {
  type: "object",
  properties: {
    theme: { type: "string", enum: ["light", "dark"], example: "light" },
    language: { type: "string", example: "en" },
    timezone: { type: "string", example: "Africa/Mogadishu" },
    dateFormat: { type: "string", enum: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"], example: "MM/DD/YYYY" },
    notifyPropertyCreated: { type: "boolean", example: true },
    notifyPropertySold: { type: "boolean", example: true },
    notifyPropertyDeleted: { type: "boolean", example: true },
    updatedAt: { type: "string", example: "2026-01-01 12:00:00" },
  },
};

const activityLogSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 42 },
    userId: { type: "integer", nullable: true, example: 1 },
    userFullName: { type: "string", nullable: true, example: "System Administrator" },
    userUsername: { type: "string", nullable: true, example: "admin" },
    action: { type: "string", example: "property_updated" },
    entityType: { type: "string", nullable: true, example: "property" },
    entityId: { type: "integer", nullable: true, example: 12 },
    description: { type: "string", example: 'Updated property "Sunset Villa"' },
    oldValues: { type: "object", nullable: true },
    newValues: { type: "object", nullable: true },
    ipAddress: { type: "string", nullable: true, example: "::1" },
    createdAt: { type: "string", example: "2026-01-01 12:00:00" },
  },
};

const backupSchema = {
  type: "object",
  properties: {
    filename: { type: "string", example: "backup-1783291457086.sql" },
    sizeBytes: { type: "integer", example: 89935 },
    createdAt: { type: "string", example: "2026-01-01T12:00:00.000Z" },
  },
};

const paginationMeta = {
  total: 42,
  totalPages: 5,
  currentPage: 1,
  limit: 10,
};

module.exports = {
  openapi: "3.0.3",
  info: {
    title: "Hargeisa Tax — Property Management API",
    version: "1.0.0",
    description:
      "REST API for the Hargeisa Tax property management system: authentication, RBAC, property CRUD with " +
      "image uploads, analytics, notifications, profile/settings, activity logs, exports, and backup/restore.",
  },
  servers: [{ url: "/api", description: "Same-origin API (proxied by the frontend dev server / nginx in production)" }],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "htax_token",
        description: "httpOnly JWT session cookie set by POST /auth/login.",
      },
    },
  },
  tags: [
    { name: "Authentication" },
    { name: "Users" },
    { name: "Properties" },
    { name: "Analytics" },
    { name: "Notifications" },
    { name: "Profile" },
    { name: "Settings" },
    { name: "Activity Logs" },
    { name: "Backups" },
  ],
  paths: {
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Log in",
        description: "Verifies credentials and sets an httpOnly JWT session cookie. Rate-limited (10 attempts/15min/IP).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: { username: { type: "string", example: "admin" }, password: { type: "string", example: "Admin@12345" } },
              },
            },
          },
        },
        responses: {
          200: { description: "Login succeeded", content: { "application/json": { schema: successEnvelope(userSchema) } } },
          401: { description: "Invalid credentials", content: { "application/json": { schema: errorEnvelope } } },
          429: { description: "Too many login attempts", content: { "application/json": { schema: errorEnvelope } } },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Log out",
        description: "Clears the session cookie. Always succeeds, even with an invalid/expired cookie.",
        responses: { 200: { description: "Logged out" } },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get the current session's user",
        security: [cookieAuth],
        responses: {
          200: { description: "Current user", content: { "application/json": { schema: successEnvelope(userSchema) } } },
          401: { description: "Not authenticated", content: { "application/json": { schema: errorEnvelope } } },
        },
      },
    },
    "/users": {
      post: {
        tags: ["Users"],
        summary: "Create an agent/viewer account (admin only)",
        security: [cookieAuth],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullName", "username", "email", "password"],
                properties: {
                  fullName: { type: "string", example: "Jane Agent" },
                  username: { type: "string", example: "jane_agent" },
                  email: { type: "string", example: "jane@hargeisatax.gov.so" },
                  password: { type: "string", example: "StrongPass1" },
                  role: { type: "string", enum: ["agent", "viewer"], example: "agent", description: "Defaults to 'agent'. Never allows 'admin'." },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Account created", content: { "application/json": { schema: successEnvelope(userSchema) } } },
          403: { description: "Only admins may create accounts", content: { "application/json": { schema: errorEnvelope } } },
          409: { description: "Username or email already in use", content: { "application/json": { schema: errorEnvelope } } },
        },
      },
    },
    "/property-listings": {
      get: {
        tags: ["Properties"],
        summary: "List properties (search, filter, paginate)",
        security: [cookieAuth],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 100 } },
          { name: "search", in: "query", schema: { type: "string" }, description: "Partial, case-insensitive match on title/location" },
          { name: "type", in: "query", schema: { type: "string", enum: ["rent", "sale"] } },
          { name: "status", in: "query", schema: { type: "string", enum: ["available", "sold", "rented"] } },
          { name: "min_price", in: "query", schema: { type: "number" } },
          { name: "max_price", in: "query", schema: { type: "number" } },
        ],
        responses: {
          200: {
            description: "Paginated property list",
            content: { "application/json": { schema: successEnvelope({ type: "array", items: propertySchema }, paginationMeta) } },
          },
        },
      },
      post: {
        tags: ["Properties"],
        summary: "Create a property (admin/agent)",
        security: [cookieAuth],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description", "price", "location", "type"],
                properties: {
                  title: { type: "string", example: "Sunset Villa" },
                  description: { type: "string", example: "Spacious villa near the coast" },
                  price: { type: "number", example: 250000 },
                  location: { type: "string", example: "Jigjiga Yar" },
                  latitude: { type: "number", nullable: true, example: 9.5624 },
                  longitude: { type: "number", nullable: true, example: 44.077 },
                  type: { type: "string", enum: ["rent", "sale"], example: "sale" },
                  status: { type: "string", enum: ["available", "sold", "rented"], example: "available" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Created", content: { "application/json": { schema: successEnvelope(propertySchema) } } },
          403: { description: "Viewers cannot create properties", content: { "application/json": { schema: errorEnvelope } } },
        },
      },
    },
    "/property-listings/counts": {
      get: {
        tags: ["Properties"],
        summary: "Aggregate property counts (total, by status, by type, assessed value) in a single query",
        security: [cookieAuth],
        responses: {
          200: {
            description: "Counts",
            content: {
              "application/json": {
                schema: successEnvelope({
                  type: "object",
                  properties: {
                    total: { type: "integer", example: 42 },
                    available: { type: "integer", example: 20 },
                    sold: { type: "integer", example: 12 },
                    rented: { type: "integer", example: 10 },
                    rent: { type: "integer", example: 18 },
                    sale: { type: "integer", example: 24 },
                    assessedValue: { type: "number", example: 4250000 },
                  },
                }),
              },
            },
          },
        },
      },
    },
    "/property-listings/export/csv": {
      get: { tags: ["Properties"], summary: "Export the filtered property list as CSV", security: [cookieAuth], responses: { 200: { description: "CSV file", content: { "text/csv": {} } } } },
    },
    "/property-listings/export/excel": {
      get: { tags: ["Properties"], summary: "Export the filtered property list as an Excel workbook", security: [cookieAuth], responses: { 200: { description: "XLSX file", content: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {} } } } },
    },
    "/property-listings/{id}": {
      get: {
        tags: ["Properties"],
        summary: "Get a property by id (includes images)",
        security: [cookieAuth],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Property with images", content: { "application/json": { schema: successEnvelope({ allOf: [propertySchema, { type: "object", properties: { images: { type: "array", items: { type: "object" } } } }] }) } } },
          404: { description: "Not found", content: { "application/json": { schema: errorEnvelope } } },
        },
      },
      put: {
        tags: ["Properties"],
        summary: "Update a property (admin/agent)",
        security: [cookieAuth],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Updated", content: { "application/json": { schema: successEnvelope(propertySchema) } } } },
      },
      delete: {
        tags: ["Properties"],
        summary: "Delete a property (admin only)",
        security: [cookieAuth],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Deleted" }, 403: { description: "Only admins may delete", content: { "application/json": { schema: errorEnvelope } } } },
      },
    },
    "/property-listings/{id}/tax-bill": {
      get: {
        tags: ["Properties"],
        summary: "Generate a property tax bill as PDF (illustrative flat-rate assessment)",
        security: [cookieAuth],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "PDF tax bill", content: { "application/pdf": {} } },
          404: { description: "Not found", content: { "application/json": { schema: errorEnvelope } } },
        },
      },
    },
    "/property-listings/{id}/images": {
      post: {
        tags: ["Properties"],
        summary: "Upload one or more images to a property (admin/agent)",
        security: [cookieAuth],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { images: { type: "array", items: { type: "string", format: "binary" } } } } } } },
        responses: {
          201: { description: "Images uploaded" },
          400: { description: "Invalid mimetype (only jpg/png/webp) or file too large (>5MB)", content: { "application/json": { schema: errorEnvelope } } },
        },
      },
    },
    "/property-listings/{id}/images/{imageId}": {
      delete: { tags: ["Properties"], summary: "Delete a property image", security: [cookieAuth], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }, { name: "imageId", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Deleted" } } },
    },
    "/analytics": {
      get: {
        tags: ["Analytics"],
        summary: "Portfolio analytics overview (admin only)",
        security: [cookieAuth],
        responses: {
          200: {
            description: "Aggregate analytics",
            content: {
              "application/json": {
                schema: successEnvelope({
                  type: "object",
                  properties: {
                    totals: { type: "object", properties: { total: { type: "integer" }, available: { type: "integer" }, sold: { type: "integer" }, rented: { type: "integer" } } },
                    revenue: { type: "number", example: 500000 },
                    byType: { type: "array", items: { type: "object", properties: { type: { type: "string" }, count: { type: "integer" } } } },
                    monthlyTrend: { type: "array", items: { type: "object", properties: { month: { type: "string", example: "2026-01" }, count: { type: "integer" } } } },
                  },
                }),
              },
            },
          },
          403: { description: "Only admins may view analytics", content: { "application/json": { schema: errorEnvelope } } },
        },
      },
    },
    "/analytics/export/pdf": {
      get: { tags: ["Analytics"], summary: "Export the analytics overview as a PDF report (admin only)", security: [cookieAuth], responses: { 200: { description: "PDF file", content: { "application/pdf": {} } } } },
    },
    "/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "List recent notifications for the current user",
        security: [cookieAuth],
        responses: { 200: { description: "Notifications with unread count", content: { "application/json": { schema: successEnvelope({ type: "array", items: notificationSchema }, { unreadCount: 3 }) } } } },
      },
    },
    "/notifications/{id}/read": {
      post: { tags: ["Notifications"], summary: "Mark a notification as read", security: [cookieAuth], parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "Marked as read" } } },
    },
    "/profile": {
      patch: {
        tags: ["Profile"],
        summary: "Update the current user's full name/email",
        security: [cookieAuth],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["fullName", "email"], properties: { fullName: { type: "string" }, email: { type: "string" } } } } } },
        responses: {
          200: { description: "Updated", content: { "application/json": { schema: successEnvelope(userSchema) } } },
          409: { description: "Email already in use", content: { "application/json": { schema: errorEnvelope } } },
        },
      },
    },
    "/profile/password": {
      patch: {
        tags: ["Profile"],
        summary: "Change the current user's password",
        security: [cookieAuth],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: { currentPassword: { type: "string" }, newPassword: { type: "string", description: "Min 8 chars, upper+lower+digit" } },
              },
            },
          },
        },
        responses: {
          200: { description: "Password changed" },
          401: { description: "Current password incorrect", content: { "application/json": { schema: errorEnvelope } } },
        },
      },
    },
    "/profile/avatar": {
      post: {
        tags: ["Profile"],
        summary: "Upload a profile picture",
        security: [cookieAuth],
        requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { avatar: { type: "string", format: "binary" } } } } } },
        responses: { 200: { description: "Uploaded", content: { "application/json": { schema: successEnvelope(userSchema) } } } },
      },
      delete: { tags: ["Profile"], summary: "Remove the profile picture", security: [cookieAuth], responses: { 200: { description: "Removed" } } },
    },
    "/settings": {
      get: { tags: ["Settings"], summary: "Get the current user's settings (created with defaults on first access)", security: [cookieAuth], responses: { 200: { description: "Settings", content: { "application/json": { schema: successEnvelope(settingsSchema) } } } } },
      put: {
        tags: ["Settings"],
        summary: "Update the current user's settings",
        security: [cookieAuth],
        requestBody: { required: false, content: { "application/json": { schema: settingsSchema } } },
        responses: { 200: { description: "Updated", content: { "application/json": { schema: successEnvelope(settingsSchema) } } } },
      },
    },
    "/activity-logs": {
      get: {
        tags: ["Activity Logs"],
        summary: "List activity/audit log entries (admin only)",
        security: [cookieAuth],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "action", in: "query", schema: { type: "string" } },
          { name: "userId", in: "query", schema: { type: "integer" } },
          { name: "date_from", in: "query", schema: { type: "string", format: "date" } },
          { name: "date_to", in: "query", schema: { type: "string", format: "date" } },
        ],
        responses: {
          200: { description: "Paginated activity log", content: { "application/json": { schema: successEnvelope({ type: "array", items: activityLogSchema }, paginationMeta) } } },
          403: { description: "Only admins may view activity logs", content: { "application/json": { schema: errorEnvelope } } },
        },
      },
    },
    "/backups": {
      get: { tags: ["Backups"], summary: "List stored backups (admin only)", security: [cookieAuth], responses: { 200: { description: "Backups", content: { "application/json": { schema: successEnvelope({ type: "array", items: backupSchema }) } } } } },
      post: { tags: ["Backups"], summary: "Create a new backup via mysqldump (admin only)", security: [cookieAuth], responses: { 201: { description: "Backup created", content: { "application/json": { schema: successEnvelope(backupSchema) } } } } },
    },
    "/backups/{filename}/download": {
      get: { tags: ["Backups"], summary: "Download a stored backup file", security: [cookieAuth], parameters: [{ name: "filename", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "SQL dump file" }, 404: { description: "Not found" } } },
    },
    "/backups/restore": {
      post: {
        tags: ["Backups"],
        summary: "Restore the database from an uploaded .sql file (admin only, destructive)",
        description: "Automatically takes a fresh safety backup before restoring. Replaces all current data with the uploaded dump's contents.",
        security: [cookieAuth],
        requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { backup: { type: "string", format: "binary" } } } } } },
        responses: { 200: { description: "Restored", content: { "application/json": { schema: successEnvelope({ type: "object", properties: { safetyBackup: { type: "string" } } }) } } } },
      },
    },
  },
};
