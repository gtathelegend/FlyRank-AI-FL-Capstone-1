"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import CommandPalette from "@/components/CommandPalette";
import ThemeProvider from "@/components/ThemeProvider";
import TerminalIntro from "@/components/TerminalIntro";
import AskVedaang from "@/components/AskVedaang";

export default function ShellChrome() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const [introReady, setIntroReady] = useState(false);

  if (isAdminRoute) {
    return <ThemeProvider />;
  }

  return (
    <>
      <ThemeProvider />
      <TerminalIntro onDone={() => setIntroReady(true)} />
      <Navbar introReady={introReady} />
      <CommandPalette introReady={introReady} />
      {pathname !== "/ask" && <AskVedaang />}
    </>
  );
}
