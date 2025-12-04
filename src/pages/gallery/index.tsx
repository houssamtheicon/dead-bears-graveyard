import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, Download, X, Loader2, ArrowLeft } from "lucide-react";
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
import { Link } from "react-router-dom";


// Constants
const TOTAL_SUPPLY = 2222;
const BATCH_SIZE = 30;
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
  percentage
}: { 
  label: string; 
  checked: boolean; 
  onChange: () => void;
  percentage?: string;
}) => (
  <button
    type="button"
    onClick={onChange}
    className="w-full flex items-center gap-2 py-1.5 cursor-pointer group text-left"
  >
    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors flex-shrink-0 ${
      checked ? 'bg-[#ff4444] border-[#ff4444]' : 'border-[#404040] group-hover:border-[#606060]'
    }`}>
      {checked && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <span className="text-sm text-[#a0a0a0] group-hover:text-[#e0e0e0] transition-colors flex-1 truncate">{label}</span>
    {percentage && (
      <span className="text-[10px] text-[#606060]">{percentage}</span>
    )}
  </button>
);


// Fetch with retry
const fetchWithRetry = async (url: string, retries = 3, delay = 500): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      if (res.status === 429) {
        await new Promise(r => setTimeout(r, delay * (i + 1)));
        continue;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
  throw new Error("Max retries");
};


const Gallery = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  
  const [searchId, setSearchId] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<Record<string, string[]>>({});
  const [showOneOfOneOnly, setShowOneOfOneOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("random");
  const [randomSeed] = useState(() => Math.random());


  // Calculate trait counts and rarity
  const traitStats = useMemo(() => {
    const stats: Record<string, Record<string, { count: number; percentage: string }>> = {};
    TRAIT_TYPES.forEach(type => stats[type] = {});
    
    nfts.forEach(nft => {
      nft.attributes.forEach(attr => {
        if (!stats[attr.trait_type]) return;
        if (!stats[attr.trait_type][attr.value]) {
          stats[attr.trait_type][attr.value] = { count: 0, percentage: "0%" };
        }
        stats[attr.trait_type][attr.value].count++;
      });
    });
    
    // Calculate percentages
    const total = nfts.length;
    Object.keys(stats).forEach(traitType => {
      Object.keys(stats[traitType]).forEach(value => {
        const count = stats[traitType][value].count;
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
        stats[traitType][value].percentage = `${pct}%`;
      });
    });
    
    return stats;
  }, [nfts]);


  // Get sorted trait values
  const sortedTraitValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    TRAIT_TYPES.forEach(type => {
      result[type] = Object.keys(traitStats[type] || {}).sort();
    });
    return result;
  }, [traitStats]);


  // Load NFTs with controlled concurrency and retry
  useEffect(() => {
    const loadNFTs = async () => {
      setLoading(true);
      const allNFTs: NFT[] = [];
      
      for (let i = 0; i < TOTAL_SUPPLY; i += BATCH_SIZE) {
        const batchIds = Array.from(
          { length: Math.min(BATCH_SIZE, TOTAL_SUPPLY - i) }, 
          (_, j) => i + j
        );
        
        const batchResults = await Promise.allSettled(
          batchIds.map(async (id) => {
            try {
              const res = await fetchWithRetry(`${METADATA_BASE}/${id}.json`);
              const metadata: NFTMetadata = await res.json();
              return {
                ...metadata,
                id,
                imageUrl: `${IMAGE_BASE}/${id}.png`,
                isOneOfOne: ONE_OF_ONE_IDS.includes(id),
              } as NFT;
            } catch {
              return null;
            }
          })
        );
        
        const validNFTs = batchResults
          .filter((r): r is PromiseFulfilledResult<NFT | null> => r.status === "fulfilled")
          .map(r => r.value)
          .filter((nft): nft is NFT => nft !== null);
        
        allNFTs.push(...validNFTs);
        setNfts([...allNFTs]);
        setLoadedCount(allNFTs.length);
        
        // Small delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < TOTAL_SUPPLY) {
          await new Promise(r => setTimeout(r, 100));
        }
      }
      
      setLoading(false);
    };


    loadNFTs();
  }, []);


  // Toggle trait selection
  const toggleTrait = useCallback((traitType: string, value: string) => {
    setSelectedTraits(prev => {
      const current = prev[traitType] || [];
      const newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [traitType]: newValues };
    });
  }, []);


  // Filter and sort NFTs
  const filteredNFTs = useMemo(() => {
    let result = [...nfts];
    
    // Search by ID
    if (searchId.trim()) {
      result = result.filter(nft => 
        nft.id.toString().includes(searchId.trim())
      );
    }
    
    // Filter by 1/1s
    if (showOneOfOneOnly) {
      result = result.filter(nft => nft.isOneOfOne);
    }
    
    // Filter by traits
    Object.entries(selectedTraits).forEach(([traitType, values]) => {
      if (values.length > 0) {
        result = result.filter(nft => 
          nft.attributes.some(attr => 
            attr.trait_type === traitType && values.includes(attr.value)
          )
        );
      }
    });
    
    // Sort
    if (sortOption === "id-asc") {
      result.sort((a, b) => a.id - b.id);
    } else if (sortOption === "id-desc") {
      result.sort((a, b) => b.id - a.id);
    } else {
      // Seeded random for consistency
      result.sort((a, b) => {
        const hashA = (a.id * 9301 + 49297) % 233280;
        const hashB = (b.id * 9301 + 49297) % 233280;
        return (hashA * randomSeed) - (hashB * randomSeed);
      });
    }
    
    return result;
  }, [nfts, searchId, showOneOfOneOnly, selectedTraits, sortOption, randomSeed]);


  const clearFilters = () => {
    setSearchId("");
    setSelectedTraits({});
    setShowOneOfOneOnly(false);
  };


  const activeFiltersCount = Object.values(selectedTraits).reduce((acc, arr) => acc + arr.length, 0) + 
    (showOneOfOneOnly ? 1 : 0);


  // Get rarity label
  const getRarityLabel = (percentage: number): string => {
    if (percentage <= 1) return "LEGENDARY";
    if (percentage <= 5) return "SUPER RARE";
    if (percentage <= 10) return "RARE";
    if (percentage <= 25) return "UNCOMMON";
    return "COMMON";
  };


  const getRarityColor = (percentage: number): string => {
    if (percentage <= 1) return "text-[#ff4444]";
    if (percentage <= 5) return "text-[#ff8844]";
    if (percentage <= 10) return "text-[#44aaff]";
    if (percentage <= 25) return "text-[#44ff88]";
    return "text-[#888888]";
  };


  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 lg:w-64 min-h-screen bg-[#0f0f0f] border-r border-[#2a2a2a] flex-shrink-0 sticky top-0 h-screen overflow-y-auto hidden md:block">
          {/* Back Button */}
          <div className="p-4 border-b border-[#2a2a2a]">
            <Link to="/" className="flex items-center gap-2 text-[#a0a0a0] hover:text-[#e0e0e0] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
          </div>


          {/* Filter Header */}
          <div className="p-4 border-b border-[#2a2a2a]">
            <h2 className="text-lg font-semibold text-[#e0e0e0]">Filter</h2>
          </div>


          {/* Specialty (1/1s) */}
          <FilterSection title="Specialty" defaultOpen={true}>
            <FilterCheckbox
              label="1/1 Legendary"
              checked={showOneOfOneOnly}
              onChange={() => setShowOneOfOneOnly(!showOneOfOneOnly)}
              percentage={`${ONE_OF_ONE_IDS.length}`}
            />
          </FilterSection>


          {/* Trait Filters */}
          {TRAIT_TYPES.map(traitType => (
            <FilterSection key={traitType} title={traitType}>
              <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                {sortedTraitValues[traitType]?.map(value => (
                  <FilterCheckbox
                    key={value}
                    label={value}
                    checked={selectedTraits[traitType]?.includes(value) || false}
                    onChange={() => toggleTrait(traitType, value)}
                    percentage={traitStats[traitType]?.[value]?.percentage}
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
            <div className="flex flex-wrap items-center gap-3">
              {/* Mobile back */}
              <Link to="/" className="md:hidden p-2 text-[#a0a0a0] hover:text-[#e0e0e0]">
                <ArrowLeft className="w-5 h-5" />
              </Link>


              {/* Search */}
              <div className="relative flex-1 min-w-[120px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606060]" />
                <Input
                  type="text"
                  placeholder="Search ID"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="pl-10 bg-[#151515] border-[#2a2a2a] text-[#e0e0e0] placeholder:text-[#606060] focus:border-[#404040] h-9"
                />
              </div>


              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-1 bg-[#ff4444]/20 border border-[#ff4444]/30 rounded text-[#ff4444] text-xs hover:bg-[#ff4444]/30 transition-colors"
                >
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
                  <X className="w-3 h-3" />
                </button>
              )}


              {/* Sort */}
              <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                <SelectTrigger className="w-36 bg-[#151515] border-[#2a2a2a] text-[#e0e0e0] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#151515] border-[#2a2a2a]">
                  <SelectItem value="random" className="text-[#e0e0e0] focus:bg-[#252525] focus:text-[#e0e0e0]">Random</SelectItem>
                  <SelectItem value="id-asc" className="text-[#e0e0e0] focus:bg-[#252525] focus:text-[#e0e0e0]">ID: Low → High</SelectItem>
                  <SelectItem value="id-desc" className="text-[#e0e0e0] focus:bg-[#252525] focus:text-[#e0e0e0]">ID: High → Low</SelectItem>
                </SelectContent>
              </Select>


              {/* Stats */}
              <div className="text-sm text-[#606060] ml-auto">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {loadedCount} / {TOTAL_SUPPLY}
                  </span>
                ) : (
                  `${filteredNFTs.length} of ${nfts.length}`
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
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
        <NFTModal 
          nft={selectedNFT} 
          onClose={() => setSelectedNFT(null)} 
          traitStats={traitStats}
          totalSupply={nfts.length}
          getRarityLabel={getRarityLabel}
          getRarityColor={getRarityColor}
        />
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
      className="group cursor-pointer rounded-lg overflow-hidden bg-[#151515] transition-all duration-200 hover:ring-2 hover:ring-[#ff4444]/50 hover:scale-[1.02]"
    >
      <div className="relative aspect-square bg-[#0a0a0a]">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[#404040]" />
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


      <div className="p-2 text-center bg-[#121212]">
        <p className="text-xs text-[#a0a0a0]">
          Dead Bears #{nft.id}
        </p>
      </div>
    </div>
  );
};


// NFT Modal Component
interface NFTModalProps {
  nft: NFT;
  onClose: () => void;
  traitStats: Record<string, Record<string, { count: number; percentage: string }>>;
  totalSupply: number;
  getRarityLabel: (percentage: number) => string;
  getRarityColor: (percentage: number) => string;
}


const NFTModal = ({ nft, onClose, traitStats, totalSupply, getRarityLabel, getRarityColor }: NFTModalProps) => {
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
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      
      <div 
        className="relative w-full max-w-3xl bg-[#f5f3ff] rounded-xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
        >
          <X className="w-5 h-5 text-[#1a1a1a]" />
        </button>


        <div className="flex flex-col md:flex-row">
          {/* Left: Image */}
          <div className="md:w-1/2 p-4 md:p-6">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
              <img
                src={nft.imageUrl}
                alt={nft.name}
                className="w-full h-full object-cover"
              />
              {nft.isOneOfOne && (
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-[#ff4444] to-[#ff8844] text-white font-bold text-xs px-2 py-1">
                  1/1 LEGENDARY
                </Badge>
              )}
            </div>
          </div>


          {/* Right: Details */}
          <div className="md:w-1/2 p-4 md:p-6 flex flex-col max-h-[80vh] md:max-h-none overflow-y-auto">
            <h2 className="text-xl md:text-2xl font-bold text-[#1a1a1a]">
              {nft.name}
            </h2>
            <p className="text-sm text-[#6a6a8a] mb-4">
              Token #{nft.id}
            </p>


            {/* Attributes */}
            <div className="flex-1 space-y-2 mb-4">
              {nft.attributes.map((attr, index) => {
                const stat = traitStats[attr.trait_type]?.[attr.value];
                const pctNum = stat ? parseFloat(stat.percentage) : 50;
                const rarityLabel = getRarityLabel(pctNum);
                const rarityColor = getRarityColor(pctNum);
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2.5 px-3 bg-white rounded-lg border border-[#e0e0f0]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-[#8a8aa0]">
                        {attr.trait_type}
                      </p>
                      <p className="text-sm font-medium text-[#1a1a1a] truncate">
                        {attr.value}
                      </p>
                    </div>
                    <div className="text-right ml-3">
                      <p className={`text-[10px] uppercase tracking-wider font-semibold ${rarityColor}`}>
                        {rarityLabel}
                      </p>
                      <p className="text-[10px] text-[#8a8aa0]">
                        {stat?.percentage || "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>


            {/* Download Button */}
            <Button
              onClick={downloadImage}
              className="w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Gallery;