import {
  ChatInputCommandInteraction,
  type Guild,
  type TextChannel,
  type ThreadChannel,
} from "discord.js";

import type { Command } from "../index";

export interface UserInfo {
  userId: string;
  displayName: string;
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

export async function getUserInfo(params: {
  interaction: ChatInputCommandInteraction;
  channel: TextChannel | ThreadChannel;
  guild: Guild;
  userId: string;
}): Promise<UserInfo> {
// TODO: Fetch from cache or database, a global cache class must be created so other commands can
// fetch from cache
  const { guild, userId } = params;
  const member = await guild.members.fetch(userId);
  return {
    userId: userId,
    displayName: member.displayName,
    level: 1,
    biome: "localhost",
    fishingRod: "Wooden Rod",
  }
}
