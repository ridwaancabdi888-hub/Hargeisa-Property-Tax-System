import { useEffect, useState } from "react";
import { FileText, FileSpreadsheet, Download, Building2, Tag, CheckCircle2 } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import FilterSelect from "../components/ui/FilterSelect";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { getCsvExportUrl, getExcelExportUrl, getPropertyCounts } from "../lib/propertiesApi";
import type { ListingType } from "../types/property";

const typeOptions = ["All Types", "rent", "sale"];

export default function ReportsAnalytics() {
  const [type, setType] = useState(typeOptions[0]);
  const [counts, setCounts] = useState<{ total: number; available: number; sold: number } | null>(null);

  useEffect(() => {
    getPropertyCounts().then((res) => {
      setCounts({ total: res.data.total, available: res.data.available, sold: res.data.sold });
    });
  }, []);

  const reportParams = { type: type === "All Types" ? undefined : (type as ListingType) };

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate property portfolio reports for municipal review"
        action={
          <a href={getCsvExportUrl({})}>
            <Button variant="secondary" icon={<Download size={15} />}>
              Export Document
            </Button>
          </a>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Property Type Report" subtitle="Generate a filtered listing report by rent or sale">
          <div className="flex flex-col gap-3 sm:flex-row">
            <FilterSelect className="flex-1 capitalize" options={typeOptions} value={type} onChange={(e) => setType(e.target.value)} />
            <a href={getExcelExportUrl(reportParams)}>
              <Button icon={<FileText size={15} />}>Generate Report</Button>
            </a>
          </div>
        </Card>

        <Card title="Full Portfolio Audit" subtitle="Complete export of every property listing">
          <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FileSpreadsheet size={18} />
            </span>
            <p className="text-sm text-slate-500">Full Excel export of all properties</p>
            <a href={getExcelExportUrl({})}>
              <Button variant="secondary" className="mt-1">
                Generate Audit
              </Button>
            </a>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {counts ? (
          <>
            <StatCard label="Total Properties" value={String(counts.total)} icon={Building2} />
            <StatCard label="Available" value={String(counts.available)} icon={Tag} />
            <StatCard label="Sold" value={String(counts.sold)} icon={CheckCircle2} />
          </>
        ) : (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        )}
      </div>
    </div>
  );
}
