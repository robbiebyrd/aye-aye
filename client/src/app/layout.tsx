import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {GoogleAnalytics} from '@next/third-parties/google'
import {Suspense} from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
        <head>
            <title>Aye-Aye! A Word Game</title>
        </head>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-sherwood-green-700`}
        >
        <Suspense>
            {children}
        </Suspense>
        <GoogleAnalytics gaId="G-48JLDPEWZ6"/>
        </body>
        </html>
    );
}
