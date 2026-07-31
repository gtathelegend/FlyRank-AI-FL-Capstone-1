import Footer from "@/components/Footer";

export const metadata = {
  title: "Research",
  description: "Published research and academic work by Vedaang Sharma — computer vision, AI systems, and human-centered intelligent interfaces.",
  alternates: { canonical: "/research" },
  openGraph: {
    title: "Research | Vedaang Sharma",
    description: "Published research and academic work by Vedaang Sharma — computer vision, AI systems, and human-centered intelligent interfaces.",
    url: "/research",
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
