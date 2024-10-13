import { z } from "zod";

const submissionSchema = z.object({
  sourceCode: z.string().trim().min(1, "Code is required"),
  languageId: z
    .number()
    .int()
    .positive("Language ID must be a positive integer"),
});

export default submissionSchema;
