import type { Metadata } from "next";
import { StoryView } from "./story-view";

export const metadata: Metadata = { title: "Your Full Story" };

export default function StoryPage() {
  return <StoryView />;
}
