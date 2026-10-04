import { useMemo } from "react";
import { useDashboardStore, useAuthStore } from "../../store";
import { StoreCard } from "./components/StoreCard";
import { AddStoreCard } from "./components/AddStoreCard";
import { CreateStoreModal } from "./components/CreateStoreModal";
import { StoreDetailsModal } from "./components/StoreDetailsModal";


export function Dashboard() {
  const {
    stores,
    searchQuery,
    selectedStore,
    isCreateModalOpen,
    isDetailsModalOpen,
    setSearchQuery,
    addStore,
    updateStore,
    deleteStore,
    setSelectedStore,
    setCreateModalOpen,
    setDetailsModalOpen,
  } = useDashboardStore();



  const { name, organisationName } = useAuthStore();

  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return stores;
    const q = searchQuery.toLowerCase().trim();
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.plan.toLowerCase().includes(q)
    );
  }, [stores, searchQuery]);

  const hasStores = stores.length > 0;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-900 text-white font-bold text-sm tracking-wider">
              S
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-gray-900">
                StorePlatform
              </span>
              <span className="ml-2 rounded border border-gray-400 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User / Org context */}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">
                {name || "Store Owner"}
              </p>
              <p className="text-xs text-gray-400">
                {organisationName || "Personal Workspace"}
              </p>
            </div>

            {/* Quick Create Store Button */}
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              + New Store
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          {/* Header Title & Controls */}
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-sm font-medium tracking-widest uppercase text-gray-400">
                YOUR STORES
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                Storefronts
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Manage your digital stores, configure domains, or deploy a new storefront.
              </p>
            </div>

            {/* Quick Testing Toggles & Search */}
            <div className="flex flex-wrap items-center gap-3">
              {hasStores && (
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter stores..."
                    className="w-56 rounded-md border border-gray-400 bg-white px-3.5 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-900"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Conditional Store Listing */}

          {hasStores ? (
            <div>
              {/* Responsive Grid with Square Store Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredStores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    onClick={(clickedStore) => setSelectedStore(clickedStore)}
                  />
                ))}

                {/* Trailing Square Card with Plus Icon */}
                <AddStoreCard onClick={() => setCreateModalOpen(true)} />
              </div>

              {filteredStores.length === 0 && searchQuery && (
                <div className="mt-8 rounded-md border border-gray-200 p-8 text-center">
                  <p className="text-sm text-gray-400">
                    No stores matching &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-xs text-gray-900 underline underline-offset-4"
                  >
                    Clear filter
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State: Shows the same square with plus icon */
            <div className="mt-12 flex flex-col items-center justify-center text-center">
              <div className="mb-8">
                <p className="mb-2 text-sm font-medium tracking-widest uppercase text-gray-400">
                  NO STORES YET
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                  You haven&rsquo;t created any stores yet
                </h2>
                <p className="mt-2 text-sm text-gray-400 max-w-md">
                  Get started by creating your very first storefront. Click the square below to begin.
                </p>
              </div>

              {/* The Same Square with Plus Icon */}
              <div className="w-72 sm:w-80">
                <AddStoreCard
                  isHeroEmptyState
                  onClick={() => setCreateModalOpen(true)}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-400">
        <p>StorePlatform &bull; Minimalist Store Management</p>
      </footer>

      {/* Create Store Modal */}
      <CreateStoreModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={addStore}
      />

      {/* Store Details Modal */}
      <StoreDetailsModal
        store={selectedStore}
        isOpen={isDetailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onDelete={deleteStore}
        onUpdate={updateStore}
      />
    </div>
  );
}


export default Dashboard;
