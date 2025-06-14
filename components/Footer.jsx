import Logo from "./Logo";

function Footer() {
  return (
    <footer className="px-6 py-8 border-t bg-background">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <Logo height={24} width={24} className="fill-primary" />
        </div>
        <div className="text-sm text-muted-foreground">
          © 2025 Y. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
