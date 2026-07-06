import { useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import PageHeader from "../components/ui/PageHeader";
import SearchInput from "../components/ui/SearchInput";
import FilterSelect from "../components/ui/FilterSelect";
import { districts, properties } from "../data/mockData";
import type { PropertyType } from "../types";

const typeColors: Record<PropertyType, string> = {
  Residential: "#2563eb",
  Commercial: "#dc2626",
  Industrial: "#d97706",
  "Vacant Land": "#64748b",
};

const typeOptions = ["All Types", "Residential", "Commercial", "Industrial", "Vacant Land"];
const districtOptions = ["All Districts", ...districts.map((d) => d.name)];

export default function GISMap() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All Types");
  const [district, setDistrict] = useState("All Districts");

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch =
        search.trim() === "" ||
        p.owner.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase());
      const matchesType = type === "All Types" || p.type === type;
      const matchesDistrict = district === "All Districts" || p.district === district;
      return matchesSearch && matchesType && matchesDistrict;
    });
  }, [search, type, district]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="GIS Map" subtitle="Geospatial ownership and property mapping across Hargeisa" />

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <SearchInput
              placeholder="Search by address or property ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="mt-3 space-y-3">
              <FilterSelect
                className="w-full"
                options={districtOptions}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
              <FilterSelect className="w-full" options={typeOptions} value={type} onChange={(e) => setType(e.target.value)} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Property Type</h3>
            <ul className="space-y-2">
              {(Object.keys(typeColors) as PropertyType[]).map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: typeColors[t] }} />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">Showing {filtered.length} of {properties.length} properties</p>
          </div>
        </div>

        <div className="min-h-[500px] overflow-hidden rounded-xl border border-slate-200 shadow-card lg:col-span-3">
          <MapContainer center={[9.5624, 44.077]} zoom={13} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map((p) => (
              <CircleMarker
                key={p.id}
                center={[p.lat, p.lng]}
                radius={9}
                pathOptions={{
                  color: "#fff",
                  weight: 2,
                  fillColor: typeColors[p.type],
                  fillOpacity: 0.9,
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <p className="font-semibold">{p.id}</p>
                    <p>{p.owner}</p>
                    <p>{p.address}</p>
                    <p className="mt-1 text-slate-500">{p.type} &middot; {p.status}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
