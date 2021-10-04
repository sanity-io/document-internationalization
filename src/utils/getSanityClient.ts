import client from "part:@sanity/base/client";
export const getSanityClient = (): import("@sanity/client").SanityClient =>
  client.withConfig({ apiVersion: `2021-10-01` });
