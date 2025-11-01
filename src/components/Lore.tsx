const Lore = () => {
  return (
    <section id="lore" className="min-h-screen flex items-center justify-center py-24 relative">
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="text-5xl md:text-7xl font-bold mb-12 tracking-tight">
          The Lore
        </h2>

        <div className="space-y-6 text-lg md:text-2xl leading-relaxed opacity-90">
          <p>
            Once, we were Okay. Then the light faded.
          </p>
          
          <p>
            From the shadows came Dead Bears — no roadmap, no promises, just bears who stopped pretending to be fine.
          </p>
          
          <p className="font-medium">
            We build. We haunt. We vibe. Either way, we stay dead together.
          </p>
        </div>

        <div className="mt-12 pt-12 border-t border-border">
          <p className="text-xl md:text-2xl opacity-60 italic">
            "Legends never die. They just come back looking worse."
          </p>
        </div>
      </div>
    </section>
  );
};

export default Lore;
