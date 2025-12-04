import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Lore from "@/components/Lore";
// import Gallery from "@/components/Gallery";
import Join from "@/components/Join";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Lore />
      {/* <Gallery /> */}
      <Join />
      <Footer />
    </div>
  );
};

export default Index;
