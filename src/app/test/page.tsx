import { HoldStudio } from "@/components/test/HoldStudio";

export default function TestPage() {
  return (
    <section className="relative flex min-h-0 w-full flex-1 flex-col bg-paper">
      <h1 className="sr-only">Hold test</h1>
      <HoldStudio />
    </section>
  );
}
