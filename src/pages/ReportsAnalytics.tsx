import { useEffect, useState } from "react";
import { FileText, FileSpreadsheet, Download, Building2, Tag, CheckCircle2 } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import FilterSelect from "../components/ui/FilterSelect";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { getCsvExportUrl, getExcelExportUrl, getPropertyCounts } from "../lib/propertiesApi";
import { useTranslation } from "../lib/i18n/useTranslation";
import type { ListingType } from "../types/property";

const typeOptions = ["All Types", "rent", "sale"];

export default function ReportsAnalytics() {
  const { t } = useTranslation();
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
        title={t.pages.reportsAnalytics.title}
        subtitle={t.pages.reportsAnalytics.subtitle}
        action={
          <a href={getCsvExportUrl({})}>
            <Button variant="secondary" icon={<Download size={15} />}>
              {t.pages.reportsAnalytics.exportDocument}
            </Button>
          </a>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title={t.pages.reportsAnalytics.propertyTypeReport} subtitle={t.pages.reportsAnalytics.propertyTypeReportSubtitle}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <FilterSelect className="flex-1 capitalize" options={typeOptions} value={type} onChange={(e) => setType(e.target.value)} />
            <a href={getExcelExportUrl(reportParams)}>
              <Button icon={<FileText size={15} />}>{t.pages.reportsAnalytics.generateReport}</Button>
            </a>
          </div>
        </Card>

        <Card title={t.pages.reportsAnalytics.fullPortfolioAudit} subtitle={t.pages.reportsAnalytics.fullPortfolioAuditSubtitle}>
          <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FileSpreadsheet size={18} />
            </span>
            <p className="text-sm text-slate-500">Full Excel export of all properties</p>
            <a href={getExcelExportUrl({})}>
              <Button variant="secondary" className="mt-1">
                {t.pages.reportsAnalytics.generateAudit}
              </Button>
            </a>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {counts ? (
          <>
            <StatCard label={t.pages.reportsAnalytics.totalProperties} value={String(counts.total)} icon={Building2} />
            <StatCard label={t.pages.reportsAnalytics.available} value={String(counts.available)} icon={Tag} />
            <StatCard label={t.pages.reportsAnalytics.sold} value={String(counts.sold)} icon={CheckCircle2} />
          </>
        ) : (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        )}
      </div>
    </div>
  );
}
