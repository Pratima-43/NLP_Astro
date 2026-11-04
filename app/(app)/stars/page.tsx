import type { Metadata } from "next";
import { StarsView } from "./stars-view";

export const metadata: Metadata = { title: "Your Stars" };

export default function StarsPage() {
  return <StarsView />;
}
