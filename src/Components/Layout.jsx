// src/components/Layout.jsx
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content only */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer appears on every page */}
      <Footer />
    </div>
  );
}