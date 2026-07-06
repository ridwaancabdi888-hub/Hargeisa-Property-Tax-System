import { useState } from "react";
import { FileText, ShieldCheck, Download, DollarSign, TrendingUp, Percent } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import FilterSelect from "../components/ui/FilterSelect";
import Button from "../components/ui/Button";
import { districts } from "../data/mockData";

const districtOptions = districts.map((d) => d.name);

export default function ReportsAnalytics() {
  const [district, setDistrict] = useState(districtOptions[0]);

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate financial and compliance reports for municipal review"
        action={<Button variant="secondary" icon={<Download size={15} />}>Export Document</Button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="District Financial Profile" subtitle="Generate a detailed assessment and collection summary">
          <div className="flex flex-col gap-3 sm:flex-row">
            <FilterSelect className="flex-1" options={districtOptions} value={district} onChange={(e) => setDistrict(e.target.value)} />
            <Button icon={<FileText size={15} />}>Generate Report</Button>
          </div>
        </Card>

        <Card title="Executive Municipal Audit" subtitle="Full audit across all districts and departments">
          <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ShieldCheck size={18} />
            </span>
            <p className="text-sm text-slate-500">No report generated yet</p>
            <Button variant="secondary" className="mt-1">
              Generate Audit
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={`${district} Assessed Value`} value="$2,775,625" icon={DollarSign} />
        <StatCard label="YTD Collection Efficiency" value="$11,056,125" icon={TrendingUp} />
        <StatCard label="Compliance Rate" value="36%" icon={Percent} delta={{ value: "4.1% vs last quarter", direction: "up" }} />
      </div>
    </div>
  );
}
