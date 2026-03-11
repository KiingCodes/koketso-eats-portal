import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Koketso" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-display text-xl font-bold text-foreground hidden sm:block">
            Koketso
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/menu" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            Menu
          </Link>
          {user ? (
            <>
              <Link to="/orders" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                My Orders
              </Link>
              <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Profile
              </Link>
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-1.5 text-muted-foreground hover:text-foreground font-medium h-auto p-0 hover:bg-transparent"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Admin
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                      <Settings className="h-4 w-4 mr-2" />
                      Store Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/cart")}>
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Button>
          {user ? (
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
              <User className="h-4 w-4 mr-1" /> Sign In
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-3 animate-fade-in">
          <Link to="/menu" className="block text-foreground font-medium py-2" onClick={() => setMobileOpen(false)}>
            Menu
          </Link>
          {user && (
            <>
              <Link to="/orders" className="block text-foreground font-medium py-2" onClick={() => setMobileOpen(false)}>
                My Orders
              </Link>
              <Link to="/profile" className="block text-foreground font-medium py-2" onClick={() => setMobileOpen(false)}>
                Profile
              </Link>
              {isAdmin && (
                <>
                  <Link to="/admin" className="block text-foreground font-medium py-2" onClick={() => setMobileOpen(false)}>
                    <LayoutDashboard className="inline h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/settings" className="block text-foreground font-medium py-2" onClick={() => setMobileOpen(false)}>
                    <Settings className="inline h-4 w-4 mr-2" />
                    Store Settings
                  </Link>
                </>
              )}
              <button
                className="block text-destructive font-medium py-2 w-full text-left"
                onClick={handleSignOut}
              >
                <LogOut className="inline h-4 w-4 mr-2" />
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
