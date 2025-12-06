import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Search, ChevronDown, ChevronUp, Download, X, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

// Constants
const MAX_SUPPLY = 1300;
const BATCH_SIZE = 50;
const ITEMS_PER_PAGE = 50;
const REFRESH_INTERVAL = 60000;
const ONE_OF_ONE_IDS = [424, 1044, 1140, 1231, 1597, 1647, 1876, 2054];
const METADATA_BASE = "https://gateway.pinata.cloud/ipfs/bafybeifspz7rgzbrwvuoqsa5jepafex5p5x7lt4uyn2kfbkigptg4ebqgy";
const IMAGE_BASE = "https://gateway.pinata.cloud/ipfs/bafybeih7353uke62onbpb2mac4fvko4iipd6puelmzk7etzamkbx3yzavq";

// Types
interface Attribute {
  trait_type: string;
  value: string;
}

interface NFT {
  id: number;
  name: string;
  imageUrl: string;
  attributes: Attribute[];
  isOneOfOne: boolean;
}

type SortOption = "id-asc" | "id-desc" | "random";

const TRAIT_TYPES = ["Background", "Fur", "Clothes", "Mouth", "Eyes", "Hat"];

// Global scrollbar hide styles
const scrollbarHideStyles = `
  * {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  *::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
    background: transparent !important;
  }
`;

// Fetch metadata with retry
async function fetchMetadata(id: number, retries = 2): Promise<NFT | null> {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${METADATA_BASE}/${id}.json`, {
        signal: controller.signal
      });
      clearTimeout(timeout);
      
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      return {
        id,
        name: data.name || `Dead Bears #${id}`,
        imageUrl: `${IMAGE_BASE}/${id}.png`,
        attributes: data.attributes || [],
        isOneOfOne: ONE_OF_ONE_IDS.includes(id),
      };
    } catch (e) {
      if (i === retries) return null;
      await new Promise(r => setTimeout(r, 300 * (i + 1)));
    }
  }
  return null;
}

const Gallery = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  const [searchId, setSearchId] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<Record<string, string[]>>({});
  const [showOneOfOneOnly, setShowOneOfOneOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("random");
  const [expandedFilters, setExpandedFilters] = useState<string[]>(["Specialty"]);
  const [randomSeed] = useState(() => Math.random());

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<{ nfts: NFT[]; timestamp: number } | null>(null);

  // Load all NFTs from IPFS
  const loadNFTs = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setIsRefreshing(true);

    try {
      // Check cache
      if (cacheRef.current && Date.now() - cacheRef.current.timestamp < REFRESH_INTERVAL) {
        if (!isBackground) {
          setNfts(cacheRef.current.nfts);
          setLoading(false);
        }
        setIsRefreshing(false);
        return;
      }

      const allNFTs: NFT[] = [];
      let consecutiveFailures = 0;
      const maxConsecutiveFailures = 10;

      // Load in batches
      for (let start = 1; start <= MAX_SUPPLY; start += BATCH_SIZE) {
        const batchIds = Array.from(
          { length: Math.min(BATCH_SIZE, MAX_SUPPLY - start + 1) },
          (_, i) => start + i
        );

        const results = await Promise.all(batchIds.map(id => fetchMetadata(id)));
        const validNFTs = results.filter((nft): nft is NFT => nft !== null);
        
        // Track consecutive failures to detect end of minted NFTs
        const batchFailures = results.filter(r => r === null).length;
        if (batchFailures === batchIds.length) {
          consecutiveFailures += batchIds.length;
        } else {
          consecutiveFailures = 0;
        }

        allNFTs.push(...validNFTs);

        if (!isBackground) {
          setNfts([...allNFTs]);
          setLoadedCount(allNFTs.length);
        }

        // Stop if we hit too many consecutive failures (likely end of minted NFTs)
        if (consecutiveFailures >= maxConsecutiveFailures) {
          console.log(`Stopping at ID ${start + BATCH_SIZE - 1} - ${consecutiveFailures} consecutive failures`);
          break;
        }

        // Small delay between batches
        if (start + BATCH_SIZE <= MAX_SUPPLY) {
          await new Promise(r => setTimeout(r, 100));
        }
      }

      cacheRef.current = { nfts: allNFTs, timestamp: Date.now() };
      setNfts(allNFTs);
    } catch (error) {
      console.error("Error loading NFTs:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load + auto refresh
  useEffect(() => {
    loadNFTs();
    const interval = setInterval(() => loadNFTs(true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadNFTs]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, nfts.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [nfts.length]);

  // Trait stats
  const traitStats = useMemo(() => {
    const stats: Record<string, Record<string, { count: number; percentage: number }>> = {};
    TRAIT_TYPES.forEach(type => (stats[type] = {}));

    nfts.forEach(nft => {
      nft.attributes.forEach(attr => {
        if (!stats[attr.trait_type]) return;
        if (!stats[attr.trait_type][attr.value]) {
          stats[attr.trait_type][attr.value] = { count: 0, percentage: 0 };
        }
        stats[attr.trait_type][attr.value].count++;
      });
    });

    const total = nfts.length;
    Object.keys(stats).forEach(type => {
      Object.keys(stats[type]).forEach(value => {
        stats[type][value].percentage = total > 0 ? (stats[type][value].count / total) * 100 : 0;
      });
    });

    return stats;
  }, [nfts]);

  // Sorted trait values
  const sortedTraitValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    TRAIT_TYPES.forEach(type => {
      result[type] = Object.keys(traitStats[type] || {}).sort();
    });
    return result;
  }, [traitStats]);

  // Filter and sort
  const filteredNFTs = useMemo(() => {
    let result = [...nfts];

    // EXACT ID search only
    if (searchId.trim()) {
      const exactId = parseInt(searchId.trim(), 10);
      if (!isNaN(exactId)) {
        result = result.filter(nft => nft.id === exactId);
      } else {
        result = [];
      }
    }

    // 1/1 filter
    if (showOneOfOneOnly) {
      result = result.filter(nft => nft.isOneOfOne);
    }

    // Trait filters
    Object.entries(selectedTraits).forEach(([type, values]) => {
      if (values.length > 0) {
        result = result.filter(nft =>
          nft.attributes.some(attr => attr.trait_type === type && values.includes(attr.value))
        );
      }
    });

    // Sort
    if (sortOption === "id-asc") {
      result.sort((a, b) => a.id - b.id);
    } else if (sortOption === "id-desc") {
      result.sort((a, b) => b.id - a.id);
    } else {
      result.sort((a, b) => {
        const hashA = (a.id * 9301 + 49297) % 233280;
        const hashB = (b.id * 9301 + 49297) % 233280;
        return hashA * randomSeed - hashB * randomSeed;
      });
    }

    return result;
  }, [nfts, searchId, showOneOfOneOnly, selectedTraits, sortOption, randomSeed]);

  const displayedNFTs = useMemo(() => filteredNFTs.slice(0, displayCount), [filteredNFTs, displayCount]);

  const toggleTrait = useCallback((type: string, value: string) => {
    setSelectedTraits(prev => {
      const current = prev[type] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
    setDisplayCount(ITEMS_PER_PAGE);
  }, []);

  const clearFilters = () => {
    setSearchId("");
    setSelectedTraits({});
    setShowOneOfOneOnly(false);
    setDisplayCount(ITEMS_PER_PAGE);
  };

  const activeFiltersCount =
    Object.values(selectedTraits).reduce((acc, arr) => acc + arr.length, 0) + (showOneOfOneOnly ? 1 : 0);

  const getRarityInfo = (percentage: number) => {
    if (percentage <= 1) return { label: "LEGENDARY", color: "text-[#ff4444]" };
    if (percentage <= 5) return { label: "SUPER RARE", color: "text-[#ff8844]" };
    if (percentage <= 10) return { label: "RARE", color: "text-[#44aaff]" };
    if (percentage <= 25) return { label: "UNCOMMON", color: "text-[#44ff88]" };
    return { label: "COMMON", color: "text-[#888888]" };
  };

  const toggleFilter = (name: string) => {
    setExpandedFilters(prev =>
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    );
  };

  return (
    <>
      <style>{scrollbarHideStyles}</style>
      <div className="min-h-screen bg-[#0a0a0a] overflow-hidden">
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-56 lg:w-64 bg-[#0f0f0f] border-r border-[#2a2a2a] flex-shrink-0 h-screen overflow-y-auto hidden md:flex flex-col">
            {/* Back */}
            <div className="p-4 border-b border-[#2a2a2a]">
              <Link to="/" className="flex items-center gap-2 text-[#a0a0a0] hover:text-[#e0e0e0] transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Home</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="p-4 border-b border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#808080] uppercase tracking-wider">Minted</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#ff4444]">
                    {nfts.length} / {MAX_SUPPLY}
                  </span>
                  {isRefreshing && <RefreshCw className="w-3 h-3 animate-spin text-[#ff4444]" />}
                </div>
              </div>
              <div className="h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff4444] transition-all duration-500"
                  style={{ width: `${(nfts.length / MAX_SUPPLY) * 100}%` }}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex-1 overflow-y-auto">
              {/* Specialty */}
              <div className="border-b border-[#2a2a2a]">
                <button
                  onClick={() => toggleFilter("Specialty")}
                  className="w-full flex items-center justify-between py-3 px-4 hover:bg-[#1a1a1a] transition-colors"
                >
                  <span className="text-sm font-medium text-[#e0e0e0]">Specialty</span>
                  {expandedFilters.includes("Specialty") ? (
                    <ChevronUp className="w-4 h-4 text-[#606060]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#606060]" />
                  )}
                </button>
                {expandedFilters.includes("Specialty") && (
                  <div className="px-4 pb-3">
                    <label className="flex items-center gap-2 py-1.5 cursor-pointer group" onClick={() => setShowOneOfOneOnly(!showOneOfOneOnly)}>
                      <div
                        className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                          showOneOfOneOnly
                            ? "bg-[#ff4444] border-[#ff4444]"
                            : "border-[#404040] group-hover:border-[#606060]"
                        }`}
                      >
                        {showOneOfOneOnly && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-[#a0a0a0] group-hover:text-[#e0e0e0] flex-1">1/1 Legendary</span>
                      <span className="text-[10px] text-[#606060]">{ONE_OF_ONE_IDS.length}</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Trait Filters */}
              {TRAIT_TYPES.map(type => (
                <div key={type} className="border-b border-[#2a2a2a]">
                  <button
                    onClick={() => toggleFilter(type)}
                    className="w-full flex items-center justify-between py-3 px-4 hover:bg-[#1a1a1a] transition-colors"
                  >
                    <span className="text-sm font-medium text-[#e0e0e0]">{type}</span>
                    <div className="flex items-center gap-2">
                      {selectedTraits[type]?.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#ff4444] text-white rounded-full">
                          {selectedTraits[type].length}
                        </span>
                      )}
                      {expandedFilters.includes(type) ? (
                        <ChevronUp className="w-4 h-4 text-[#606060]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#606060]" />
                      )}
                    </div>
                  </button>
                  {expandedFilters.includes(type) && (
                    <div className="px-4 pb-3 max-h-48 overflow-y-auto">
                      {sortedTraitValues[type]?.map(value => {
                        const stat = traitStats[type]?.[value];
                        return (
                          <label 
                            key={value} 
                            className="flex items-center gap-2 py-1.5 cursor-pointer group"
                            onClick={() => toggleTrait(type, value)}
                          >
                            <div
                              className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                                selectedTraits[type]?.includes(value)
                                  ? "bg-[#ff4444] border-[#ff4444]"
                                  : "border-[#404040] group-hover:border-[#606060]"
                              }`}
                            >
                              {selectedTraits[type]?.includes(value) && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm text-[#a0a0a0] group-hover:text-[#e0e0e0] flex-1 truncate">
                              {value}
                            </span>
                            <span className="text-[10px] text-[#606060]">{stat?.count || 0}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="p-3 border-t border-[#2a2a2a]">
                <button
                  onClick={clearFilters}
                  className="w-full py-2 text-xs text-[#ff4444] hover:bg-[#1a1a1a] rounded transition-colors"
                >
                  Clear All ({activeFiltersCount})
                </button>
              </div>
            )}
          </aside>

          {/* Main */}
          <main className="flex-1 h-screen overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#2a2a2a] p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/" className="md:hidden p-2 text-[#a0a0a0] hover:text-[#e0e0e0]">
                  <ArrowLeft className="w-5 h-5" />
                </Link>

                {/* Search */}
                <div className="relative flex-1 min-w-[120px] max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606060]" />
                  <input
                    type="text"
                    placeholder="Search exact ID (e.g., 42)"
                    value={searchId}
                    onChange={e => {
                      setSearchId(e.target.value);
                      setDisplayCount(ITEMS_PER_PAGE);
                    }}
                    className="w-full pl-10 pr-8 py-2 text-sm bg-[#151515] border border-[#2a2a2a] rounded-lg text-[#e0e0e0] placeholder-[#606060] focus:outline-none focus:border-[#ff4444]"
                  />
                  {searchId && (
                    <button
                      onClick={() => setSearchId("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#606060] hover:text-[#e0e0e0]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Active Filters */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-2 py-1 bg-[#ff4444]/20 border border-[#ff4444]/30 rounded text-[#ff4444] text-xs hover:bg-[#ff4444]/30"
                  >
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""}
                    <X className="w-3 h-3" />
                  </button>
                )}

                {/* Sort */}
                <select
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value as SortOption)}
                  className="px-3 py-2 text-sm bg-[#151515] border border-[#2a2a2a] rounded-lg text-[#e0e0e0] focus:outline-none focus:border-[#ff4444]"
                >
                  <option value="random">Random</option>
                  <option value="id-asc">ID: Low → High</option>
                  <option value="id-desc">ID: High → Low</option>
                </select>

                {/* Stats */}
                <div className="text-sm text-[#606060] ml-auto">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading... {loadedCount} found
                    </span>
                  ) : (
                    `${filteredNFTs.length} of ${nfts.length} minted`
                  )}
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="p-4">
              {loading && nfts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-[#ff4444] mb-4" />
                  <p className="text-[#808080]">Loading minted bears... {loadedCount} found</p>
                </div>
              ) : filteredNFTs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <p className="text-[#808080] text-lg">No bears found</p>
                  {searchId && (
                    <p className="text-[#606060] text-sm mt-2">
                      Bear #{searchId} doesn't exist or isn't minted yet
                    </p>
                  )}
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-[#151515] border border-[#2a2a2a] rounded-lg text-[#e0e0e0] hover:bg-[#252525]"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                    {displayedNFTs.map(nft => (
                      <NFTCard key={nft.id} nft={nft} onClick={() => setSelectedNFT(nft)} />
                    ))}
                  </div>
                  {displayCount < filteredNFTs.length && (
                    <div ref={loadMoreRef} className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#ff4444]" />
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>

        {/* Modal */}
        {selectedNFT && (
          <NFTModal
            nft={selectedNFT}
            onClose={() => setSelectedNFT(null)}
            traitStats={traitStats}
            getRarityInfo={getRarityInfo}
          />
        )}
      </div>
    </>
  );
};

// NFT Card
const NFTCard = ({ nft, onClick }: { nft: NFT; onClick: () => void }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-lg overflow-hidden bg-[#151515] transition-all duration-200 hover:ring-2 hover:ring-[#ff4444]/50 hover:scale-[1.02]"
    >
      <div className="relative aspect-square bg-[#0a0a0a]">
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[#404040]" />
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-[#404040] text-xs">Failed</div>
        ) : (
          <img
            src={nft.imageUrl}
            alt={nft.name}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`w-full h-full object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        )}
        {nft.isOneOfOne && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-gradient-to-r from-[#ff4444] to-[#ff8844] text-white text-[9px] font-bold rounded">
            1/1
          </span>
        )}
      </div>
      <div className="p-2 text-center bg-[#121212]">
        <p className="text-xs text-[#a0a0a0]">Dead Bears #{nft.id}</p>
      </div>
    </div>
  );
};

// NFT Modal
interface NFTModalProps {
  nft: NFT;
  onClose: () => void;
  traitStats: Record<string, Record<string, { count: number; percentage: number }>>;
  getRarityInfo: (percentage: number) => { label: string; color: string };
}

const NFTModal = ({ nft, onClose, traitStats, getRarityInfo }: NFTModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl bg-[#f5f3ff] rounded-xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
        >
          <X className="w-5 h-5 text-[#1a1a1a]" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-1/2 p-4 md:p-6">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
              <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover" />
              {nft.isOneOfOne && (
                <span className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-[#ff4444] to-[#ff8844] text-white font-bold text-xs rounded-lg">
                  1/1 LEGENDARY
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="md:w-1/2 p-4 md:p-6 flex flex-col max-h-[60vh] md:max-h-none overflow-y-auto">
            <h2 className="text-xl md:text-2xl font-bold text-[#1a1a1a]">{nft.name}</h2>
            <p className="text-sm text-[#6a6a8a] mb-4">Token #{nft.id}</p>

            <div className="flex-1 space-y-2 mb-4 overflow-y-auto">
              {nft.attributes.map((attr, i) => {
                const stat = traitStats[attr.trait_type]?.[attr.value];
                const pct = stat?.percentage || 50;
                const rarity = getRarityInfo(pct);

                return (
                  <div key={i} className="flex items-center justify-between py-2.5 px-3 bg-white rounded-lg border border-[#e0e0f0]">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-[#8a8aa0]">{attr.trait_type}</p>
                      <p className="text-sm font-medium text-[#1a1a1a] truncate">{attr.value}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className={`text-[10px] uppercase tracking-wider font-semibold ${rarity.color}`}>
                        {rarity.label}
                      </p>
                      <p className="text-[10px] text-[#8a8aa0]">{pct.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => window.open(nft.imageUrl, "_blank")}
              className="w-full py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
