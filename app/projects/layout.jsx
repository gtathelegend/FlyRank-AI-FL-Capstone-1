import Footer from "@/components/Footer";

export const metadata = {
  title: "Projects",
  description: "Software projects by Vedaang Sharma — AI agents, full-stack web apps, computer vision systems, and cloud-native applications.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects | Vedaang Sharma",
    description: "Software projects by Vedaang Sharma — AI agents, full-stack web apps, computer vision systems, and cloud-native applications.",
    url: "/projects",
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