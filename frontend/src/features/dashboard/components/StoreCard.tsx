import type { UserStore } from "../types";

interface StoreCardProps {
  store: UserStore;
  onClick: (store: UserStore) => void;
}

export function StoreCard({ store, onClick }: StoreCardProps) {
  // First letter of store name for avatar mark
  const initial = store.name.trim().charAt(0).toUpperCase() || "S";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(store)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(store);
        }
      }}
      aria-label={`Manage store ${store.name}`}
      className="group relative aspect-square w-full rounded-md border border-gray-400 bg-white p-6 text-left transition-all duration-200 hover:border-gray-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 cursor-pointer flex flex-col justify-between"
    >
      {/* Top row: Avatar monogram & Plan Pill */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md border border-gray-400 bg-white text-base font-semibold text-gray-900 transition-colors duration-200 group-hover:border-gray-900 group-hover:bg-gray-900 group-hover:text-white">
          {initial}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded border border-gray-400 px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase text-gray-900">
            {store.plan}
          </span>
          <span
            className="flex h-2 w-2 rounded-full bg-emerald-500"
            title="Active"
            aria-label="Active status"
          />
        </div>
      </div>

      {/* Middle section: Name, Slug, Capabilities */}
      <div className="my-auto space-y-2">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-gray-900 transition-colors group-hover:underline line-clamp-1">
            {store.name}
          </h3>
          <p className="mt-1 flex items-center gap-1 font-mono text-xs text-gray-400">
            <span>{store.slug}</span>
            <span className="text-gray-300">.store.app</span>
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {store.allowsDelivery && (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
              Delivery
            </span>
          )}
          {store.allowsPickup && (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
              Pickup
            </span>
          )}
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
            {store.productsCount} {store.productsCount === 1 ? "product" : "products"}
          </span>
        </div>
      </div>

      {/* Bottom row: Created date & Click arrow indicator */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400">
        <span>Since {store.createdAt}</span>
        <span className="inline-flex items-center gap-1 font-medium text-gray-900 transition-transform group-hover:translate-x-0.5">
          Manage
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </div>
  );
}
