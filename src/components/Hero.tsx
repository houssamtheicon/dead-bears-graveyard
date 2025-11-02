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
        <h1 className="text-8xl md:text-[12rem] font-display font-bold tracking-tight mb-6 leading-none">
          Dead Bears
        </h1>
        
        <p className="text-2xl md:text-3xl font-medium mb-4 opacity-70 italic">
          we're all gonna be dead.
        </p>
        
        <p className="text-base md:text-lg mb-16 opacity-50 max-w-xl mx-auto font-light">
          Born from Okay Bears. Reborn in chaos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="default"
            size="lg"
            asChild
            className="font-medium min-w-[200px]"
          >
            <a href="https://discord.gg/JBApX5VPzN" target="_blank" rel="noopener noreferrer">
              Join the Underground
            </a>
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={scrollToLore}
            className="font-medium min-w-[200px]"
          >
            Read the Lore
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
