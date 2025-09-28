import { z } from 'zod';

const latLngSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const projectSchema = latLngSchema.extend({
  id: z.string(),
  name: z.string(),
});

export const leadSchema = latLngSchema.extend({
  id: z.string(),
  name: z.string(),
  projectId: z.string(),
});

export const projectsSchema = z.array(projectSchema);
export const leadsSchema = z.array(leadSchema);

export function parseData<T>(data: unknown, schema: z.ZodSchema<T>, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `${label}: ${issue.path.join('.') || '<root>'} - ${issue.message}`)
      .join('\n');
    throw new Error(formatted);
  }
  return result.data;
}
