import type { Metadata } from "next";
import { HandView } from "./hand-view";

export const metadata: Metadata = { title: "Your Hand" };

export default function HandPage() {
  return <HandView />;
}
