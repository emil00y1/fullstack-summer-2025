import Link from "next/link";
import Logo from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Logo height={32} width={32} className="fill-primary" />
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" className="font-medium" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button className="font-medium" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
