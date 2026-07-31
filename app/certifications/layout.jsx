import Footer from "@/components/Footer";

export const metadata = {
  title: "Certifications",
  description: "Verified credentials and certifications in AI, Cloud, DevOps, and engineering earned by Vedaang Sharma.",
  alternates: { canonical: "/certifications" },
  openGraph: {
    title: "Certifications | Vedaang Sharma",
    description: "Verified credentials and certifications in AI, Cloud, DevOps, and engineering earned by Vedaang Sharma.",
    url: "/certifications",
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
