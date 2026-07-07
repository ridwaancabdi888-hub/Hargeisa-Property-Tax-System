import { useState } from "react";
import { X } from "lucide-react";
import Button from "../ui/Button";
import FilterSelect from "../ui/FilterSelect";
import { ApiError } from "../../lib/api";
import type { CreateUserValues } from "../../types/user";

interface CreateUserModalProps {
  onSubmit: (values: CreateUserValues) => Promise<void>;
  onClose: () => void;
}

type FormErrors = Partial<Record<keyof CreateUserValues, string>>;

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

function validate(values: CreateUserValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.fullName.trim()) errors.fullName = "Full name is required";
  if (values.username.trim().length < 3 || values.username.trim().length > 50) {
    errors.username = "Username must be 3-50 characters";
  }
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "A valid email is required";
  if (values.password.length < 8 || !STRONG_PASSWORD_REGEX.test(values.password)) {
    errors.password = "Password must be at least 8 characters with an uppercase letter, lowercase letter, and number";
  }
  return errors;
}

export default function CreateUserModal({ onSubmit, onClose }: CreateUserModalProps) {
  const [values, setValues] = useState<CreateUserValues>({ fullName: "", username: "", email: "", password: "", role: "agent" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof CreateUserValues>(key: K, value: CreateUserValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setFormError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-card">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-base font-semibold text-slate-900">Add User</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {formError && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{formError}</div>}

          <div>
            <label htmlFor="user-fullname" className="mb-1.5 block text-xs font-medium text-slate-600">Full Name</label>
            <input
              id="user-fullname"
              type="text"
              value={values.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="user-username" className="mb-1.5 block text-xs font-medium text-slate-600">Username</label>
            <input
              id="user-username"
              type="text"
              value={values.username}
              onChange={(e) => update("username", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
            />
            {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
          </div>

          <div>
            <label htmlFor="user-email" className="mb-1.5 block text-xs font-medium text-slate-600">Email</label>
            <input
              id="user-email"
              type="email"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="user-password" className="mb-1.5 block text-xs font-medium text-slate-600">Password</label>
            <input
              id="user-password"
              type="password"
              value={values.password}
              onChange={(e) => update("password", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Role</label>
            <FilterSelect
              className="w-full capitalize"
              options={["agent", "viewer"]}
              value={values.role}
              onChange={(e) => update("role", e.target.value as CreateUserValues["role"])}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
