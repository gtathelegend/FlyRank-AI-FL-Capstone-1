import "./globals.css";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
import "./nprogress.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import ClientTopProgressBar from "@/components/ClientTopProgressBar";
import ShellChrome from "@/components/ShellChrome";
import AuroraBackground from "@/components/AuroraBackground";
import { THEME_INIT_SCRIPT } from "@/components/ThemeProvider";

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-space-grotesk",
});

const inter = Inter({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	variable: "--font-jetbrains-mono",
});

export const viewport = {
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
	themeColor: "#ffffff",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vedaangsharma.dev";

export const metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: "Vedaang Sharma | Portfolio",
		template: "%s | Vedaang Sharma",
	},
	description: "Vedaang Sharma — Full Stack & AI Systems Developer. I build high-performance web apps, AI-powered products, and thoughtful user experiences.",
	icons: {
		icon: [{ url: "/favicon.ico" }],
	},
	keywords: [
		"Vedaang Sharma",
		"Portfolio",
		"Full Stack Developer",
		"AI Systems Developer",
		"Next.js",
		"React",
		"Node.js",
		"Computer Vision",
		"Machine Learning",
	],
	authors: [{ name: "Vedaang Sharma", url: SITE_URL }],
	creator: "Vedaang Sharma",
	alternates: {
		canonical: SITE_URL,
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: SITE_URL,
		title: "Vedaang Sharma | Portfolio",
		description: "Full Stack & AI Systems Developer. Projects, research, and writing by Vedaang Sharma.",
		siteName: "Vedaang Sharma",
		images: [
			{
				url: "/og-image-rev.png",
				width: 1200,
				height: 630,
				alt: "Vedaang Sharma — Full Stack & AI Systems Developer",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Vedaang Sharma | Portfolio",
		description: "Full Stack & AI Systems Developer. Projects, research, and writing by Vedaang Sharma.",
		images: ["/og-image-rev.png"],
	},
};

/* ─── JSON-LD structured data ───────────────────────────────────────────────
   Person + WebSite schemas give Google the signals it needs to:
   - Understand who this site is about
   - Generate sitelinks (the stacked sub-links under the main search result)
   - Populate the Knowledge Panel for the name "Vedaang Sharma"
   ─────────────────────────────────────────────────────────────────────────── */
const personJsonLd = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: "Vedaang Sharma",
	url: SITE_URL,
	image: `${SITE_URL}/og-image-rev.png`,
	jobTitle: "Full Stack & AI Systems Developer",
	description: "CS student, published researcher, and full-stack engineer building AI agents, distributed systems, and cloud-native applications.",
	email: "vedaangsharma2006@gmail.com",
	sameAs: [
		"https://github.com/gtathelegend",
		"https://www.linkedin.com/in/vedaangsharma2006/",
	],
	knowsAbout: [
		"Full Stack Development",
		"Artificial Intelligence",
		"Computer Vision",
		"Machine Learning",
		"Next.js",
		"React",
		"Node.js",
		"Cloud Architecture",
	],
};

const websiteJsonLd = {
	"@context": "https://schema.org",
	"@type": "WebSite",
	name: "Vedaang Sharma",
	url: SITE_URL,
	description: "Portfolio of Vedaang Sharma — Full Stack & AI Systems Developer.",
	author: {
		"@type": "Person",
		name: "Vedaang Sharma",
	},
	/* Sitelinks Searchbox — lets Google show a search input under your result */
	potentialAction: {
		"@type": "SearchAction",
		target: {
			"@type": "EntryPoint",
			urlTemplate: `${SITE_URL}/projects?q={search_term_string}`,
		},
		"query-input": "required name=search_term_string",
	},
};

export default function RootLayout({ children }) {
	return (
		<html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				{/* Structured data — parsed by Google for sitelinks & Knowledge Panel */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
				/>
			</head>
			<body className="font-body text-[#181713] dark:text-[#F7F5DC] bg-[#F7F5DC] dark:bg-[#141310] selection:bg-[#FFC233] selection:text-[#181713] antialiased">
				<ClientTopProgressBar />
				<ShellChrome />
				<div className="relative isolate min-h-screen bg-[#F7F5DC] dark:bg-[#141310]">
					<AuroraBackground />
					{children}
				</div>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
