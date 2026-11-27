import { z } from "zod";
import { languages, difficulties } from "./types.ts";

export const bankCapacity = 70;
export const sessionConfig = z.object({
  language: z.enum(languages),
  difficulty: z.enum(difficulties),
  length: z.union([
    z.literal("unlimited"),
    z.coerce.number().int().min(1).max(bankCapacity),
  ]),
  mode: z.enum(["choice", "written", "mixed"]),
  minutes: z.coerce.number().int().min(0).max(180),
  random: z.enum(["on", "off"]),
  sound: z.enum(["on", "off"]),
  tutor: z.enum(["on", "off"]),
});
export type SessionConfig = z.infer<typeof sessionConfig>;
