import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Package, Users, DollarSign, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  in_stock: boolean | null;
  is_featured: boolean | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  sort_order: number | null;
}

interface Order {
  id: string;
  status: string;
  total: number;
  notes: string | null;
  created_at: string;
  user_id: string | null;
  order_items: { id: string; product_name: string; quantity: number; unit_price: number }[];
}

const ORDER_STATUSES = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

export default function AdminDashboard() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [todaySales, setTodaySales] = useState(0);

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Access denied");
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    const [prods, cats, ords] = await Promise.all([
      supabase.from("products").select("*").order("name"),
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(50),
    ]);
    if (prods.data) setProducts(prods.data);
    if (cats.data) setCategories(cats.data);
    if (ords.data) {
      setOrders(ords.data as Order[]);
      const today = new Date().toISOString().split("T")[0];
      const sales = (ords.data as Order[])
        .filter((o) => o.created_at.startsWith(today) && o.status !== "cancelled")
        .reduce((sum, o) => sum + o.total, 0);
      setTodaySales(sales);
    }
  };

  const saveProduct = async () => {
    if (!editProduct?.name || !editProduct?.price) {
      toast.error("Name and price are required");
      return;
    }
    try {
      if (editProduct.id) {
        const { error } = await supabase.from("products").update({
          name: editProduct.name,
          description: editProduct.description,
          price: editProduct.price,
          image_url: editProduct.image_url,
          in_stock: editProduct.in_stock ?? true,
          is_featured: editProduct.is_featured ?? false,
          category_id: editProduct.category_id,
        }).eq("id", editProduct.id);
        if (error) throw error;
        toast.success("Product updated!");
      } else {
        const { error } = await supabase.from("products").insert({
          name: editProduct.name,
          description: editProduct.description,
          price: editProduct.price,
          image_url: editProduct.image_url,
          in_stock: editProduct.in_stock ?? true,
          is_featured: editProduct.is_featured ?? false,
          category_id: editProduct.category_id,
        });
        if (error) throw error;
        toast.success("Product added!");
      }
      setDialogOpen(false);
      setEditProduct(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Product deleted");
      loadData();
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) toast.error("Failed to update status");
    else {
      toast.success("Order status updated");
      loadData();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 mt-4">
        <h1 className="font-display text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: DollarSign, label: "Today's Sales", value: `R${todaySales.toFixed(2)}` },
            { icon: ShoppingBag, label: "Total Orders", value: orders.length },
            { icon: Package, label: "Products", value: products.length },
            { icon: Users, label: "Categories", value: categories.length },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Products</h2>
              <Button onClick={() => { setEditProduct({ in_stock: true, is_featured: false }); setDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Add Product
              </Button>
            </div>

            <div className="grid gap-3">
              {products.map((p) => (
                <Card key={p.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{p.name}</h3>
                        {!p.in_stock && <Badge variant="destructive">Out of Stock</Badge>}
                        {p.is_featured && <Badge>Featured</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        R{p.price.toFixed(2)} • {categories.find((c) => c.id === p.category_id)?.name || "Uncategorized"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditProduct(p); setDialogOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4 mt-4">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), "dd MMM yyyy, HH:mm")}
                      </span>
                      <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.product_name}</span>
                          <span>R{(item.unit_price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total</span>
                      <span className="text-primary">R{order.total.toFixed(2)}</span>
                    </div>
                    {order.notes && <p className="text-sm text-muted-foreground italic">Note: {order.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Product Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editProduct?.id ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={editProduct?.name || ""} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={editProduct?.description || ""} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price (R)</Label>
                  <Input type="number" step="0.01" value={editProduct?.price || ""} onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={editProduct?.category_id || ""} onValueChange={(v) => setEditProduct({ ...editProduct, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={editProduct?.image_url || ""} onChange={(e) => setEditProduct({ ...editProduct, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={editProduct?.in_stock ?? true} onCheckedChange={(v) => setEditProduct({ ...editProduct, in_stock: v })} />
                  <Label>In Stock</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editProduct?.is_featured ?? false} onCheckedChange={(v) => setEditProduct({ ...editProduct, is_featured: v })} />
                  <Label>Featured</Label>
                </div>
              </div>
              <Button onClick={saveProduct} className="w-full">Save Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
