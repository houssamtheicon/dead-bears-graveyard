import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const Gallery = () => {
  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlicker(true);
      setTimeout(() => setFlicker(false), 150);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="gallery" className="min-h-screen flex items-center justify-center py-24">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
          The Graveyard
        </h2>
        
        <p className="text-sm uppercase tracking-widest mb-12 opacity-60">
          (Gallery)
        </p>

        <div className="mb-12 space-y-6 text-lg md:text-xl opacity-80">
          <p>
            The art's still buried deep. It'll crawl out when it's ready.
          </p>
          <p>
            For now, here's what's left behind.
          </p>
        </div>

        {/* Teaser placeholder */}
        <div className="relative w-full max-w-md mx-auto aspect-square mb-12 bg-secondary/20 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-xl">
            <p className={`text-3xl font-bold tracking-wider transition-opacity ${flicker ? "opacity-30" : "opacity-100"}`}>
              COMING SOON
            </p>
          </div>
          <div className="absolute inset-0 grain opacity-50" />
        </div>

        <Button
          variant="default"
          size="lg"
          asChild
          className="text-base font-semibold"
        >
          <a href="https://discord.gg/deadbears" target="_blank" rel="noopener noreferrer">
            Stay Dead for Updates
          </a>
        </Button>
      </div>
    </section>
  );
};

export default Gallery;
