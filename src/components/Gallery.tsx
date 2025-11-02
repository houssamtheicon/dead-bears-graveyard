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
      <div className="container mx-auto px-6 max-w-5xl text-center">
        <h2 className="text-6xl md:text-8xl font-display font-bold mb-10 tracking-tight">
          The Graveyard
        </h2>
        
        <p className="text-sm uppercase tracking-[0.3em] mb-16 opacity-40 font-medium">
          Gallery
        </p>

        <div className="mb-16 space-y-6 text-lg md:text-xl opacity-70 font-light max-w-2xl mx-auto">
          <p>
            The art's still buried deep. It'll crawl out when it's ready.
          </p>
          <p>
            For now, here's what's left behind.
          </p>
        </div>

        {/* Teaser placeholder */}
        <div className="relative w-full max-w-lg mx-auto aspect-square mb-16 bg-card rounded-2xl overflow-hidden shadow-lg border border-border">
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-xl">
            <p className={`text-4xl font-display font-bold tracking-wide transition-opacity ${flicker ? "opacity-30" : "opacity-100"}`}>
              Coming Soon
            </p>
          </div>
          <div className="absolute inset-0 grain opacity-30" />
        </div>

        <Button
          variant="default"
          size="lg"
          asChild
          className="font-medium"
        >
          <a href="https://discord.gg/JBApX5VPzN" target="_blank" rel="noopener noreferrer">
            Stay Dead for Updates
          </a>
        </Button>
      </div>
    </section>
  );
};

export default Gallery;
