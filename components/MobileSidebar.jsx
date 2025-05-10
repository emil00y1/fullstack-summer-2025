"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// This only handles the mobile sheet functionality
export function MobileSidebar({ children }) {
  return (
    <div className="md:hidden block fixed z-50 top-4 left-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-10/12 p-0">
          <SheetHeader>
            <VisuallyHidden asChild>
              <SheetTitle>Navigation menu</SheetTitle>
            </VisuallyHidden>
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    </div>
  );
}