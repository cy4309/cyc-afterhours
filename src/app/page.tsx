import { HomeHero } from "@/components/home/HomeHero";
import { getClimbWithMedia } from "@/lib/climbs-service";

export const dynamic = "force-dynamic";

const HOME_FILM_ID = "3f934d2f-d43d-459b-b35f-96dcb68dac16";

export default async function Home() {
  const climb = await getClimbWithMedia(HOME_FILM_ID);

  return <HomeHero videoUrl={climb?.videoUrl} posterUrl={climb?.posterUrl} />;
}
