import { useState, useEffect, useId } from "react";
import type { UserStore, StorePlan, UpdateStoreInput } from "../types";

interface StoreDetailsModalProps {
  store: UserStore | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: UpdateStoreInput) => void;
}

export function StoreDetailsModal({
  store,
  isOpen,
  onClose,
  onDelete,
  onUpdate,
}: StoreDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState<StorePlan>("BASIC");
  const [status, setStatus] = useState<"active" | "draft" | "maintenance">("active");
  const [allowsDelivery, setAllowsDelivery] = useState(true);
  const [allowsPickup, setAllowsPickup] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const editNameId = useId();
  const editSlugId = useId();
  const editDeliveryId = useId();
  const editPickupId = useId();

  // Populate local form state when store changes or edit mode toggles
  useEffect(() => {
    if (store) {
      setName(store.name);
      setSlug(store.slug);
      setPlan(store.plan);
      setStatus(store.status);
      setAllowsDelivery(store.allowsDelivery);
      setAllowsPickup(store.allowsPickup);
      setIsEditing(false);
      setSaveSuccess(false);
    }
  }, [store]);

  if (!isOpen || !store) return null;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    onUpdate(store!.id, {
      name: name.trim(),
      slug: slug.trim(),
      plan,
      status,
      allowsDelivery,
      allowsPickup,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 600);
  }

  function handleCancelEdit() {
    if (store) {
      setName(store.name);
      setSlug(store.slug);
      setPlan(store.plan);
      setStatus(store.status);
      setAllowsDelivery(store.allowsDelivery);
      setAllowsPickup(store.allowsPickup);
    }
    setIsEditing(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-modal-title"
    >
      <div
        className="w-full max-w-md rounded-md border border-gray-400 bg-white p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="mb-2 text-sm font-medium tracking-widest uppercase text-gray-400">
              {isEditing ? "EDIT STORE" : "STORE OVERVIEW"}
            </p>
            <h2
              id="store-modal-title"
              className="text-2xl font-semibold tracking-tight text-gray-900 line-clamp-1"
            >
              {isEditing ? `Edit ${store.name}` : store.name}
            </h2>
            <p className="mt-1 font-mono text-xs text-gray-400">
              {store.slug}.store.app
            </p>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-400 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit store
            </button>
          )}
        </div>

        {/* Edit Mode View */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-900"
                htmlFor={editNameId}
              >
                Store name
              </label>
              <input
                id={editNameId}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Studio"
                className="w-full rounded-md border border-gray-400 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-900"
                htmlFor={editSlugId}
              >
                Store URL identifier (slug)
              </label>
              <input
                id={editSlugId}
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="acme-studio"
                className="w-full rounded-md border border-gray-400 bg-white px-4 py-2.5 font-mono text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900"
              />
              <p className="mt-1 font-mono text-xs text-gray-400">
                {slug ? `${slug}.store.app` : "slug.store.app"}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Subscription Plan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["BASIC", "PRO", "ENTERPRISE"] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setPlan(tier)}
                    className={`rounded-md border py-2 text-xs font-semibold uppercase tracking-wider transition ${
                      plan === tier
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-400 bg-white text-gray-900 hover:border-gray-900"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["active", "draft", "maintenance"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`rounded-md border py-2 text-xs font-semibold uppercase tracking-wider transition ${
                      status === st
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-400 bg-white text-gray-900 hover:border-gray-900"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <p className="text-sm font-medium text-gray-900">Fulfillment options</p>
              <div className="flex items-center gap-6">
                <label
                  htmlFor={editDeliveryId}
                  className="flex items-center gap-2 text-sm text-gray-900 cursor-pointer"
                >
                  <input
                    id={editDeliveryId}
                    type="checkbox"
                    checked={allowsDelivery}
                    onChange={(e) => setAllowsDelivery(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-400 text-gray-900 accent-gray-900"
                  />
                  Home delivery
                </label>
                <label
                  htmlFor={editPickupId}
                  className="flex items-center gap-2 text-sm text-gray-900 cursor-pointer"
                >
                  <input
                    id={editPickupId}
                    type="checkbox"
                    checked={allowsPickup}
                    onChange={(e) => setAllowsPickup(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-400 text-gray-900 accent-gray-900"
                  />
                  Store pickup
                </label>
              </div>
            </div>

            <div className="pt-3 space-y-2">
              <button
                type="submit"
                className="w-full rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                {saveSuccess ? "✓ Changes saved!" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full text-center text-sm text-gray-400 underline underline-offset-4 transition hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Normal Overview Mode View */
          <div>
            <div className="divide-y divide-gray-100 rounded-md border border-gray-200">
              <div className="flex items-center justify-between p-3 text-sm">
                <span className="text-gray-400">Subscription Plan</span>
                <span className="font-medium text-gray-900">{store.plan}</span>
              </div>
              <div className="flex items-center justify-between p-3 text-sm">
                <span className="text-gray-400">Status</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-gray-900 capitalize">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      store.status === "active"
                        ? "bg-emerald-500"
                        : store.status === "draft"
                        ? "bg-amber-400"
                        : "bg-red-400"
                    }`}
                  />
                  {store.status}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 text-sm">
                <span className="text-gray-400">Products Listed</span>
                <span className="font-medium text-gray-900">{store.productsCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 text-sm">
                <span className="text-gray-400">Home Delivery</span>
                <span className="font-medium text-gray-900">
                  {store.allowsDelivery ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 text-sm">
                <span className="text-gray-400">In-Store Pickup</span>
                <span className="font-medium text-gray-900">
                  {store.allowsPickup ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 text-sm">
                <span className="text-gray-400">Created On</span>
                <span className="font-medium text-gray-900">{store.createdAt}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full rounded-md border border-gray-400 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Edit store
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Done
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => onDelete(store.id)}
                  className="text-xs text-red-500 underline underline-offset-4 transition hover:text-red-700"
                >
                  Delete store
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-gray-400 underline underline-offset-4 transition hover:text-gray-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
