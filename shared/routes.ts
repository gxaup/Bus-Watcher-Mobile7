import { z } from 'zod';
import { 
  insertSessionSchema, 
  insertViolationSchema, 
  insertViolationTypeSchema,
  sessions,
  violations,
  violationTypes
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  sessions: {
    list: {
      method: 'GET' as const,
      path: '/api/sessions',
      responses: {
        200: z.array(z.custom<typeof sessions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sessions',
      input: insertSessionSchema,
      responses: {
        201: z.custom<typeof sessions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    end: {
      method: 'PATCH' as const,
      path: '/api/sessions/:id/end',
      input: z.object({ endTime: z.string().datetime() }),
      responses: {
        200: z.custom<typeof sessions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/sessions/:id',
      responses: {
        200: z.custom<typeof sessions.$inferSelect & { violations: typeof violations.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    }
  },
  violations: {
    create: {
      method: 'POST' as const,
      path: '/api/violations',
      input: insertViolationSchema,
      responses: {
        201: z.custom<typeof violations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/sessions/:sessionId/violations',
      responses: {
        200: z.array(z.custom<typeof violations.$inferSelect>()),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/violations/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  violationTypes: {
    list: {
      method: 'GET' as const,
      path: '/api/violation-types',
      responses: {
        200: z.array(z.custom<typeof violationTypes.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/violation-types',
      input: insertViolationTypeSchema,
      responses: {
        201: z.custom<typeof violationTypes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  reports: {
    generate: {
      method: 'GET' as const,
      path: '/api/sessions/:id/report',
      responses: {
        200: z.object({
          filename: z.string(),
          content: z.string(),
        }),
        404: errorSchemas.notFound,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
