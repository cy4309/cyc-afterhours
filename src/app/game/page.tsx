import { GameView } from "@/components/game/GameView";

export default function GamePage() {
  return (
    <section className="flex min-h-0 w-full flex-1 flex-col">
      <h1 className="sr-only">Game</h1>
      <GameView />
    </section>
  );
}
