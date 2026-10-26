/**
 * Authoritative Teable table mapping for Playavida.
 * Server-side only - never expose to client.
 * Based on authoritative 23 September 2026 Playavida table references.
 */

export const TEABLE_TABLES = {
  // Identity and discovery
  users: 'tblB6Wiwy4KOx3Tjgui',
  personalProfiles: 'tblLPvqsTYbSeHqbO88',
  userPrivacyPreferences: 'tblBqY7HYRNqX0fFLQY',
  entityReferences: 'tbl65eT3PEGL66qJzjj',
  adminNotifications: 'tblF34hdMYFOtQhCN7P',
  dataIntegrityIssues: 'tblgld6aJED9x7z5Vrq',
  schemaChangeLog: 'tblEWCWe1M0iLsHuPSq',

  // Authentication
  authenticationOtpChallenges: 'tblVe1AhQ3zLW3eijnw',
  authenticationSessions: 'tblap3ykSwQQk276MdN',

  // Plans, sponsors, and analytics
  businessPlans: 'tblfB89TSYURsaZ267N',
  platformSubscriptions: 'tblniV4rYBKuBjHiPk8',
  platformPaymentEvents: 'tbl1TOw9us9ObkXMmHR',
  businessFeatureEntitlements: 'tblxdmuLBv4TLP5KDVE',

  // Legacy billing (do not use for new quarterly plans)
  legacyBusinessSubscriptions: 'tbloyccWq6gEARYGLJH',
} as const;

export type TeableTableName = keyof typeof TEABLE_TABLES;