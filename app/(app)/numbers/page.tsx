import type { Metadata } from "next";
import { NumbersView } from "./numbers-view";

export const metadata: Metadata = { title: "Your Numbers" };

export default function NumbersPage() {
  return <NumbersView />;
}
