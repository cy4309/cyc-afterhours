import { HoldStudio } from "@/components/story/HoldStudio";

export default function StoryPage() {
  return (
    <section className="relative flex min-h-0 w-full flex-1 flex-col bg-paper">
      <h1 className="sr-only">Story</h1>
      <HoldStudio />
    </section>
  );
}
