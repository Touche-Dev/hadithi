import { Outlet } from "react-router-dom";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { RootErrorBoundary } from "@/components/site/RootErrorBoundary";

/** App shell — equivalent of the previous `src/routes/__root.tsx` component. */
export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <RootErrorBoundary>
          <Outlet />
        </RootErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
