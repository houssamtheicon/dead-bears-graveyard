const Footer = () => {
  return (
    <footer className="py-20 border-t border-border">
      <div className="container mx-auto px-6 text-center space-y-8">
        <p className="text-2xl font-display font-bold tracking-tight">
          Dead Bears © 2025
        </p>
        
        <p className="text-base opacity-60 font-light">
          Built by the Dead, for the Dead.
        </p>

        <div className="flex flex-wrap gap-6 justify-center items-center text-base">
          <a
            href="https://discord.gg/deadbears"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-60 transition-opacity"
          >
            Discord
          </a>
          <span className="opacity-20">•</span>
          <a
            href="https://twitter.com/deadbears"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-60 transition-opacity"
          >
            X (Twitter)
          </a>
          <span className="opacity-20">•</span>
          <a
            href="https://magiceden.io/deadbears"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-60 transition-opacity"
          >
            Magic Eden
          </a>
        </div>

        <p className="text-base opacity-40 italic pt-6 font-light">
          No roadmap. No promises. Just vibes.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
