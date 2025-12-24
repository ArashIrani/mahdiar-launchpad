import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Headphones } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">مهدیار تراز</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/products" 
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1"
          >
            <ShoppingBag className="h-4 w-4" />
            محصولات
          </Link>
          <Link 
            to="/support" 
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1"
          >
            <Headphones className="h-4 w-4" />
            پشتیبانی
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" className="hidden sm:flex">
            <Link to="/products">خرید محصولات</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
