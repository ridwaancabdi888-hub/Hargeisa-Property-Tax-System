import {
  LayoutDashboard,
  Building2,
  Home,
  Landmark,
  Map,
  FileBarChart,
  BarChart3,
  Settings as SettingsIcon,
  ScrollText,
  DatabaseBackup,
  Users,
  Contact,
  LogOut,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../lib/i18n/useTranslation";
import type { TranslationDict } from "../../lib/i18n/translations";
import type { UserRole } from "../../types/auth";

const navItems: { to: string; navKey: keyof TranslationDict["nav"]; icon: typeof LayoutDashboard; roles?: UserRole[] }[] = [
  { to: "/dashboard", navKey: "dashboard", icon: LayoutDashboard },
  { to: "/properties", navKey: "propertyManagement", icon: Building2 },
  { to: "/property-listings", navKey: "properties", icon: Home },
  { to: "/clients", navKey: "clients", icon: Contact },
  { to: "/property-analytics", navKey: "analytics", icon: BarChart3, roles: ["admin"] },
  { to: "/tax-management", navKey: "taxManagement", icon: Landmark, roles: ["admin"] },
  { to: "/gis-map", navKey: "gisMap", icon: Map },
  { to: "/reports", navKey: "reports", icon: FileBarChart },
  { to: "/activity-log", navKey: "activityLog", icon: ScrollText, roles: ["admin"] },
  { to: "/user-management", navKey: "userManagement", icon: Users, roles: ["admin"] },
  { to: "/backups", navKey: "backups", icon: DatabaseBackup, roles: ["admin"] },
  { to: "/settings", navKey: "settings", icon: SettingsIcon },
];

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const visibleNavItems = navItems.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  const initials = user
    ? user.fullName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  async function handleLogout() {
    // Navigate away before clearing auth state — otherwise ProtectedRoute's own
    // redirect (with the current page stashed as `from`) can race this one and
    // leave a stale redirect target for the next login on this browser.
    navigate("/", { replace: true });
    await logout();
  }

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col bg-navy-950 text-slate-300 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Landmark size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Hargeisa Tax</p>
            <p className="text-[11px] text-slate-400">Municipal Portal</p>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="text-slate-400 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
          {visibleNavItems.map(({ to, navKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-blue-400 bg-white/10 text-white"
                    : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={17} />
              {t.nav[navKey]}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <NavLink to="/profile" onClick={onClose} className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-sm font-semibold text-white">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{user?.fullName}</p>
                <p className="truncate text-[11px] text-slate-400">{user ? t.roleLabel[user.role] : ""}</p>
              </div>
            </NavLink>
            <button type="button" aria-label={t.nav.logout} onClick={handleLogout} className="text-slate-400 hover:text-white">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
