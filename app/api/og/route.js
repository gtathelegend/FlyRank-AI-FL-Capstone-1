import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);

		// ?title=Project%20Name&subtitle=Full%20Stack%20Dev
		const title = searchParams.get("title") || "Vedaang Sharma";
		const subtitle = searchParams.get("subtitle") || "Full Stack Developer & AI Enthusiast";

		return new ImageResponse(
			(
				<div
					style={{
						height: "100%",
						width: "100%",
						display: "flex",
						flexDirection: "column",
						alignItems: "flex-start",
						justifyContent: "center",
						backgroundColor: "#fff",
						backgroundImage:
							"radial-gradient(circle at 25px 25px, #f3f4f6 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f3f4f6 2%, transparent 0%)",
						backgroundSize: "100px 100px",
						padding: "80px",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							borderLeft: "8px solid #111827",
							paddingLeft: "40px",
						}}
					>
						<p
							style={{
								fontSize: "24px",
								fontWeight: "bold",
								textTransform: "uppercase",
								letterSpacing: "0.4rem",
								color: "#9ca3af",
								marginBottom: "20px",
							}}
						>
							Vedaang Sharma
						</p>
						<h1
							style={{
								fontSize: "80px",
								fontWeight: "bold",
								color: "#111827",
								lineHeight: 1.1,
								marginBottom: "30px",
								maxWidth: "900px",
							}}
						>
							{title}
						</h1>
						<p
							style={{
								fontSize: "32px",
								color: "#4b5563",
								maxWidth: "800px",
							}}
						>
							{subtitle}
						</p>
					</div>

					<div
						style={{
							position: "absolute",
							bottom: "80px",
							right: "80px",
							display: "flex",
							alignItems: "center",
							gap: "12px",
						}}
					>
						<div
							style={{
								width: "12px",
								height: "12px",
								borderRadius: "50%",
								backgroundColor: "#10b981",
							}}
						/>
						<span
							style={{
								fontSize: "20px",
								fontWeight: "600",
								color: "#6b7280",
							}}
						>
							Available for new projects
						</span>
					</div>
				</div>
			),
			{
				width: 1200,
				height: 630,
			}
		);
	} catch (e) {
		console.log(`${e.message}`);
		return new Response(`Failed to generate the image`, {
			status: 500,
		});
	}
}
