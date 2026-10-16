import { StoryExperience } from "@/components/story/StoryExperience";

export default function StoryPage() {
  return (
    <section className="relative flex h-full min-h-0 w-full flex-1 flex-col bg-[#050506]">
      <h1 className="sr-only">AFTERHOURS — a study of movement</h1>
      <StoryExperience />
    </section>
  );
}
