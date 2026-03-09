import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { Package, Clock, FileText, CreditCard, Banknote } from "lucide-react";
import { format } from "date-fns";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  notes: string | null;
  created_at: string;
  payment_method: string | null;
  payment_status: string | null;
  payment_proof_url: string | null;
  order_items: OrderItem[];
}

const statusColors: Record<string, string> = {
  pending: "bg-warning text-warning-foreground",
  confirmed: "bg-primary text-primary-foreground",
  preparing: "bg-primary text-primary-foreground",
  ready: "bg-success text-success-foreground",
  delivered: "bg-success text-success-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  verified: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofDialogOpen, setProofDialogOpen] = useState(false);
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data as Order[]);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 max-w-2xl mt-6">
        <h1 className="font-display text-3xl font-bold mb-6">My Orders</h1>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), "dd MMM yyyy, HH:mm")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[order.status] || ""}>{order.status}</Badge>
                      {order.payment_status && (
                        <Badge className={paymentStatusColors[order.payment_status] || ""}>
                          {order.payment_status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {order.payment_method && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {order.payment_method === "bank_transfer" ? (
                        <CreditCard className="h-4 w-4" />
                      ) : (
                        <Banknote className="h-4 w-4" />
                      )}
                      <span>{order.payment_method === "bank_transfer" ? "Bank Transfer" : "Cash on Delivery"}</span>
                      {order.payment_proof_url && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 text-primary hover:text-primary/80"
                          onClick={() => {
                            setSelectedProofUrl(order.payment_proof_url);
                            setProofDialogOpen(true);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Proof
                        </Button>
                      )}
                    </div>
                  )}
                  <div className="space-y-1">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span className="text-muted-foreground">R{(item.unit_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">R{order.total.toFixed(2)}</span>
                  </div>
                  {order.notes && (
                    <p className="text-sm text-muted-foreground italic">Note: {order.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={proofDialogOpen} onOpenChange={setProofDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          {selectedProofUrl && (
            <div className="mt-4">
              <img 
                src={selectedProofUrl} 
                alt="Payment proof" 
                className="w-full h-auto rounded-md border"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
