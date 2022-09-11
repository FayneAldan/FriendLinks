/// <reference path="../node_modules/cumcord-types/defs.d.ts" />

import { addCommand } from "@cumcord/commands";

import { findByProps } from "@cumcord/modules/webpack";
const { createFriendInvite } = findByProps("createFriendInvite");
const { getAllFriendInvites } = findByProps("getAllFriendInvites");
const { revokeFriendInvites } = findByProps("revokeFriendInvites");

const patches: (() => void)[] = [];

patches.push(
  addCommand({
    name: "flink",
    description: "Generates a friend link to share",
    args: [],
    handler: async (ctx, send) => {
      try {
        const { code, max_uses, expires_at } = await createFriendInvite();
        const expires = expiresTS(expires_at);
        send(
          `Friend link generated: https://discord.gg/${code}\n` +
            `This friend link has ${max_uses} uses and expires ${expires}`
        );
      } catch (e) {
        console.log(e);
        send("❌ Failed to generate a friend link");
      }
    },
  })
);

patches.push(
  addCommand({
    name: "showlinks",
    description: "Shows all your friend links",
    args: [],
    handler: async (ctx, send) => {
      try {
        const invites = await getAllFriendInvites();
        if (!invites.length) send("❌ You don't have any friend links");
        const list = invites
          .map((invite: any) => {
            const { code, expires_at, max_uses, uses } = invite;
            const usesLeft = max_uses - uses;
            const expires = expiresTS(expires_at);
            return `<https://discord.gg/${code}> (${usesLeft} Uses, Expires ${expires})`;
          })
          .join("\n");
        const { length: count } = invites;
        const countS = count == 1 ? "" : "s";
        send(`You have ${count} friend link${countS}:\n${list}`);
      } catch (e) {
        console.log(e);
        send("❌ Failed to get your friend links");
      }
    },
  })
);

patches.push(
  addCommand({
    name: "revokelinks",
    description: "Revokes all your friend links",
    args: [],
    handler: async (ctx, send) => {
      try {
        await revokeFriendInvites();
        send("✅ Successfully deleted all your friend links");
      } catch (e) {
        console.log(e);
        send("❌ Failed to delete your friend links");
      }
    },
  })
);

function expiresTS(expires_at: string) {
  const unix = new Date(expires_at).getTime() / 1000;
  return `<t:${unix}:R>`;
}

export function onLoad() {}
export function onUnload() {
  for (const patch of patches) patch();
}
