import {
  ChatInputCommandInteraction,
  ContainerBuilder,
  type Guild,
  MessageFlags,
  TextChannel,
  ThreadChannel,
} from "discord.js";
import { Logger } from "pino";
import { getGuildOrReply, getTextChannelOrReply } from "./reply";
import { getUserInfo, UserInfo } from "./user";
import { FishingResult, play } from "../../lib/fish";

const activeFishingSessions = new Map<string, FishingSession>();

// TODO: store in DB in the future
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

const CONTAINER_COLOR_ACCENT = 5865242;

export async function handleFishCommand(
  interaction: ChatInputCommandInteraction,
  log: Logger,
): Promise<void> {
  const guild = await getGuildOrReply(interaction, "You can only use this command in a server.");
  if (guild === null) {
    return;
  }

  // TODO: implement ThreadChannel check
  const channel = await getTextChannelOrReply(interaction, "You can only create a fishing spot in a text channel or thread.");
  if (channel === null) {
    return;
  }

  const fishingSessionKey = generateFishingSessionKey(interaction, guild);

  // TODO: implement rate limit: Discord API and server-side
  const current = await getCurrentFishingSession({
    interaction,
    guild,
    channel,
    fishingSessionKey,
    log,
  })

  if (!current) {
    return;
  }

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
}): Promise<CurrentFishingSession | null> {
  const { interaction, channel, guild } = params;
  const userId = interaction.user.id;
  // TODO: Store member in cache only, not DB. Need to implement Cache object.
  const fishingSession = await getFishingSession(params)
  const userInfo = await getUserInfo({
    interaction,
    channel,
    guild,
    userId,
  });

  if (!userInfo) {
    return null;
  }

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

  const fishingSession = await fetchExistingFishingSession(fishingSessionKey)
    ?? createNewFishingSession(params);

  rememberFishingSession(fishingSessionKey, fishingSession);

  return fishingSession;
}

async function fetchExistingFishingSession(
  fishingSessionKey: string,
): Promise<FishingSession | null> {
  /* TODO: Extend this function to fetch asynchronously from an in-memory cache
   * object in the future.
   */
  const fishingSession = activeFishingSessions.get(fishingSessionKey);
  if (fishingSession === undefined) {
    activeFishingSessions.delete(fishingSessionKey);
    return null;
  }
  return fishingSession;
}

function createNewFishingSession(params: {
  interaction: ChatInputCommandInteraction;
  guild: Guild;
  channel: TextChannel | ThreadChannel;
  fishingSessionKey: string;
  log: Logger;
}): FishingSession {
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
