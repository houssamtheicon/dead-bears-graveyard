import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, Download, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Constants
const TOTAL_SUPPLY = 2222;
const CONCURRENT_REQUESTS = 100;
const ONE_OF_ONE_IDS = [424, 1044, 1140, 1231, 1597, 1647, 1876, 2054];
const METADATA_BASE = "https://gateway.pinata.cloud/ipfs/bafybeifspz7rgzbrwvuoqsa5jepafex5p5x7lt4uyn2kfbkigptg4ebqgy";
const IMAGE_BASE = "https://gateway.pinata.cloud/ipfs/bafybeih7353uke62onbpb2mac4fvko4iipd6puelmzk7etzamkbx3yzavq";

// Types
interface Attribute {
  trait_type: string;
  value: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  edition: number;
  attributes: Attribute[];
}

interface NFT extends NFTMetadata {
  id: number;
  imageUrl: string;
  isOneOfOne: boolean;
}

type SortOption = "id-asc" | "id-desc" | "random";

// Trait types for filtering
const TRAIT_TYPES = ["Background", "Fur", "Clothes", "Mouth", "Eyes", "Hat"];

// Filter section component
const FilterSection = ({ 
  title, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-[#2a2a2a]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-4 text-left hover:bg-[#1a1a1a] transition-colors"
      >
        <span className="text-sm font-medium text-[#e0e0e0]">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[#606060]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#606060]" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-3">
          {children}
        </div>
      )}
    </div>
  );
};

// Checkbox filter option
const FilterCheckbox = ({ 
  label, 
  checked, 
  onChange,
  count
}: { 
  label: string; 
  checked: boolean; 
  onChange: () => void;
  count?: number;
}) => (
  <label className="flex items-center gap-2 py-1.5 cursor-pointer group">
    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
      checked ? 'bg-[#ff4444] border-[#ff4444]' : 'border-[#404040] group-hover:border-[#606060]'
    }`}>
      {checked && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <span className="text-sm text-[#a0a0a0] group-hover:text-[#e0e0e0] transition-colors flex-1">{label}</span>
    {count !== undefined && (
      <span className="text-xs text-[#606060]">{count}</span>
    )}
  </label>
);

const Gallery = () => {
  // State
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  
  // Filters & Search
  const [searchId, setSearchId] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<Record<string, Set<string>>>({});
  const [showOneOfOneOnly, setShowOneOfOneOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("random");

  // Extract all unique trait values with counts
  const traitValuesWithCounts = useMemo(() => {
    const values: Record<string, Map<string, number>> = {};
    TRAIT_TYPES.forEach(type => values[type] = new Map());
    
    nfts.forEach(nft => {
      nft.attributes.forEach(attr => {
        if (values[attr.trait_type]) {
          const current = values[attr.trait_type].get(attr.value) || 0;
          values[attr.trait_type].set(attr.value, current + 1);
        }
      });
    });
    
    return Object.fromEntries(
      Object.entries(values).map(([key, map]) => [
        key, 
        Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
      ])
    );
  }, [nfts]);

  // Load NFTs with concurrent requests
  useEffect(() => {
    const loadNFTs = async () => {
      setLoading(true);
      const loadedNFTs: (NFT | null)[] = new Array(TOTAL_SUPPLY).fill(null);
      let completed = 0;
      
      const fetchNFT = async (id: number): Promise<void> => {
        try {
          const res = await fetch(`${METADATA_BASE}/${id}.json`);
          if (!res.ok) throw new Error();
          const metadata: NFTMetadata = await res.json();
          loadedNFTs[id] = {
            ...metadata,
            id,
            imageUrl: `${IMAGE_BASE}/${id}.png`,
            isOneOfOne: ONE_OF_ONE_IDS.includes(id),
          };
        } catch {
          // Skip failed fetches
        }
        completed++;
        if (completed % 100 === 0 || completed === TOTAL_SUPPLY) {
          setLoadedCount(completed);
        }
      };

      // Process in chunks for controlled concurrency
      const ids = Array.from({ length: TOTAL_SUPPLY }, (_, i) => i);
      for (let i = 0; i < ids.length; i += CONCURRENT_REQUESTS) {
        const chunk = ids.slice(i, i + CONCURRENT_REQUESTS);
        await Promise.all(chunk.map(fetchNFT));
        // Update UI periodically
        const validNFTs = loadedNFTs.filter((nft): nft is NFT => nft !== null);
        setNfts(validNFTs);
      }

      setLoading(false);
    };

    loadNFTs();
  }, []);

  // Toggle trait selection
  const toggleTrait = useCallback((traitType: string, value: string) => {
    setSelectedTraits(prev => {
      const newTraits = { ...prev };
      if (!newTraits[traitType]) {
        newTraits[traitType] = new Set();
      }
      const newSet = new Set(newTraits[traitType]);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      newTraits[traitType] = newSet;
      return newTraits;
    });
  }, []);

  // Filter and sort NFTs
  const filteredNFTs = useMemo(() => {
    let result = [...nfts];
    
    // Search by ID
    if (searchId.trim()) {
      const searchNum = parseInt(searchId.trim());
      if (!isNaN(searchNum)) {
        result = result.filter(nft => 
          nft.id.toString().includes(searchId.trim()) || 
          nft.id === searchNum
        );
      }
    }
    
    // Filter by 1/1s (Specialty)
    if (showOneOfOneOnly) {
      result = result.filter(nft => nft.isOneOfOne);
    }
    
    // Filter by traits (multi-select within same trait type = OR, across types = AND)
    Object.entries(selectedTraits).forEach(([traitType, values]) => {
      if (values.size > 0) {
        result = result.filter(nft => 
          nft.attributes.some(attr => 
            attr.trait_type === traitType && values.has(attr.value)
          )
        );
      }
    });
    
    // Sort
    switch (sortOption) {
      case "id-asc":
        result.sort((a, b) => a.id - b.id);
        break;
      case "id-desc":
        result.sort((a, b) => b.id - a.id);
        break;
      case "random":
        result.sort(() => Math.random() - 0.5);
        break;
    }
    
    return result;
  }, [nfts, searchId, showOneOfOneOnly, selectedTraits, sortOption]);

  const clearFilters = () => {
    setSearchId("");
    setSelectedTraits({});
    setShowOneOfOneOnly(false);
  };

  const activeFiltersCount = Object.values(selectedTraits).reduce((acc, set) => acc + set.size, 0) + 
    (showOneOfOneOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-[#0f0f0f] border-r border-[#2a2a2a] flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b border-[#2a2a2a]">
            <button className="flex-1 py-3 text-sm font-medium text-[#e0e0e0] border-b-2 border-[#e0e0e0]">
              Overview
            </button>
            <button className="flex-1 py-3 text-sm font-medium text-[#606060] hover:text-[#a0a0a0] transition-colors">
              Attributes
            </button>
          </div>

          {/* Filter Header */}
          <div className="p-4 border-b border-[#2a2a2a]">
            <h2 className="text-lg font-semibold text-[#e0e0e0]">Filter</h2>
          </div>

          {/* Specialty (1/1s) */}
          <FilterSection title="Specialty" defaultOpen={true}>
            <FilterCheckbox
              label="1/1"
              checked={showOneOfOneOnly}
              onChange={() => setShowOneOfOneOnly(!showOneOfOneOnly)}
              count={ONE_OF_ONE_IDS.length}
            />
          </FilterSection>

          {/* Trait Filters */}
          {TRAIT_TYPES.map(traitType => (
            <FilterSection key={traitType} title={traitType}>
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {traitValuesWithCounts[traitType]?.map(([value, count]) => (
                  <FilterCheckbox
                    key={value}
                    label={value}
                    checked={selectedTraits[traitType]?.has(value) || false}
                    onChange={() => toggleTrait(traitType, value)}
                    count={count}
                  />
                ))}
              </div>
            </FilterSection>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Top Bar */}
          <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#2a2a2a] p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606060]" />
                <Input
                  type="text"
                  placeholder="Search ID"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="pl-10 bg-[#151515] border-[#2a2a2a] text-[#e0e0e0] placeholder:text-[#606060] focus:border-[#404040]"
                />
              </div>

              {/* Active Filters */}
              <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
                <span>Filters:</span>
                {activeFiltersCount > 0 ? (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-2 py-1 bg-[#1a1a1a] rounded text-[#e0e0e0] hover:bg-[#252525] transition-colors"
                  >
                    {activeFiltersCount} active
                    <X className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-[#606060]">None</span>
                )}
              </div>

              {/* Sort */}
              <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                <SelectTrigger className="w-40 bg-[#151515] border-[#2a2a2a] text-[#e0e0e0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#151515] border-[#2a2a2a]">
                  <SelectItem value="random" className="text-[#e0e0e0] focus:bg-[#252525]">Sort: Random</SelectItem>
                  <SelectItem value="id-asc" className="text-[#e0e0e0] focus:bg-[#252525]">ID: Low to High</SelectItem>
                  <SelectItem value="id-desc" className="text-[#e0e0e0] focus:bg-[#252525]">ID: High to Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Stats */}
              <div className="text-sm text-[#606060]">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {loadedCount} / {TOTAL_SUPPLY}
                  </span>
                ) : (
                  `${filteredNFTs.length} of ${TOTAL_SUPPLY}`
                )}
              </div>
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="p-4">
            {filteredNFTs.length === 0 && !loading ? (
              <div className="text-center py-20">
                <p className="text-[#606060] text-lg">No bears found</p>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="mt-4 bg-[#151515] border-[#2a2a2a] text-[#e0e0e0] hover:bg-[#252525]"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {filteredNFTs.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} onClick={() => setSelectedNFT(nft)} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* NFT Modal */}
      {selectedNFT && (
        <NFTModal nft={selectedNFT} onClose={() => setSelectedNFT(null)} />
      )}
    </div>
  );
};

// NFT Card Component
const NFTCard = ({ nft, onClick }: { nft: NFT; onClick: () => void }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-lg overflow-hidden bg-[#151515] transition-all duration-200 hover:ring-2 hover:ring-[#ff4444]/50"
    >
      <div className="relative aspect-square bg-[#0a0a0a]">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#404040]" />
          </div>
        )}
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center text-[#404040] text-xs">
            Failed
          </div>
        ) : (
          <img
            src={nft.imageUrl}
            alt={nft.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        
        {nft.isOneOfOne && (
          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-[#ff4444] to-[#ff8844] text-white text-[9px] font-bold px-1.5 py-0.5">
            1/1
          </Badge>
        )}
      </div>

      <div className="p-2 text-center">
        <p className="text-xs text-[#a0a0a0]">
          Dead Bears #{nft.id}
        </p>
      </div>
    </div>
  );
};

// NFT Modal Component
const NFTModal = ({ nft, onClose }: { nft: NFT; onClose: () => void }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const downloadImage = () => {
    window.open(nft.imageUrl, "_blank");
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80" />
      
      <div 
        className="relative w-full max-w-4xl bg-[#c8c3f5] rounded-lg overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
        >
          <X className="w-5 h-5 text-[#1a1a1a]" />
        </button>

        {/* Tabs */}
        <div className="flex border-b border-[#b0a8e8]">
          <button className="px-8 py-4 text-sm font-medium text-[#1a1a1a] border-b-2 border-[#1a1a1a]">
            Details
          </button>
          <button className="px-8 py-4 text-sm font-medium text-[#6a6a8a] hover:text-[#1a1a1a] transition-colors">
            Wallpapers
          </button>
          <button className="px-8 py-4 text-sm font-medium text-[#6a6a8a] hover:text-[#1a1a1a] transition-colors">
            Seasons
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Left: Image */}
          <div className="md:w-1/2 p-4">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <img
                src={nft.imageUrl}
                alt={nft.name}
                className="w-full h-full object-cover"
              />
              {nft.isOneOfOne && (
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-[#ff4444] to-[#ff8844] text-white font-bold px-2 py-1">
                  1/1 LEGENDARY
                </Badge>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:w-1/2 p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-[#1a1a1a]">
              {nft.name}
            </h2>
            <p className="text-sm text-[#6a6a8a] mb-6">
              Token #{nft.id}
            </p>

            {/* Attributes */}
            <div className="flex-1 space-y-2">
              {nft.attributes.map((attr, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-white/60 rounded-lg"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#8a8aa0]">
                      {attr.trait_type}
                    </p>
                    <p className="text-sm font-medium text-[#1a1a1a]">
                      {attr.value}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[#6a6a8a] bg-white/80 px-2 py-1 rounded">
                    {nft.isOneOfOne ? "LEGENDARY" : "COMMON"}
                  </span>
                </div>
              ))}
            </div>

            {/* Download Button */}
            <Button
              onClick={downloadImage}
              className="mt-6 w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download High Resolution Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
