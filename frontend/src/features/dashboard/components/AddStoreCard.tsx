interface AddStoreCardProps {
  onClick: () => void;
  isHeroEmptyState?: boolean;
}

export function AddStoreCard({ onClick, isHeroEmptyState = false }: AddStoreCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Create a new store"
      className={`group relative aspect-square w-full rounded-md border-2 border-dashed border-gray-400 bg-white p-6 text-left transition-all duration-200 hover:border-gray-900 hover:bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 cursor-pointer flex flex-col items-center justify-center text-center ${
        isHeroEmptyState ? "max-w-sm mx-auto shadow-sm" : ""
      }`}
    >
      {/* Plus Icon Container */}
      <div className="flex h-14 w-14 items-center justify-center rounded-md border border-gray-400 text-gray-900 transition-all duration-200 group-hover:border-gray-900 group-hover:bg-gray-900 group-hover:text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 transition-transform duration-200 group-hover:rotate-90"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>

      <div className="mt-5 space-y-1.5">
        <p className="text-xs font-medium tracking-widest uppercase text-gray-400 group-hover:text-gray-900 transition-colors">
          {isHeroEmptyState ? "Get started" : "New storefront"}
        </p>
        <h3 className="text-base font-semibold tracking-tight text-gray-900">
          Create new store
        </h3>
        <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
          {isHeroEmptyState
            ? "You don't have any stores yet. Click to launch your first store."
            : "Expand your business with a brand new storefront."}
        </p>
      </div>

      {/* Subtle indicator tag */}
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-gray-400 underline underline-offset-4 transition-colors group-hover:text-gray-900">
        Add store
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </button>
  );
}
