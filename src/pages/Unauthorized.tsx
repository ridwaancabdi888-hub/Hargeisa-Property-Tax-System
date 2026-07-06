import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert size={22} />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-slate-900">Access Restricted</h1>
        <p className="mt-2 text-sm text-slate-500">
          Your account does not have permission to view this page. Contact your system
          administrator if you believe this is a mistake.
        </p>
        <Button className="mt-6 w-full justify-center" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
