"use client";

import Footer from "@/components/Footer";

export default function Layout({ children }) {
	return (
		<>
			{children}
			<Footer />
		</>
	);
}
