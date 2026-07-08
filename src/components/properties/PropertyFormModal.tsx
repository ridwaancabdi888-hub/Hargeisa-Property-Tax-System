import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import Button from "../ui/Button";
import FilterSelect from "../ui/FilterSelect";
import ImageDropzone, { type DropzoneImage } from "./ImageDropzone";
import { ApiError } from "../../lib/api";
import { deletePropertyImage, uploadPropertyImages } from "../../lib/propertyImagesApi";
import { listClients } from "../../lib/clientsApi";
import type { Client } from "../../types/client";
import type { PropertyDetail, PropertyFormValues, PropertyImage, PropertyListing } from "../../types/property";

interface PropertyFormModalProps {
  property?: PropertyDetail;
  onSubmit: (values: PropertyFormValues) => Promise<PropertyListing>;
  onClose: () => void;
}

type FormErrors = Partial<Record<keyof PropertyFormValues, string>>;

interface StagedFile {
  key: string;
  file: File;
  previewUrl: string;
}

function initialValues(property?: PropertyDetail): PropertyFormValues {
  if (!property) {
    return { title: "", description: "", price: "", location: "", latitude: "", longitude: "", clientId: "", type: "sale", status: "available" };
  }
  return {
    title: property.title,
    description: property.description,
    price: String(property.price),
    location: property.location,
    latitude: property.latitude === null ? "" : String(property.latitude),
    longitude: property.longitude === null ? "" : String(property.longitude),
    clientId: property.clientId === null ? "" : String(property.clientId),
    type: property.type,
    status: property.status,
  };
}

function validate(values: PropertyFormValues): FormErrors {
  const errors: FormErrors = {};
  if (values.title.trim().length < 3) errors.title = "Title must be at least 3 characters";
  if (!values.description.trim()) errors.description = "Description is required";
  const price = Number(values.price);
  if (!values.price || Number.isNaN(price) || price <= 0) errors.price = "Price must be a number greater than 0";
  if (!values.location.trim()) errors.location = "Location is required";
  if (values.latitude.trim() !== "") {
    const lat = Number(values.latitude);
    if (Number.isNaN(lat) || lat < -90 || lat > 90) errors.latitude = "Latitude must be between -90 and 90";
  }
  if (values.longitude.trim() !== "") {
    const lng = Number(values.longitude);
    if (Number.isNaN(lng) || lng < -180 || lng > 180) errors.longitude = "Longitude must be between -180 and 180";
  }
  return errors;
}

export default function PropertyFormModal({ property, onSubmit, onClose }: PropertyFormModalProps) {
  const [values, setValues] = useState<PropertyFormValues>(initialValues(property));
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>(property?.images ?? []);
  const [isUploadingExisting, setIsUploadingExisting] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    return () => {
      stagedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listClients({ limit: 100 })
      .then((res) => setClients(res.data))
      .catch(() => setClients([]));
  }, []);

  function update<K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleStageFiles(files: File[]) {
    const staged = files.map((file) => ({ key: `${file.name}-${Date.now()}-${Math.random()}`, file, previewUrl: URL.createObjectURL(file) }));
    setStagedFiles((prev) => [...prev, ...staged]);
  }

  function handleRemoveStaged(key: string) {
    setStagedFiles((prev) => {
      const target = prev.find((f) => f.key === key);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.key !== key);
    });
  }

  async function handleUploadExisting(files: File[]) {
    if (!property) return;
    setImageError(null);
    setIsUploadingExisting(true);
    try {
      const res = await uploadPropertyImages(property.id, files);
      setExistingImages((prev) => [...prev, ...res.data]);
    } catch (err) {
      setImageError(err instanceof ApiError ? err.message : "Failed to upload image(s).");
    } finally {
      setIsUploadingExisting(false);
    }
  }

  async function handleRemoveExisting(imageId: number) {
    if (!property) return;
    setImageError(null);
    try {
      await deletePropertyImage(property.id, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      setImageError(err instanceof ApiError ? err.message : "Failed to delete image.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setFormError(null);
    setIsSubmitting(true);
    try {
      const saved = await onSubmit(values);
      if (!property && stagedFiles.length > 0) {
        await uploadPropertyImages(saved.id, stagedFiles.map((f) => f.file));
      }
      onClose();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const dropzoneImages: DropzoneImage[] = property
    ? existingImages.map((img) => ({ key: `existing-${img.id}`, previewUrl: img.url }))
    : stagedFiles.map((f) => ({ key: f.key, previewUrl: f.previewUrl }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-card">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            {property ? "Edit Property" : "Add Property"}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {formError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{formError}</div>
          )}

          <div>
            <label htmlFor="property-title" className="mb-1.5 block text-xs font-medium text-slate-600">
              Title
            </label>
            <input
              id="property-title"
              type="text"
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="property-description" className="mb-1.5 block text-xs font-medium text-slate-600">
              Description
            </label>
            <textarea
              id="property-description"
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="property-price" className="mb-1.5 block text-xs font-medium text-slate-600">
                Price ($)
              </label>
              <input
                id="property-price"
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={(e) => update("price", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
              />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="property-location" className="mb-1.5 block text-xs font-medium text-slate-600">
                Location
              </label>
              <input
                id="property-location"
                type="text"
                value={values.location}
                onChange={(e) => update("location", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
              />
              {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="property-latitude" className="mb-1.5 block text-xs font-medium text-slate-600">
                Latitude <span className="font-normal text-slate-400">(optional, for GIS Map)</span>
              </label>
              <input
                id="property-latitude"
                type="number"
                step="any"
                min="-90"
                max="90"
                placeholder="e.g. 9.5624"
                value={values.latitude}
                onChange={(e) => update("latitude", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
              />
              {errors.latitude && <p className="mt-1 text-xs text-red-600">{errors.latitude}</p>}
            </div>
            <div>
              <label htmlFor="property-longitude" className="mb-1.5 block text-xs font-medium text-slate-600">
                Longitude <span className="font-normal text-slate-400">(optional, for GIS Map)</span>
              </label>
              <input
                id="property-longitude"
                type="number"
                step="any"
                min="-180"
                max="180"
                placeholder="e.g. 44.0770"
                value={values.longitude}
                onChange={(e) => update("longitude", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
              />
              {errors.longitude && <p className="mt-1 text-xs text-red-600">{errors.longitude}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="property-owner" className="mb-1.5 block text-xs font-medium text-slate-600">
              Owner <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <div className="relative">
              <select
                id="property-owner"
                value={values.clientId}
                onChange={(e) => update("clientId", e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700"
              >
                <option value="">No owner on file</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Type</label>
              <FilterSelect
                className="w-full capitalize"
                options={["rent", "sale"]}
                value={values.type}
                onChange={(e) => update("type", e.target.value as PropertyFormValues["type"])}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Status</label>
              <FilterSelect
                className="w-full capitalize"
                options={["available", "sold", "rented"]}
                value={values.status}
                onChange={(e) => update("status", e.target.value as PropertyFormValues["status"])}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Images</label>
            <ImageDropzone
              images={dropzoneImages}
              disabled={isUploadingExisting}
              onFilesSelected={property ? handleUploadExisting : handleStageFiles}
              onRemove={(key) => {
                if (!property) {
                  handleRemoveStaged(key);
                  return;
                }
                const id = Number(key.replace("existing-", ""));
                handleRemoveExisting(id);
              }}
            />
            {imageError && <p className="mt-1.5 text-xs text-red-600">{imageError}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : property ? "Save Changes" : "Create Property"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
