import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Attribute {
  trait_type: string;
  value: string;
}

export interface NFT {
  id: number;
  name: string;
  description: string;
  image: string;
  edition: number;
  imageUrl: string;
  attributes: Attribute[];
  isOneOfOne: boolean;
}

interface NFTCardProps {
  nft: NFT;
  onClick: () => void;
}

const NFTCard = ({ nft, onClick }: NFTCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] bg-[#151515] border border-[#2a2a2a] hover:border-[#ff4444]/50 hover:shadow-[0_0_20px_rgba(255,68,68,0.2)]"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-[#0a0a0a]">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#606060]" />
          </div>
        )}
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center text-[#606060]">
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
            <Badge className="bg-gradient-to-r from-[#ff4444] to-[#ff8844] text-white text-[10px] font-bold px-2 py-0.5 shadow-lg">
              1/1 LEGENDARY
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-[#121212]">
        <p className="text-sm font-medium text-[#e0e0e0] truncate">
          {nft.name}
        </p>
        <p className="text-xs text-[#606060] mt-0.5 font-mono">
          #{nft.id.toString().padStart(4, "0")}
        </p>
      </div>
    </div>
  );
};

export default NFTCard;
