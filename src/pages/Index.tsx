import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, UtensilsCrossed, Soup, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroBanner from "@/assets/hero-banner.jpg";
import carouselStew from "@/assets/carousel-stew.jpg";
import carouselBakery from "@/assets/carousel-bakery.jpg";
import carouselPasta from "@/assets/carousel-pasta.jpg";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Footer from "@/components/Footer";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_featured: boolean | null;
}

export default function Index() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .eq("in_stock", true)
      .limit(4)
      .then(({ data }) => {
        if (data) setFeaturedProducts(data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <img src={heroBanner} alt="Koketso Dining & Bakery" className="absolute inset-0 w-full h-full object-contain bg-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 container mx-auto px-4 h-full flex items-end pb-12 justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <div className="flex gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/menu">
                  Order Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image Carousel */}
      <section className="py-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Taste the Diversity
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From traditional South African comfort foods to international favourites — every dish tells a story
            </p>
          </motion.div>

          <Carousel
            plugins={[autoplayPlugin.current]}
            className="w-full max-w-5xl mx-auto"
            onMouseEnter={autoplayPlugin.current.stop}
            onMouseLeave={autoplayPlugin.current.reset}
          >
            <CarouselContent>
              {[
                { img: carouselStew, title: "Traditional Stews & Pap", desc: "Hearty home-cooked classics" },
                { img: carouselBakery, title: "Artisan Baked Goods", desc: "Fresh from our ovens daily" },
                { img: carouselPasta, title: "Comfort Pastas", desc: "Creamy, delicious, satisfying" },
              ].map((slide, i) => (
                <CarouselItem key={i}>
                  <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden group">
                    <img
                      src={slide.img}
                      alt={slide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-card">
                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="font-display text-2xl md:text-4xl font-bold mb-2"
                      >
                        {slide.title}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="text-card/90 text-lg md:text-xl mb-4"
                      >
                        {slide.desc}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button asChild size="lg" variant="secondary">
                          <Link to="/menu">Explore Menu</Link>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      </section>

      {/* Specials of the Day */}
      {featuredProducts.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-display text-3xl md:text-4xl font-bold mb-3"
              >
                Today's Specials
              </motion.h2>
              <p className="text-muted-foreground">Fresh favourites handpicked for you</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-lg border overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-5xl">
                        🍽️
                      </div>
                    )}
                    <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                      Special
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-2xl font-bold text-primary">
                        R{product.price.toFixed(2)}
                      </span>
                      <Button size="sm" asChild>
                        <Link to="/menu">Order Now</Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

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
      <Footer />
    </div>
  );
}
