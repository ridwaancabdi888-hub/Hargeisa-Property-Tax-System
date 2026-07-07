import { Landmark, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate, type Location } from "react-router-dom";
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
  const [isLit, setIsLit] = useState(false);

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4 py-10 transition-colors duration-700">
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          background: "radial-gradient(circle at 30% 45%, rgba(51,89,154,0.35), transparent 55%)",
          opacity: isLit ? 1 : 0.4,
        }}
      />

      <div className="relative w-full max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Hargeisa Tax</h1>
          <p className="mt-2 text-sm font-medium text-navy-500">Property Tax Management System</p>
        </div>

        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div className="hidden flex-col items-center justify-center md:flex">
            <button
              type="button"
              onClick={() => setIsLit((v) => !v)}
              aria-label={isLit ? "Dim the beacon" : "Light the beacon"}
              className={`flex h-32 w-32 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-700 ${
                isLit ? "bg-white shadow-[0_0_60px_18px_rgba(255,255,255,0.35)]" : "bg-white/10 animate-beacon-breathe"
              }`}
            >
              <Landmark size={48} className={`transition-colors duration-700 ${isLit ? "text-navy-900" : "text-white"}`} />
            </button>
            <p className="mt-4 text-xs font-medium text-navy-500">Tap the emblem</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-md">
            <h2 className="mb-5 text-lg font-semibold text-white">Welcome</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 ring-1 ring-inset ring-red-500/20">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-navy-500">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-medium text-navy-500">
                    Password
                  </label>
                  <a href="#" className="text-xs font-medium text-navy-500 hover:text-white hover:underline">
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
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 pr-9 text-sm text-white placeholder:text-white/30 focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-navy-500">
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-navy-600 focus:ring-navy-500" />
                Remember this device
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 shadow-lg shadow-black/20 transition-colors hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Sign into Portal"}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-navy-600">
          Authorized municipal personnel only. Access is monitored and logged.
          <br />
          &copy; 2026 Hargeisa Municipal Government. All rights reserved. &middot; v2.3.1
          <br />
          <a href="#" className="font-medium text-navy-500 hover:text-white hover:underline">
            Having trouble signing in? Contact IT Support
          </a>
        </p>
      </div>
    </div>
  );
}
