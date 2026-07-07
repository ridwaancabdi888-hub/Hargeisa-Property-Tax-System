import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import PageHeader from "../components/ui/PageHeader";
import SearchInput from "../components/ui/SearchInput";
import FilterSelect from "../components/ui/FilterSelect";
import { listProperties } from "../lib/propertiesApi";
import type { ListingStatus, PropertyListing } from "../types/property";

const statusColors: Record<ListingStatus, string> = {
  available: "#10b981",
  rented: "#f59e0b",
  sold: "#94a3b8",
};

const typeOptions = ["All Types", "rent", "sale"];
const statusOptions = ["All Statuses", "available", "sold", "rented"];

const HARGEISA_CENTER: [number, number] = [9.5624, 44.077];

// Deterministic pseudo-random offset (±~0.03°, roughly ±3km) so a property
// without real coordinates still gets a stable, distinct pin near Hargeisa
// instead of disappearing from the map entirely.
function approximateLocation(id: number): [number, number] {
  const angle = (id * 137.508) % 360; // golden-angle spread, avoids clustering
  const radius = 0.005 + ((id * 9301 + 49297) % 233280) / 233280 / 40;
  const rad = (angle * Math.PI) / 180;
  return [HARGEISA_CENTER[0] + radius * Math.cos(rad), HARGEISA_CENTER[1] + radius * Math.sin(rad)];
}

interface MappedProperty extends PropertyListing {
  mapPosition: [number, number];
  isApproximate: boolean;
}

export default function GISMap() {
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("All Types");
  const [status, setStatus] = useState("All Statuses");

  useEffect(() => {
    listProperties({ limit: 100 })
      .then((res) => setProperties(res.data))
      .catch(() => setError("Failed to load properties. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  const mappable: MappedProperty[] = useMemo(
    () =>
      properties.map((p) => ({
        ...p,
        mapPosition: p.latitude !== null && p.longitude !== null ? [p.latitude, p.longitude] : approximateLocation(p.id),
        isApproximate: p.latitude === null || p.longitude === null,
      })),
    [properties]
  );

  const filtered = useMemo(() => {
    return mappable.filter((p) => {
      const matchesSearch =
        search.trim() === "" ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase());
      const matchesType = type === "All Types" || p.type === type;
      const matchesStatus = status === "All Statuses" || p.status === status;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [mappable, search, type, status]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="GIS Map" subtitle="Geospatial mapping of marked property listings across Hargeisa" />

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <SearchInput
              placeholder="Search by title or location"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="mt-3 space-y-3">
              <FilterSelect className="w-full capitalize" options={typeOptions} value={type} onChange={(e) => setType(e.target.value)} />
              <FilterSelect className="w-full capitalize" options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value)} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Status</h3>
            <ul className="space-y-2">
              {(Object.keys(statusColors) as ListingStatus[]).map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm capitalize text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColors[s] }} />
                  {s}
                </li>
              ))}
            </ul>
            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
            <p className="mt-3 text-xs text-slate-500">
              Showing {filtered.length} of {properties.length} properties
              {mappable.some((p) => p.isApproximate) && (
                <> &middot; pins with a dashed ring are approximate (no exact coordinates set yet)</>
              )}
            </p>
          </div>
        </div>

        <div className="min-h-[500px] overflow-hidden rounded-xl border border-slate-200 shadow-card lg:col-span-3">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading map...</div>
          ) : (
            <MapContainer center={HARGEISA_CENTER} zoom={13} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filtered.map((p) => (
                <CircleMarker
                  key={p.id}
                  center={p.mapPosition}
                  radius={9}
                  pathOptions={{
                    color: "#fff",
                    weight: 2,
                    fillColor: statusColors[p.status],
                    fillOpacity: p.isApproximate ? 0.55 : 0.9,
                    dashArray: p.isApproximate ? "3,2" : undefined,
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <p className="font-semibold">{p.title}</p>
                      <p>{p.location}</p>
                      <p className="mt-1 text-slate-500">
                        {p.type === "sale" ? "Sale" : "Rent"} &middot; {p.status}
                      </p>
                      <p className="mt-1 font-medium">${p.price.toLocaleString()}</p>
                      {p.isApproximate && <p className="mt-1 text-amber-600">Approximate location — no exact coordinates set</p>}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
