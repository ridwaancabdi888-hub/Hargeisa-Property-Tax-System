import { useState } from "react";
import { X } from "lucide-react";
import Button from "../ui/Button";
import { ApiError } from "../../lib/api";
import type { Client, ClientFormValues } from "../../types/client";

interface ClientFormModalProps {
  client?: Client;
  onSubmit: (values: ClientFormValues) => Promise<Client>;
  onClose: () => void;
}

type FormErrors = Partial<Record<keyof ClientFormValues, string>>;

function initialValues(client?: Client): ClientFormValues {
  if (!client) {
    return { fullName: "", phone: "", email: "", address: "", notes: "" };
  }
  return {
    fullName: client.fullName,
    phone: client.phone ?? "",
    email: client.email ?? "",
    address: client.address ?? "",
    notes: client.notes ?? "",
  };
}

function validate(values: ClientFormValues): FormErrors {
  const errors: FormErrors = {};
  if (values.fullName.trim().length < 2) errors.fullName = "Full name must be at least 2 characters";
  if (values.email.trim() !== "" && !/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Enter a valid email address";
  return errors;
}

export default function ClientFormModal({ client, onSubmit, onClose }: ClientFormModalProps) {
  const [values, setValues] = useState<ClientFormValues>(initialValues(client));
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof ClientFormValues>(key: K, value: ClientFormValues[K]) {
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
          <h2 className="text-base font-semibold text-slate-900">{client ? "Edit Client" : "Add Client"}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {formError && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{formError}</div>}

          <div>
            <label htmlFor="client-fullname" className="mb-1.5 block text-xs font-medium text-slate-600">Full Name</label>
            <input
              id="client-fullname"
              type="text"
              value={values.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="client-phone" className="mb-1.5 block text-xs font-medium text-slate-600">Phone</label>
              <input
                id="client-phone"
                type="text"
                value={values.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="client-email" className="mb-1.5 block text-xs font-medium text-slate-600">Email</label>
              <input
                id="client-email"
                type="email"
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="client-address" className="mb-1.5 block text-xs font-medium text-slate-600">Address</label>
            <input
              id="client-address"
              type="text"
              value={values.address}
              onChange={(e) => update("address", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
            />
            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
          </div>

          <div>
            <label htmlFor="client-notes" className="mb-1.5 block text-xs font-medium text-slate-600">Notes</label>
            <textarea
              id="client-notes"
              value={values.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : client ? "Save Changes" : "Create Client"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
