import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { ShoppingCart, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

// Import menu images
import chickenBurger from "@/assets/menu/chicken-burger.jpg";
import classicBeefBurger from "@/assets/menu/classic-beef-burger.jpg";
import doubleStackBurger from "@/assets/menu/double-stack-burger.jpg";
import veggieBurger from "@/assets/menu/veggie-burger.jpg";
import beefStew from "@/assets/menu/beef-stew.jpg";
import chickenCurry from "@/assets/menu/chicken-curry.jpg";
import lambStew from "@/assets/menu/lamb-stew.jpg";
import sundayRoast from "@/assets/menu/sunday-roast.jpg";
import breakfastCombo from "@/assets/menu/breakfast-combo.jpg";
import creamyMushroomPasta from "@/assets/menu/creamy-mushroom-pasta.jpg";
import spicyTomatoPasta from "@/assets/menu/spicy-tomato-pasta.jpg";
import cheesecake from "@/assets/menu/cheesecake.jpg";
import chocolateFudgeCake from "@/assets/menu/chocolate-fudge-cake.jpg";
import redVelvetCake from "@/assets/menu/red-velvet-cake.jpg";
import carrotCake from "@/assets/menu/carrot-cake.jpg";
import bananaBread from "@/assets/menu/banana-bread.jpg";
import sourdoughLoaf from "@/assets/menu/sourdough-loaf.jpg";
import ciabattaRoll from "@/assets/menu/ciabatta-roll.jpg";
import cappuccino from "@/assets/menu/cappuccino.jpg";
import icedLatte from "@/assets/menu/iced-latte.jpg";
import freshOrangeJuice from "@/assets/menu/fresh-orange-juice.jpg";

const productImages: Record<string, string> = {
  "Chicken Burger": chickenBurger,
  "Classic Beef Burger": classicBeefBurger,
  "Double Stack Burger": doubleStackBurger,
  "Veggie Burger": veggieBurger,
  "Beef Stew & Pap": beefStew,
  "Chicken Curry & Rice": chickenCurry,
  "Lamb Stew": lambStew,
  "Sunday Roast Platter": sundayRoast,
  "Breakfast Combo": breakfastCombo,
  "Creamy Mushroom Pasta": creamyMushroomPasta,
  "Spicy Tomato Pasta": spicyTomatoPasta,
  "Cheesecake Slice": cheesecake,
  "Chocolate Fudge Cake": chocolateFudgeCake,
  "Red Velvet Cake": redVelvetCake,
  "Carrot Cake": carrotCake,
  "Banana Bread": bananaBread,
  "Sourdough Loaf": sourdoughLoaf,
  "Ciabatta Roll": ciabattaRoll,
  "Cappuccino": cappuccino,
  "Iced Latte": icedLatte,
  "Fresh Orange Juice": freshOrangeJuice,
};

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  in_stock: boolean | null;
  category_id: string | null;
  is_featured: boolean | null;
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => {
      if (data) {
        setCategories(data);
        if (data.length > 0) setActiveCategory(data[0].id);
      }
    });
    supabase.from("products").select("*").order("name").then(({ data }) => {
      if (data) setProducts(data);
    });
  }, []);

  const filtered = activeCategory
    ? products.filter((p) => p.category_id === activeCategory)
    : products;

  const handleAdd = (product: Product) => {
    if (!product.in_stock) return;
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 mt-4">
        <h1 className="font-display text-3xl font-bold mb-6">Our Menu</h1>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className="whitespace-nowrap"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-lg border overflow-hidden group"
            >
              <div className="aspect-square bg-muted relative overflow-hidden">
                {productImages[product.name] ? (
                  <img src={productImages[product.name]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">
                    🍽️
                  </div>
                )}
                {!product.in_stock && (
                  <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
                  </div>
                )}
                {product.is_featured && product.in_stock && (
                  <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">Featured</Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-display text-lg font-bold text-primary">
                    R{product.price.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    disabled={!product.in_stock}
                    onClick={() => handleAdd(product)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No products in this category yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
