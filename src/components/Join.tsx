import { Button } from "@/components/ui/button";
import { MessageCircle, Twitter } from "lucide-react";

const Join = () => {
  return (
    <section id="join" className="min-h-screen flex items-center justify-center py-24 relative">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <h2 className="text-6xl md:text-8xl font-display font-bold mb-16 tracking-tight">
          Join the Graveyard
        </h2>

        <div className="mb-16 space-y-8 text-lg md:text-xl leading-relaxed opacity-70 max-w-3xl mx-auto font-light">
          <p>
            Dead Bears isn't just a collection — it's a movement of misfits who stopped trying to look alive.
          </p>
          <p className="font-medium text-2xl">
            Join us. Build with us. Rot together.
          </p>
        </div>

        <Button
          variant="default"
          size="lg"
          asChild
          className="font-medium mb-20"
        >
          <a href="https://discord.gg/deadbears" target="_blank" rel="noopener noreferrer">
            Enter Discord
          </a>
        </Button>

        {/* Social Links */}
        <div className="flex flex-wrap gap-8 justify-center items-center pt-12 border-t border-border">
          <a
            href="https://discord.gg/deadbears"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-60 transition-opacity text-base font-medium"
          >
            <MessageCircle size={20} />
            Discord
          </a>
          
          <a
            href="https://twitter.com/deadbears"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-60 transition-opacity text-base font-medium"
          >
            <Twitter size={20} />
            X (Twitter)
          </a>
          
          <a
            href="https://magiceden.io/deadbears"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-60 transition-opacity text-base font-medium"
          >
            Magic Eden
          </a>
        </div>
      </div>
    </section>
  );
};

export default Join;
