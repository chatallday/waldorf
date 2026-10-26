/**
 * Server-side Teable REST API Client.
 * Typed communication with Playavida Teable base.
 * CRITICAL: Never expose to client browser.
 */

import { serverEnv } from '../env';

interface TeableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime?: string;
  lastModifiedTime?: string;
}

interface TeableListResponse {
  records: TeableRecord[];
  total?: number;
  page?: number;
  pageSize?: number;
}

interface TeableQueryOptions {
  filter?: string;
  sort?: string[];
  pageSize?: number;
  page?: number;
  viewId?: string;
}

export class TeableClient {
  private baseUrl: string;
  private baseId: string;
  private apiKey: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = serverEnv.teableApiBase.replace(/\/$/, '');
    this.baseId = serverEnv.teableBaseId;
    this.apiKey = serverEnv.teableApiKey;
    this.defaultHeaders = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private buildUrl(tableName: keyof typeof TEABLE_TABLES): string {
    const tableId = TEABLE_TABLES[tableName];
    if (!tableId) {
      throw new Error(`Unknown table: ${tableName}`);
    }
    return `${this.baseUrl}/bases/${this.baseId}/tables/${tableId}/records`;
  }

  private async request<T>(
    method: string,
    url: string,
    body?: unknown,
    requestId?: string
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, {
        method,
        headers: this.defaultHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        if (response.status === 401) {
          throw new Error('Teable authentication failed - check API key');
        }
        if (response.status === 403) {
          throw new Error('Teable access forbidden - check base permissions');
        }
        if (response.status === 429) {
          throw new Error('Teable rate limit exceeded');
        }
        throw new Error(`Teable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Teable request timeout');
      }
      throw error;
    }
  }

  // ===== Read Operations =====

  async list<T = Record<string, unknown>>(
    tableName: keyof typeof TEABLE_TABLES,
    options: TeableQueryOptions = {}
  ): Promise<{ records: T[]; total?: number }> {
    const url = new URL(this.buildUrl(tableName));
    if (options.filter) url.searchParams.set('filter', options.filter);
    if (options.sort) url.searchParams.set('sort', options.sort.join(','));
    if (options.pageSize) url.searchParams.set('pageSize', options.pageSize.toString());
    if (options.page) url.searchParams.set('page', options.page.toString());
    if (options.viewId) url.searchParams.set('viewId', options.viewId);

    const response = await this.request<TeableListResponse>('GET', url.toString());
    return {
      records: (response.records as T[]) || [],
      total: response.total,
    };
  }

  async get<T = Record<string, unknown>>(
    tableName: keyof typeof TEABLE_TABLES,
    recordId: string
  ): Promise<T | null> {
    const url = `${this.buildUrl(tableName)}/${recordId}`;
    try {
      const response = await this.request<{ record: TeableRecord }>('GET', url);
      return (response.record?.fields as T) || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async findFirst<T = Record<string, unknown>>(
    tableName: keyof typeof TEABLE_TABLES,
    filter: string
  ): Promise<T | null> {
    const { records } = await this.list<T>(tableName, { filter, pageSize: 1 });
    return records[0] || null;
  }

  // ===== Write Operations =====

  async create<T = Record<string, unknown>>(
    tableName: keyof typeof TEABLE_TABLES,
    fields: Record<string, unknown>
  ): Promise<T> {
    const response = await this.request<{ record: TeableRecord }>('POST', this.buildUrl(tableName), { fields });
    return response.record?.fields as T;
  }

  async update<T = Record<string, unknown>>(
    tableName: keyof typeof TEABLE_TABLES,
    recordId: string,
    fields: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.buildUrl(tableName)}/${recordId}`;
    const response = await this.request<{ record: TeableRecord }>('PATCH', url, { fields });
    return response.record?.fields as T;
  }

  async delete(tableName: keyof typeof TEABLE_TABLES, recordId: string): Promise<void> {
    const url = `${this.buildUrl(tableName)}/${recordId}`;
    await this.request('DELETE', url);
  }

  // ===== Batch Operations =====

  async batchCreate<T = Record<string, unknown>>(
    tableName: keyof typeof TEABLE_TABLES,
    records: Array<{ fields: Record<string, unknown> }>
  ): Promise<T[]> {
    const url = `${this.buildUrl(tableName)}/batch`;
    const response = await this.request<{ records: TeableRecord[] }>('POST', url, { records });
    return (response.records?.map(r => r.fields as T)) || [];
  }

  // ===== Utility =====

  async healthCheck(): Promise<boolean> {
    try {
      await this.list('users', { pageSize: 1 });
      return true;
    } catch {
      return false;
    }
  }
}

export const teableClient = new TeableClient();