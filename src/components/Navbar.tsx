import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => scrollToSection("hero")}
          className="text-3xl font-display font-bold tracking-tight hover:opacity-70 transition-opacity"
        >
          Dead Bears
        </button>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("lore")}
            className="text-sm font-medium hover:opacity-70 transition-opacity"
          >
            Lore
          </button>
          <button
            onClick={() => scrollToSection("gallery")}
            className="text-sm font-medium hover:opacity-70 transition-opacity"
          >
            Gallery
          </button>
          <button
            onClick={() => scrollToSection("join")}
            className="text-sm font-medium hover:opacity-70 transition-opacity"
          >
            Join
          </button>
        </div>

        <Button
          variant="default"
          size="sm"
          asChild
          className="font-medium"
        >
          <Link to="/terminal">
            Enter Terminal
          </Link>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
