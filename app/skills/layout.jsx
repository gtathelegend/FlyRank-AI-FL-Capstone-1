import Footer from "@/components/Footer";

export const metadata = {
	title: "Skills",
	description: "Skills, tools, and technologies Vedaang Sharma works with day-to-day — frontend, backend, AI/ML, mobile, DevOps, and databases.",
	alternates: { canonical: "/skills" },
	openGraph: {
		title: "Skills | Vedaang Sharma",
		description: "Skills, tools, and technologies Vedaang Sharma works with day-to-day — frontend, backend, AI/ML, mobile, DevOps, and databases.",
		url: "/skills",
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
