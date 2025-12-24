import { useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Headphones, Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img 
            src={logo} 
            alt="مهدیار تراز - آموزش هلو" 
            className="h-10 w-auto transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation */}
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
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">منو</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            <Link 
              to="/products" 
              className="flex items-center gap-2 p-3 rounded-lg text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingBag className="h-5 w-5" />
              محصولات
            </Link>
            <Link 
              to="/support" 
              className="flex items-center gap-2 p-3 rounded-lg text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Headphones className="h-5 w-5" />
              پشتیبانی
            </Link>
            <Button asChild className="mt-2 w-full">
              <Link to="/products" onClick={() => setIsMenuOpen(false)}>
                خرید محصولات
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
