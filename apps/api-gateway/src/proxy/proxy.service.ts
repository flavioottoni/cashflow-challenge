import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { JwtPayload } from '@cashflow/shared';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly entriesClient: AxiosInstance;
  private readonly consolidatedClient: AxiosInstance;

  constructor() {
    this.entriesClient = axios.create({
      baseURL: process.env.ENTRIES_SERVICE_URL || 'http://localhost:3001',
      timeout: 10000,
    });

    this.consolidatedClient = axios.create({
      baseURL:
        process.env.CONSOLIDATED_SERVICE_URL || 'http://localhost:3002',
      timeout: 5000,
    });
  }

  async forwardToEntries(
    method: string,
    path: string,
    user: JwtPayload,
    body?: unknown,
    query?: Record<string, string>,
    correlationId?: string,
  ) {
    return this.forward(this.entriesClient, method, path, user, body, query, correlationId);
  }

  async forwardToConsolidated(
    method: string,
    path: string,
    user: JwtPayload,
    query?: Record<string, string>,
    correlationId?: string,
  ) {
    return this.forward(
      this.consolidatedClient,
      method,
      path,
      user,
      undefined,
      query,
      correlationId,
    );
  }

  private async forward(
    client: AxiosInstance,
    method: string,
    path: string,
    user: JwtPayload,
    body?: unknown,
    query?: Record<string, string>,
    correlationId?: string,
  ) {
    const config: AxiosRequestConfig = {
      method: method as AxiosRequestConfig['method'],
      url: path,
      data: body,
      params: query,
      headers: {
        'x-merchant-id': user.merchantId,
        'x-correlation-id': correlationId || '',
        'x-user-id': user.sub,
      },
      validateStatus: () => true,
    };

    try {
      const response = await client.request(config);
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      this.logger.error(`Proxy error to ${path}`, error);
      throw error;
    }
  }
}
