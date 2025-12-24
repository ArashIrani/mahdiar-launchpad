import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Logo & Brand */}
          <div className="text-center md:text-right">
            <h3 className="text-heading-sm text-foreground mb-2">مهدیار تراز</h3>
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
