import { useState } from "react";
import { Mail, Shield, User as UserIcon, CalendarClock, Pencil } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import AvatarUploader from "../components/profile/AvatarUploader";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { changePassword, deleteAvatar, updateProfile, uploadAvatar } from "../lib/profileApi";
import { ApiError } from "../lib/api";

const roleLabel: Record<string, string> = {
  admin: "Administrator",
  agent: "Agent",
  viewer: "Viewer",
};

export default function Profile() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  if (!user) return null;

  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fields = [
    { label: "Full Name", value: user.fullName, icon: UserIcon },
    { label: "Username", value: user.username, icon: UserIcon },
    { label: "Email Address", value: user.email, icon: Mail },
    { label: "Member Since", value: memberSince, icon: CalendarClock },
  ];

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setIsSavingProfile(true);
    try {
      const res = await updateProfile({ fullName, email });
      setUser(res.data);
      setIsEditing(false);
      showToast("Profile updated successfully");
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match");
      return;
    }
    setIsSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password changed successfully");
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Failed to change password.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    try {
      const res = await uploadAvatar(file);
      setUser(res.data);
      showToast("Profile picture updated successfully");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to upload profile picture.", "error");
    }
  }

  async function handleAvatarRemove() {
    try {
      const res = await deleteAvatar();
      setUser(res.data);
      showToast("Profile picture removed successfully");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to remove profile picture.", "error");
    }
  }

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Your account details and access level" />

      <Card className="max-w-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <AvatarUploader
              avatarUrl={user.avatarUrl}
              initials={initials}
              onUpload={handleAvatarUpload}
              onRemove={handleAvatarRemove}
            />
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{user.fullName}</p>
              <div className="mt-1 flex items-center gap-2">
                <Shield size={13} className="text-slate-400" />
                <StatusBadge status={roleLabel[user.role] ?? user.role} tone={user.role === "admin" ? "blue" : "slate"} />
              </div>
            </div>
          </div>
          {!isEditing && (
            <Button variant="secondary" icon={<Pencil size={14} />} onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>

        {isEditing ? (
          <form className="mt-5 space-y-4" onSubmit={handleSaveProfile}>
            {profileError && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{profileError}</div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setFullName(user.fullName);
                  setEmail(user.email);
                  setProfileError(null);
                }}
                disabled={isSavingProfile}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        ) : (
          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                  <Icon size={15} />
                </span>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-200">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        )}
      </Card>

      <Card title="Change Password" subtitle="Update the password used to sign in" className="mt-4 max-w-2xl">
        <form className="space-y-4" onSubmit={handleChangePassword}>
          {passwordError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{passwordError}</div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.
          </p>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSavingPassword}>
              {isSavingPassword ? "Saving..." : "Change Password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
