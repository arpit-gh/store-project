import { useState, useId } from "react";
import type { CreateStoreInput, StorePlan } from "../types";

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateStoreInput) => void;
}

export function CreateStoreModal({ isOpen, onClose, onSubmit }: CreateStoreModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState<StorePlan>("BASIC");
  const [allowsDelivery, setAllowsDelivery] = useState(true);
  const [allowsPickup, setAllowsPickup] = useState(true);
  const [autoSlug, setAutoSlug] = useState(true);

  const nameId = useId();
  const slugId = useId();
  const deliveryId = useId();
  const pickupId = useId();

  if (!isOpen) return null;

  function handleNameChange(val: string) {
    setName(val);
    if (autoSlug) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    onSubmit({
      name: name.trim(),
      slug: slug.trim(),
      plan,
      allowsDelivery,
      allowsPickup,
    });

    // Reset fields
    setName("");
    setSlug("");
    setPlan("BASIC");
    setAllowsDelivery(true);
    setAllowsPickup(true);
    setAutoSlug(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="w-full max-w-md rounded-md border border-gray-400 bg-white p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium tracking-widest uppercase text-gray-400">
            CREATE YOUR STORE
          </p>
          <h2 id="modal-title" className="text-3xl font-semibold tracking-tight text-gray-900">
            Launch a storefront
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Configure your brand name, domain, and fulfillment settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor={nameId}>
              Store name
            </label>
            <input
              id={nameId}
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Acme Studio"
              className="w-full rounded-md border border-gray-400 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-900" htmlFor={slugId}>
                Store URL identifier (slug)
              </label>
              {autoSlug && (
                <button
                  type="button"
                  onClick={() => setAutoSlug(false)}
                  className="text-xs text-gray-400 underline underline-offset-4 hover:text-gray-900"
                >
                  Custom slug
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                id={slugId}
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setSlug(e.target.value);
                }}
                placeholder="acme-studio"
                className="w-full rounded-md border border-gray-400 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900"
              />
            </div>
            <p className="mt-1 font-mono text-xs text-gray-400">
              {slug ? `${slug}.store.app` : "your-subdomain.store.app"}
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
                  className={`rounded-md border py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
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

          {/* Fulfillment options */}
          <div className="space-y-2 pt-1">
            <p className="text-sm font-medium text-gray-900">Fulfillment options</p>
            <div className="flex items-center gap-6">
              <label htmlFor={deliveryId} className="flex items-center gap-2 text-sm text-gray-900 cursor-pointer">
                <input
                  id={deliveryId}
                  type="checkbox"
                  checked={allowsDelivery}
                  onChange={(e) => setAllowsDelivery(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-400 text-gray-900 focus:ring-gray-900 accent-gray-900"
                />
                Home delivery
              </label>
              <label htmlFor={pickupId} className="flex items-center gap-2 text-sm text-gray-900 cursor-pointer">
                <input
                  id={pickupId}
                  type="checkbox"
                  checked={allowsPickup}
                  onChange={(e) => setAllowsPickup(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-400 text-gray-900 focus:ring-gray-900 accent-gray-900"
                />
                Store pickup
              </label>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <button
              type="submit"
              className="w-full rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Create store
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-sm text-gray-400 underline underline-offset-4 transition hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
