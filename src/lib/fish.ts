import { CurrentFishingSession } from "../commands/utility/fish-handler";

export interface FishingResult {
  // TODO: Placeholder signature
  loot: string[]; // replace with Loot or Fish type
  exp: number;
}

export async function play(current: CurrentFishingSession): Promise<FishingResult> {
  return {
    loot: ["Widget", "Cookie"],
    exp: 123,
  };
}
