import type { Command } from "../index";

export interface UserInfo {
  userId: string;
  displayName: string; // TODO: need to sanitize member name
  level: number;
  biome: string; // TODO: to create biome type
  fishingRod: string; // TODO: to create fishing rod type
}

export default {
  data: {
    description: "Provides information about the user.",
    name: "user",
  },
  async execute(interaction) {
    await interaction.reply(
      `This command was run by ${interaction.user.username}.`,
    );
  },
} satisfies Command;

export function getUserInfo(userId: string): UserInfo {
// TODO: Fetch from cache or database, a global cache class must be created so other commands can
// fetch from cache
  return {
    userId: "1234",
    displayName: "John Mousepad",
    level: 1,
    biome: "localhost",
    fishingRod: "Wooden Rod",
  }
}
