import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default function AuthLayout({ children }) {
  return (
    <>
      <Header />
      <main style={{ minHeight: "calc(100vh - 200px)" }}>{children}</main>
      <Footer />
    </>
  );
}
