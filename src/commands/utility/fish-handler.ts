import {
  ChatInputCommandInteraction,
  type Guild,
  TextChannel,
  ThreadChannel,
} from "discord.js";
import { Logger } from "pino";
import { getGuildOrReply, getTextChannelOrReply } from "./reply";
import { getUserInfo, UserInfo } from "./user";
import { FishingResult, play } from "../../lib/fish";

const activeFishingSessions = new Map<string, FishingSession>();

export interface FishingSession {
  fishingSessionKey: string;
  guildId: string;
  userId: string;
  channel: TextChannel | ThreadChannel;
}

export interface CurrentFishingSession {
  session: FishingSession;
  user: UserInfo;
}

export async function handleFishCommand(
  interaction: ChatInputCommandInteraction,
  log: Logger,
): Promise<void> {
  const guild = await getGuildOrReply(interaction, "You can only use this command in a server.");
  if (guild === null) {
    return;
  }

  // TODO: Implement ThreadChannel check
  const channel = await getTextChannelOrReply(interaction, "You can only create a fishing spot in a text channel or thread.");
  if (channel === null) {
    return;
  }

  const fishingSessionKey = generateFishingSessionKey(interaction, guild);

  // TODO: Implement rate limit: Discord API and server-side. Or maybe handle it in fish cmd
  // instead of handler. Create Collection.
  const current = await getCurrentFishingSession({
    interaction,
    guild,
    channel,
    fishingSessionKey,
    log,
  })

  const fishingResult = await play(current);

  if (!fishingResult) {
    return;
  }

  await handleFishReply({
    interaction,
    current,
    channel,
    fishingResult,
    log
  });
}

function generateFishingSessionKey(
  interaction: ChatInputCommandInteraction,
  guild: Guild,
): string {
  return `${guild.id}:${interaction.user.id}`
}

async function getCurrentFishingSession(params:{
  interaction: ChatInputCommandInteraction;
  guild: Guild;
  channel: TextChannel | ThreadChannel;
  fishingSessionKey: string;
  log: Logger;
}): Promise<CurrentFishingSession> {
  const { interaction } = params;
  const userId = interaction.user.id;

  const fishingSession = await getFishingSession(params)
  const userInfo = await getUserInfo(userId);

  return {
    session: fishingSession,
    user: userInfo,
  };
}

async function getFishingSession(params: {
  interaction: ChatInputCommandInteraction;
  guild: Guild;
  channel: TextChannel | ThreadChannel;
  fishingSessionKey: string;
  log: Logger;
}): Promise<FishingSession> {
  const { fishingSessionKey } = params;

  const fishingSession = activeFishingSessions.get(fishingSessionKey)
    ?? await createNewFishingSession(params);

  rememberFishingSession(fishingSessionKey, fishingSession);

  return fishingSession;
}

async function createNewFishingSession(params: {
  interaction: ChatInputCommandInteraction;
  guild: Guild;
  channel: TextChannel | ThreadChannel;
  fishingSessionKey: string;
  log: Logger;
}): Promise<FishingSession> {
  const { interaction, guild, channel, fishingSessionKey } = params;
  const fishingSession ={
    fishingSessionKey: fishingSessionKey,
    guildId: guild.id,
    userId: interaction.user.id,
    channel: channel,
  }
  return fishingSession;
}

function rememberFishingSession(fishingSessionKey: string, fishingSession: FishingSession): void {
  activeFishingSessions.set(fishingSessionKey, fishingSession);
}

async function handleFishReply(params: {
  interaction: ChatInputCommandInteraction,
  current: CurrentFishingSession,
  channel: TextChannel | ThreadChannel,
  fishingResult: FishingResult,
  log: Logger,
}): Promise<void> {
  //
}
