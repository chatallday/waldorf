/**
 * OTP Challenge repository - server-side only.
 * Stores OTP challenges in Teable for server-side persistence.
 */

import { getTeableClient } from '../client';
import { TEABLE_TABLES } from '../tables';

export interface OtpChallengeRecord {
  id: string;
  otp_challenge_id: string;
  challenge_reference: string;
  email_hash: string;
  code_hash: string;
  purpose: string;
  status: 'pending' | 'consumed' | 'expired' | 'replaced' | 'attempts_exceeded' | 'delivery_failed';
  issued_at: string;
  expires_at: string;
  consumed_at?: string;
  attempt_count: number;
  max_attempts: number;
  send_count_window: number;
  send_window_started_at: string;
  request_ip_hash?: string;
  correlation_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOtpChallengeInput {
  otp_challenge_id: string;
  challenge_reference: string;
  email_hash: string;
  code_hash: string;
  purpose: string;
  expires_at: string;
  correlation_id: string;
  request_ip_hash?: string;
}

export class OtpChallengeRepository {
  private readonly tableName = 'authenticationOtpChallenges' as const;

  async findByEmailHash(emailHash: string, purpose: string = 'login') {
    return getTeableClient().findFirst(this.tableName, 
      `email_hash = "${emailHash}" && purpose = "${purpose}" && status = "pending" && expires_at > "${new Date().toISOString()}"`
    );
  }

  async findById(id: string) {
    return getTeableClient().get(this.tableName, id);
  }

  async findByCorrelationId(correlationId: string) {
    return getTeableClient().findFirst(this.tableName, `correlation_id = "${correlationId}"`);
  }

  async create(input: {
    otp_challenge_id: string;
    challenge_reference: string;
    email_hash: string;
    code_hash: string;
    purpose: string;
    expires_at: string;
    correlation_id: string;
    request_ip_hash?: string;
  }) {
    const now = new Date().toISOString();
    const fields = {
      ...input,
      attempt_count: 0,
      max_attempts: 5,
      send_count_window: 1,
      send_window_started_at: new Date().toISOString(),
      status: 'pending' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const record = await getTeableClient().create(this.tableName, fields);
    return record;
  }

  async update(id: string, updates: Partial<OtpChallengeRecord>) {
    return getTeableClient().update(this.tableName, id, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
  }

  async markConsumed(id: string) {
    return this.update(id, {
      status: 'consumed',
      consumed_at: new Date().toISOString(),
    });
  }

  async markExpired(id: string) {
    return this.update(id, {
      status: 'expired',
    });
  }

  async markReplaced(id: string) {
    return this.update(id, {
      status: 'replaced',
    });
  }

  async incrementAttempts(id: string) {
    const record = await this.findById(id);
    if (!record) return null;
    return this.update((record as any).id, {
      attempt_count: ((record as any).attempt_count || 0) + 1,
    });
  }

  async incrementSendCount(id: string) {
    const record = await this.findById(id);
    if (!record) return null;
    const now = Date.now();
    const recordAny = record as any;
    const windowStartStr = recordAny.send_window_started_at as string | undefined;
    const windowStart = windowStartStr ? new Date(windowStartStr).getTime() : Date.now();
    const hourMs = 60 * 60 * 1000;
    let sendCount = (recordAny.send_count_window as number) || 1;
    let windowStartOut = recordAny.send_window_started_at as string;

    if (now - new Date(windowStartOut).getTime() > hourMs) {
      sendCount = 1;
      windowStartOut = new Date().toISOString();
    } else {
      sendCount += 1;
    }

    return this.update(id, {
      send_count_window: sendCount,
      send_window_started_at: windowStartOut,
    });
  }

  async cleanupExpired(): Promise<number> {
    // This would be a batch operation in production
    // For now, we handle expiry at read time
    return 0;
  }
}

export const otpChallengeRepository = new OtpChallengeRepository();