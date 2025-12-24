import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Logo & Brand */}
          <div className="text-center md:text-right">
            <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg transition-transform group-hover:scale-105">
                م
              </div>
              <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                مهدیار تراز
              </span>
            </Link>
            <p className="text-body-sm text-muted-foreground">
              آموزش حرفه‌ای نرم‌افزار حسابداری هلو
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-body-sm">
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              قوانین و مقررات
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              حریم خصوصی
            </Link>
            <Link to="/refund" className="text-muted-foreground hover:text-primary transition-colors">
              بازگشت وجه
            </Link>
            <Link to="/support" className="text-muted-foreground hover:text-primary transition-colors">
              پشتیبانی
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-body-sm text-muted-foreground">
            © {currentYear} مهدیار تراز. تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
