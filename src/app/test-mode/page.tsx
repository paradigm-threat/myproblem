import type { Metadata } from "next";
import { TestModeClient } from "./TestModeClient";

export const metadata: Metadata = {
  title: "Test Mode",
  description:
    "Offline browser frame gate — getUserMedia preview, unique/worthy detection, no upload.",
  robots: { index: false, follow: false },
};

export default function TestModePage() {
  return <TestModeClient />;
}
