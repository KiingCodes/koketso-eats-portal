import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  province: string | null;
  postal_code: string | null;
  is_default: boolean | null;
}

export default function Profile() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "Home", street: "", city: "", province: "", postal_code: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
      }
    });
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    if (!user) return;
    const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("created_at");
    if (data) setAddresses(data);
  };

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone }).eq("user_id", user.id);
    if (error) toast.error("Failed to update profile");
    else toast.success("Profile updated!");
  };

  const addAddress = async () => {
    if (!user) return;
    const { error } = await supabase.from("addresses").insert({
      user_id: user.id,
      ...newAddress,
    });
    if (error) toast.error("Failed to add address");
    else {
      toast.success("Address added!");
      setShowAddAddress(false);
      setNewAddress({ label: "Home", street: "", city: "", province: "", postal_code: "" });
      loadAddresses();
    }
  };

  const deleteAddress = async (id: string) => {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) toast.error("Failed to delete address");
    else {
      toast.success("Address removed");
      loadAddresses();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 max-w-2xl space-y-6 mt-6">
        <h1 className="font-display text-3xl font-bold">My Profile</h1>

        <Card>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+27..." />
            </div>
            <Button onClick={saveProfile}>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Saved Addresses</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowAddAddress(!showAddAddress)}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAddAddress && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Label</Label>
                    <Input value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} />
                  </div>
                  <div>
                    <Label>Postal Code</Label>
                    <Input value={newAddress.postal_code} onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Street</Label>
                  <Input value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>City</Label>
                    <Input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                  </div>
                  <div>
                    <Label>Province</Label>
                    <Input value={newAddress.province} onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })} />
                  </div>
                </div>
                <Button onClick={addAddress} size="sm">Save Address</Button>
              </div>
            )}

            {addresses.length === 0 && !showAddAddress && (
              <p className="text-muted-foreground text-center py-4">No saved addresses yet</p>
            )}

            {addresses.map((addr) => (
              <div key={addr.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{addr.label}</p>
                    <p className="text-sm text-muted-foreground">{addr.street}, {addr.city}</p>
                    {addr.province && <p className="text-sm text-muted-foreground">{addr.province} {addr.postal_code}</p>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteAddress(addr.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
