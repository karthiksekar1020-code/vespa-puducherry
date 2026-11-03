import { CartProvider } from "@/components/shop/cart-context";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollEffects } from "@/components/layout/scroll-effects";
import { getUser } from "@/lib/auth";
import { getSettings } from "@/lib/data/settings";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getUser(), getSettings()]);
  return (
    <CartProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-gold focus:px-4 focus:py-2">Skip to content</a>
      <ScrollEffects />
      <Navbar signedIn={Boolean(user)} />
      <CartDrawer />
      <main id="main">{children}</main>
      <Footer settings={settings} />
    </CartProvider>
  );
}
