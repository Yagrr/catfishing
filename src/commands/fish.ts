import { SlashCommandBuilder } from "discord.js";
import type { Command } from "./index";
import { handleFishCommand } from "./utility/fish-handler";

export default {
  data: new SlashCommandBuilder()
    .setName("fish")
    .setDescription("Go Fishing!")
  .toJSON(),

  async execute(interaction, ctx) {
    const log = ctx.logger.child({
      channelId: interaction.channelId,
      command: "fish",
      guildId: interaction.guildId,
      interactionId: interaction.id,
      userId: interaction.user.id,
    });

    await handleFishCommand(interaction, log);
  }
} satisfies Command;
