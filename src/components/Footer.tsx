const Footer = () => {
  return (
    <footer className="py-16 border-t border-border">
      <div className="container mx-auto px-6 text-center space-y-6">
        <p className="text-lg font-bold tracking-tight">
          DEAD BEARS © 2025
        </p>
        
        <p className="text-sm opacity-70">
          Built by the Dead, for the Dead.
        </p>

        <div className="flex flex-wrap gap-4 justify-center items-center text-sm">
          <a
            href="https://discord.gg/deadbears"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition-opacity"
          >
            Discord
          </a>
          <span className="opacity-30">•</span>
          <a
            href="https://twitter.com/deadbears"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition-opacity"
          >
            X (Twitter)
          </a>
          <span className="opacity-30">•</span>
          <a
            href="https://magiceden.io/deadbears"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition-opacity"
          >
            Magic Eden
          </a>
        </div>

        <p className="text-sm opacity-50 italic pt-4">
          No roadmap. No promises. Just vibes.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
