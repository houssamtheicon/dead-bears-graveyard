import { useEffect } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Attribute {
  trait_type: string;
  value: string;
}

interface NFT {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  attributes: Attribute[];
  isOneOfOne: boolean;
}

interface NFTModalProps {
  nft: NFT;
  onClose: () => void;
}

const NFTModal = ({ nft, onClose }: NFTModalProps) => {
  // Close on escape key
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-[#151515] border border-[#ff4444]/30 rounded-2xl shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#0a0a0a]/80 hover:bg-[#ff4444]/20 transition-colors"
        >
          <X className="w-5 h-5 text-[#e0e0e0]" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left: Image */}
          <div className="md:w-1/2 p-6">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-[#0a0a0a]">
              <img
                src={nft.imageUrl}
                alt={nft.name}
                className="w-full h-full object-cover"
              />
              {nft.isOneOfOne && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-gradient-to-r from-[#ff4444] to-[#ff8844] text-white font-bold px-3 py-1">
                    1/1 LEGENDARY
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:w-1/2 p-6 flex flex-col">
            {/* Name & ID */}
            <h2 className="text-2xl md:text-3xl font-bold text-[#e0e0e0] mb-1">
              {nft.name}
            </h2>
            <p className="text-[#ff4444] font-mono text-lg mb-4">
              #{nft.id.toString().padStart(4, "0")}
            </p>

            {/* Description */}
            <p className="text-[#a0a0a0] text-sm mb-6 leading-relaxed">
              {nft.description}
            </p>

            {/* Attributes */}
            <div className="flex-1">
              <h3 className="text-sm uppercase tracking-wider text-[#808080] mb-3 font-medium">
                Attributes
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {nft.attributes.map((attr, index) => (
                  <div
                    key={index}
                    className="bg-[#0a0a0a] rounded-lg p-3 border border-[#2a2a2a] hover:border-[#ff4444]/30 transition-colors"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-[#606060] mb-1">
                      {attr.trait_type}
                    </p>
                    <p className="text-sm font-medium text-[#e0e0e0]">
                      {attr.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTModal;
