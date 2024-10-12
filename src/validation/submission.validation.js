import { z } from "zod";

const submissionSchema = z.object({
  code: z.string().trim().min(1, "Code is required"),
  languageId: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(50),
  ]),
});

export default submissionSchema;
