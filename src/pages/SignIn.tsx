import { Landmark, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
      const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-950">
            <Landmark size={22} className="text-white" />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-slate-900">Hargeisa Tax</h1>
          <p className="mt-1 text-sm text-slate-500">Property Tax Management System</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Sign in</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</div>
            )}

            <div>
              <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-slate-600">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-medium text-slate-600">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-navy-700 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-9 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300 text-navy-800 focus:ring-navy-700" />
              Remember this device
            </label>

            <Button type="submit" className="w-full justify-center" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign into Portal"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-400">
          Authorized municipal personnel only. Access is monitored and logged.
          <br />
          &copy; 2026 Hargeisa Municipal Government. All rights reserved. &middot; v2.3.1
          <br />
          <a href="#" className="font-medium text-slate-500 hover:underline">
            Having trouble signing in? Contact IT Support
          </a>
        </p>
      </div>
    </div>
  );
}
