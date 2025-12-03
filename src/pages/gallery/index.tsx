import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Shuffle, ArrowUpDown, X, Loader2 } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

// Constants
const TOTAL_SUPPLY = 2222;
const BATCH_SIZE = 2222;
const ONE_OF_ONE_IDS = [2054, 1876, 1597, 1140, 1231, 1044, 424, 1647];
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

const Gallery = () => {
  // State
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Filters & Search
  const [searchId, setSearchId] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<Record<string, string>>({});
  const [showOneOfOneOnly, setShowOneOfOneOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("id-asc");
  const [filterOpen, setFilterOpen] = useState(false);

  // Extract all unique trait values
  const traitValues = useMemo(() => {
    const values: Record<string, Set<string>> = {};
    TRAIT_TYPES.forEach(type => values[type] = new Set());
    
    nfts.forEach(nft => {
      nft.attributes.forEach(attr => {
        if (values[attr.trait_type]) {
          values[attr.trait_type].add(attr.value);
        }
      });
    });
    
    return Object.fromEntries(
      Object.entries(values).map(([key, set]) => [key, Array.from(set).sort()])
    );
  }, [nfts]);

  // Load NFTs in batches
  useEffect(() => {
    const loadNFTs = async () => {
      setLoading(true);
      setError(null);
      const loadedNFTs: NFT[] = [];
      
      try {
        for (let i = 0; i < TOTAL_SUPPLY; i += BATCH_SIZE) {
          const batchPromises: Promise<NFT | null>[] = [];
          
          for (let j = i; j < Math.min(i + BATCH_SIZE, TOTAL_SUPPLY); j++) {
            batchPromises.push(
              fetch(`${METADATA_BASE}/${j}.json`)
                .then(res => {
                  if (!res.ok) throw new Error(`Failed to fetch NFT #${j}`);
                  return res.json();
                })
                .then((metadata: NFTMetadata) => ({
                  ...metadata,
                  id: j,
                  imageUrl: `${IMAGE_BASE}/${j}.png`,
                  isOneOfOne: ONE_OF_ONE_IDS.includes(j),
                }))
                .catch(() => null)
            );
          }
          
          const batchResults = await Promise.all(batchPromises);
          const validResults = batchResults.filter((nft): nft is NFT => nft !== null);
          loadedNFTs.push(...validResults);
          setLoadedCount(loadedNFTs.length);
          setNfts([...loadedNFTs]);
        }
      } catch (err) {
        setError("Failed to load some NFTs. Please refresh to try again.");
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
  }, []);

  // Filter and sort NFTs
  const filteredNFTs = useMemo(() => {
    let result = [...nfts];
    
    // Search by ID
    if (searchId.trim()) {
      const searchNum = parseInt(searchId.trim());
      if (!isNaN(searchNum)) {
        result = result.filter(nft => nft.id === searchNum);
      }
    }
    
    // Filter by 1/1s
    if (showOneOfOneOnly) {
      result = result.filter(nft => nft.isOneOfOne);
    }
    
    // Filter by traits
    Object.entries(selectedTraits).forEach(([traitType, value]) => {
      if (value) {
        result = result.filter(nft => 
          nft.attributes.some(attr => 
            attr.trait_type === traitType && attr.value === value
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
    setSortOption("id-asc");
  };

  const activeFiltersCount = Object.values(selectedTraits).filter(Boolean).length + 
    (showOneOfOneOnly ? 1 : 0) + 
    (searchId ? 1 : 0);

  return (
    <div className="gallery-page min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 gallery-header border-b border-gallery-border backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Title & Stats */}
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-gallery-text">
                Dead Bears Gallery
              </h1>
              <p className="text-sm text-gallery-muted mt-1">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading {loadedCount} of {TOTAL_SUPPLY}...
                  </span>
                ) : (
                  `Showing ${filteredNFTs.length} of ${TOTAL_SUPPLY} bears`
                )}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gallery-muted" />
                <Input
                  type="text"
                  placeholder="Search by ID..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="pl-9 w-32 md:w-40 gallery-input"
                />
              </div>

              {/* Sort */}
              <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                <SelectTrigger className="w-36 gallery-input">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="gallery-dropdown">
                  <SelectItem value="id-asc">ID: Low to High</SelectItem>
                  <SelectItem value="id-desc">ID: High to Low</SelectItem>
                  <SelectItem value="random">Random</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Button */}
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gallery-button relative">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2 gallery-badge-accent">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="gallery-sheet">
                  <SheetHeader>
                    <SheetTitle className="text-gallery-text">Filter Bears</SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    {/* 1/1 Toggle */}
                    <div className="flex items-center justify-between">
                      <Label htmlFor="one-of-one" className="text-gallery-text">
                        Show only 1/1s
                      </Label>
                      <Switch
                        id="one-of-one"
                        checked={showOneOfOneOnly}
                        onCheckedChange={setShowOneOfOneOnly}
                        className="gallery-switch"
                      />
                    </div>

                    {/* Trait Filters */}
                    {TRAIT_TYPES.map(traitType => (
                      <div key={traitType}>
                        <Label className="text-sm text-gallery-muted mb-2 block">
                          {traitType}
                        </Label>
                        <Select
                          value={selectedTraits[traitType] || ""}
                          onValueChange={(value) => 
                            setSelectedTraits(prev => ({
                              ...prev,
                              [traitType]: value === "all" ? "" : value
                            }))
                          }
                        >
                          <SelectTrigger className="gallery-input">
                            <SelectValue placeholder={`All ${traitType}s`} />
                          </SelectTrigger>
                          <SelectContent className="gallery-dropdown max-h-60">
                            <SelectItem value="all">All {traitType}s</SelectItem>
                            {traitValues[traitType]?.map(value => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}

                    {/* Clear Filters */}
                    {activeFiltersCount > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={clearFilters}
                        className="w-full gallery-button"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Shuffle Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOption("random")}
                className="gallery-button"
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Loading Progress */}
          {loading && (
            <div className="mt-4">
              <Progress 
                value={(loadedCount / TOTAL_SUPPLY) * 100} 
                className="h-1 gallery-progress"
              />
            </div>
          )}
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-gallery-accent/20 border border-gallery-accent text-gallery-accent px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <main className="container mx-auto px-4 py-8">
        {filteredNFTs.length === 0 && !loading ? (
          <div className="text-center py-20">
            <p className="text-gallery-muted text-lg">No bears found matching your criteria</p>
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="mt-4 gallery-button"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredNFTs.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// NFT Card Component
const NFTCard = ({ nft }: { nft: NFT }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const openFullImage = () => {
    window.open(nft.imageUrl, "_blank");
  };

  return (
    <div
      onClick={openFullImage}
      className="gallery-card group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gallery-card">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gallery-muted" />
          </div>
        )}
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center text-gallery-muted">
            <span className="text-xs">Failed to load</span>
          </div>
        ) : (
          <img
            src={nft.imageUrl}
            alt={nft.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        
        {/* 1/1 Badge */}
        {nft.isOneOfOne && (
          <div className="absolute top-2 left-2">
            <Badge className="gallery-badge-legendary text-[10px] font-bold px-2 py-0.5">
              1/1 LEGENDARY
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-gallery-card-footer">
        <p className="text-sm font-medium text-gallery-text truncate">
          {nft.name}
        </p>
        <p className="text-xs text-gallery-muted mt-0.5">
          #{nft.id.toString().padStart(4, "0")}
        </p>
      </div>
    </div>
  );
};

export default Gallery;
