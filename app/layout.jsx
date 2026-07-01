import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProvider from "@/components/providers/SessionProvider";

export const metadata = {
  title: {
    default: "VideoStream — Watch & Share Videos",
    template: "%s | VideoStream",
  },
  description:
    "VideoStream is a premium video streaming platform. Upload, watch, and share videos with the world.",
  keywords: ["video streaming", "upload videos", "watch videos", "video platform"],
  openGraph: {
    title: "VideoStream",
    description: "Premium video streaming platform",
    type: "website",
  },
};

export default async function RootLayout({ children }) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (_) {}

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
