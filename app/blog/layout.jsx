import Footer from "@/components/Footer";

export const metadata = {
  title: "Blog",
  description: "Technical writing by Vedaang Sharma on AI systems, full-stack engineering, and building software that matters.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | Vedaang Sharma",
    description: "Technical writing by Vedaang Sharma on AI systems, full-stack engineering, and building software that matters.",
    url: "/blog",
  },
};

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
