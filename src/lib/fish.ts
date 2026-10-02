import { CurrentFishingSession } from "../commands/utility/fish-handler";

export interface FishingResult {
  timestamp: number;
  userId: string;
  location: string;
  loot: Array<{ name: string, count: number }>;
  exp: number;
}

export async function play(current: CurrentFishingSession): Promise<FishingResult> {
  ++current.session.fishCaught;

  // Hard coded example for now
  return {
    timestamp: Date.now(),
    userId: current.session.userId,
    location: "localhost",
    loot: [
      { name: "Widget", count: 4 },
      { name: "Cookie", count: 2 },
    ],
    exp: 123,
  };
}
