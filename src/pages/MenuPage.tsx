import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { ShoppingCart, Plus, Eye, Flame } from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import ProductQuickView from "@/components/ProductQuickView";
import StarRating from "@/components/StarRating";

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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [productRatings, setProductRatings] = useState<Record<string, number>>({});
  const { addItem } = useCart();

  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => {
      if (data) {
        setCategories(data);
        if (data.length > 0) setActiveCategory(data[0].id);
      }
    });
    supabase.from("products").select("*").order("name").then(async ({ data }) => {
      if (data) {
        setProducts(data);
        // Fetch ratings for all products
        const ratings: Record<string, number> = {};
        await Promise.all(
          data.map(async (product) => {
            const { data: rating } = await supabase.rpc("get_product_rating", {
              product_uuid: product.id,
            });
            if (rating !== null) {
              ratings[product.id] = Number(rating);
            }
          })
        );
        setProductRatings(ratings);
      }
    });
  }, []);

  const filtered = activeCategory
    ? products.filter((p) => p.category_id === activeCategory)
    : products;

  const dealProducts = products.filter((p) => p.on_sale && p.in_stock);

  const handleAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.in_stock) return;
    const effectivePrice = product.on_sale && product.sale_price ? product.sale_price : product.price;
    addItem({ id: product.id, name: product.name, price: effectivePrice, image_url: product.image_url });
    toast.success(`${product.name} added to cart`);
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 mt-4">
        <h1 className="font-display text-3xl font-bold mb-6">Our Menu</h1>

        {/* Deals Section */}
        {dealProducts.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border-2 border-red-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-6 w-6 text-red-500" />
              <h2 className="font-display text-2xl font-bold">Hot Deals</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {dealProducts.slice(0, 4).map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-lg border overflow-hidden group cursor-pointer"
                  onClick={() => handleQuickView(product)}
                >
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {productImages[product.name] ? (
                      <img src={productImages[product.name]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">🍽️</div>
                    )}
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                      {product.sale_price && Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
                    </Badge>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-display text-lg font-bold text-primary">
                        R{product.sale_price?.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        R{product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

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
              className="bg-card rounded-lg border overflow-hidden group cursor-pointer"
              onClick={() => handleQuickView(product)}
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
                {product.on_sale && product.in_stock && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">SALE</Badge>
                )}
                {product.is_featured && product.in_stock && !product.on_sale && (
                  <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">Featured</Badge>
                )}
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickView(product);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground">{product.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <StarRating rating={productRatings[product.id] || 0} size={14} />
                  <span className="text-xs text-muted-foreground ml-1">
                    ({productRatings[product.id]?.toFixed(1) || "0.0"})
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-lg font-bold text-primary">
                      R{(product.on_sale && product.sale_price ? product.sale_price : product.price).toFixed(2)}
                    </span>
                    {product.on_sale && product.sale_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        R{product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    disabled={!product.in_stock}
                    onClick={(e) => handleAdd(product, e)}
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

      <ProductQuickView
        product={selectedProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
        productImage={selectedProduct ? productImages[selectedProduct.name] : undefined}
      />
    </div>
  );
}
