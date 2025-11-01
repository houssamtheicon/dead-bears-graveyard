import { Button } from "@/components/ui/button";

const Hero = () => {
  const scrollToLore = () => {
    document.getElementById("lore")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center relative overflow-hidden grain"
    >
      {/* Fog effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fog to-transparent opacity-50 animate-float" />
      
      <div className="container mx-auto px-6 text-center relative z-10 animate-fade-in">
        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter mb-4 text-shadow-dark">
          DEAD BEARS
        </h1>
        
        <p className="text-2xl md:text-4xl font-medium mb-3 opacity-80">
          we're all gonna be dead.
        </p>
        
        <p className="text-lg md:text-xl mb-12 opacity-60 max-w-2xl mx-auto">
          Born from Okay Bears. Reborn in chaos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="default"
            size="lg"
            asChild
            className="text-base font-semibold min-w-[200px]"
          >
            <a href="https://discord.gg/deadbears" target="_blank" rel="noopener noreferrer">
              Join the Graveyard
            </a>
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={scrollToLore}
            className="text-base font-semibold min-w-[200px] border-2"
          >
            Read the Lore
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
