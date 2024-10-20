import { z } from "zod";

const languageIdEnum = z.union([
  z.literal(50),
  z.literal(54),
  z.literal(62),
  z.literal(63),
  z.literal(71),
]);

const languageIdEnumString = z.union([
  z.literal("50"),
  z.literal("54"),
  z.literal("62"),
  z.literal("63"),
  z.literal("71"),
]);

const submissionSchema = z.object({
  sourceCode: z.string().trim().min(1, "Code is required"),
  languageId: z.union([languageIdEnum, languageIdEnumString]),
});

export default submissionSchema;
