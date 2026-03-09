import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, MessageSquare } from "lucide-react";
import StarRating from "@/components/StarRating";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  in_stock: boolean | null;
  on_sale: boolean | null;
  sale_price: number | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
  };
}

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productImage?: string;
}

export default function ProductQuickView({
  product,
  open,
  onOpenChange,
  productImage,
}: ProductQuickViewProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { addItem } = useCart();

  useEffect(() => {
    if (product && open) {
      fetchReviews();
      fetchRating();
    }
  }, [product, open]);

  const fetchReviews = async () => {
    if (!product) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Fetch profile names separately
      const reviewsWithProfiles = await Promise.all(
        data.map(async (review) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", review.user_id)
            .single();
          
          return {
            ...review,
            profiles: profile || { full_name: null },
          };
        })
      );
      setReviews(reviewsWithProfiles as Review[]);
    }
    setLoading(false);
  };

  const fetchRating = async () => {
    if (!product) return;
    const { data, error } = await supabase.rpc("get_product_rating", {
      product_uuid: product.id,
    });

    if (!error && data !== null) {
      setRating(Number(data));
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !product) {
      toast.error("Please sign in to leave a review");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: product.id,
      user_id: user.id,
      rating: userRating,
      comment: userComment.trim() || null,
    });

    if (error) {
      toast.error("Failed to submit review");
    } else {
      toast.success("Review submitted successfully!");
      setUserComment("");
      setUserRating(5);
      fetchReviews();
      fetchRating();
    }
    setSubmitting(false);
  };

  const handleAddToCart = () => {
    if (!product || !product.in_stock) return;
    const effectivePrice = product.on_sale && product.sale_price ? product.sale_price : product.price;
    addItem({
      id: product.id,
      name: product.name,
      price: effectivePrice,
      image_url: product.image_url,
    });
    toast.success(`${product.name} added to cart`);
  };

  if (!product) return null;

  const effectivePrice = product.on_sale && product.sale_price ? product.sale_price : product.price;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
              {productImage ? (
                <img src={productImage} alt={product.name} className="w-full h-full object-cover" />
              ) : product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
              )}
              {product.on_sale && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                  SALE
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={rating} showValue size={20} />
                  <span className="text-sm text-muted-foreground">
                    ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-display font-bold text-primary">
                    R{effectivePrice.toFixed(2)}
                  </span>
                  {product.on_sale && product.sale_price && (
                    <span className="text-xl text-muted-foreground line-through">
                      R{product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground">{product.description}</p>
              </div>

              <Button
                size="lg"
                disabled={!product.in_stock}
                onClick={handleAddToCart}
                className="w-full"
              >
                <Plus className="mr-2 h-5 w-5" />
                {product.in_stock ? "Add to Cart" : "Out of Stock"}
              </Button>

              <Separator />

              {/* Review Form */}
              {user ? (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Leave a Review
                  </h3>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Your Rating
                    </label>
                    <StarRating
                      rating={userRating}
                      interactive
                      onRatingChange={setUserRating}
                      size={24}
                    />
                  </div>
                  <Textarea
                    placeholder="Share your thoughts about this product..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="w-full"
                  >
                    Submit Review
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center p-4 bg-muted rounded">
                  Please sign in to leave a review
                </p>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Reviews List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Customer Reviews</h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {review.profiles?.full_name || "Anonymous"}
                        </p>
                        <StarRating rating={review.rating} size={14} />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No reviews yet. Be the first to review this product!
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
