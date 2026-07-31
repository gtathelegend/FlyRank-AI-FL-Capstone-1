import Footer from "@/components/Footer";

export const metadata = {
  title: "About",
  description: "Learn about Vedaang Sharma — CS student, published researcher, and full-stack engineer building AI agents, distributed systems, and cloud-native applications.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | Vedaang Sharma",
    description: "Learn about Vedaang Sharma — CS student, published researcher, and full-stack engineer.",
    url: "/about",
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
