import Footer from "@/components/Footer";

export const metadata = {
	title: "Contact",
	description: "Get in touch with Vedaang Sharma — open to collaborations, freelance work, or just a conversation about building something great.",
	alternates: { canonical: "/contact" },
	openGraph: {
		title: "Contact | Vedaang Sharma",
		description: "Get in touch with Vedaang Sharma — open to collaborations, freelance work, or just a conversation.",
		url: "/contact",
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
