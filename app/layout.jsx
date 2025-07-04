import { Libre_Franklin } from "next/font/google";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import { SideBar } from "@/components/SideBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarRight from "@/components/SidebarRight";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
});

export const metadata = {
  title: "Y. It's what's happening / Y",
  description: "Y. It's what's happening / Y",
};

export default async function RootLayout({ children }) {
  const session = await auth();
  const isLoggedIn = !!session;

  return (
    <html
      lang="en"
      className={`${libreFranklin.variable} antialiased`}
      suppressHydrationWarning
    >
      <body
        className={`overflow-x-hidden flex justify-center ${
          !isLoggedIn ? "min-h-svh" : ""
        }`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeWrapper>
            <div
              className={`flex w-full ${isLoggedIn ? "max-w-5xl" : "flex-col"}`}
            >
              {/* Only show sidebar for authenticated users */}
              {isLoggedIn && (
                <header className="transition-all duration-300 w-16 lg:w-64">
                  <SidebarProvider>
                    <SideBar />
                  </SidebarProvider>
                </header>
              )}
              {!isLoggedIn && <Header />}
              <main
                className={`flex-1 px-0 md:px-0 ${
                  !isLoggedIn ? "w-full flex justify-center" : ""
                }`}
              >
                <SessionProvider>{children}</SessionProvider>
              </main>
              {!isLoggedIn && <Footer />}
              {isLoggedIn && <SidebarRight />}
            </div>
            <Toaster />
          </ThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
