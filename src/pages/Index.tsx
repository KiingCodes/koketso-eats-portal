import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, UtensilsCrossed, Soup, Clock, Cake } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroBanner from "@/assets/hero-banner.jpg";
import { motion } from "framer-motion";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <img src={heroBanner} alt="Delicious food at Koketso" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/30" />
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-lg"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-card mb-4">
              Koketso Dining & Bakery
            </h1>
            <p className="text-card/80 text-lg mb-8">
              From hearty stews & pap to fresh pastas, rice dishes, baked treats & more — authentic flavours delivered to your door or ready for pickup.
            </p>
            <div className="flex gap-3">
              <Button asChild size="lg">
                <Link to="/menu">
                  Order Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Soup, title: "Traditional Meals", desc: "Stews, pap, rice & hearty home-cooked favourites" },
            { icon: UtensilsCrossed, title: "Full Menu", desc: "Pastas, burgers, baked goods & chef's specials" },
            { icon: Clock, title: "Quick Service", desc: "Order ahead, skip the queue" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="text-center p-6"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <f.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Koketso Dining & Bakery. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
