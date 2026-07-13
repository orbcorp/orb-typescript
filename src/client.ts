// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { RequestInit, RequestInfo, BodyInit } from './internal/builtin-types';
import type { HTTPMethod, PromiseOrValue, MergedRequestInit, FinalizedRequestInit } from './internal/types';
import { uuid4 } from './internal/utils/uuid';
import { validatePositiveInteger, isAbsoluteURL, safeJSON } from './internal/utils/values';
import { sleep } from './internal/utils/sleep';
export type { Logger, LogLevel } from './internal/utils/log';
import { castToError, isAbortError } from './internal/errors';
import type { APIResponseProps } from './internal/parse';
import { getPlatformHeaders } from './internal/detect-platform';
import * as Shims from './internal/shims';
import * as Opts from './internal/request-options';
import { stringifyQuery } from './internal/utils/query';
import { VERSION } from './version';
import * as Errors from './core/error';
import * as Pagination from './core/pagination';
import { AbstractPage, type PageParams, PageResponse } from './core/pagination';
import * as Uploads from './core/uploads';
import * as API from './resources/index';
import { APIPromise } from './core/api-promise';
import {
  Alert,
  AlertCreateForCustomerParams,
  AlertCreateForExternalCustomerParams,
  AlertCreateForSubscriptionParams,
  AlertDisableParams,
  AlertEnableParams,
  AlertListParams,
  AlertUpdateParams,
  Alerts,
  AlertsPage,
  Threshold,
} from './resources/alerts';
import {
  CreditBlockListInvoicesResponse,
  CreditBlockRetrieveResponse,
  CreditBlocks,
} from './resources/credit-blocks';
import { CreditNoteCreateParams, CreditNoteListParams, CreditNotes } from './resources/credit-notes';
import {
  InvoiceLineItemCreateParams,
  InvoiceLineItemCreateResponse,
  InvoiceLineItems,
} from './resources/invoice-line-items';
import {
  InvoiceCreateParams,
  InvoiceDeleteLineItemParams,
  InvoiceFetchUpcomingParams,
  InvoiceFetchUpcomingResponse,
  InvoiceIssueParams,
  InvoiceIssueSummaryParams,
  InvoiceIssueSummaryResponse,
  InvoiceListParams,
  InvoiceListSummaryParams,
  InvoiceListSummaryResponse,
  InvoiceListSummaryResponsesPage,
  InvoiceMarkPaidParams,
  InvoicePayParams,
  InvoiceUpdateParams,
  Invoices,
} from './resources/invoices';
import {
  Item,
  ItemCreateParams,
  ItemListParams,
  ItemUpdateParams,
  Items,
  ItemsPage,
} from './resources/items';
import {
  LicenseTypeCreateParams,
  LicenseTypeCreateResponse,
  LicenseTypeListParams,
  LicenseTypeListResponse,
  LicenseTypeListResponsesPage,
  LicenseTypeRetrieveResponse,
  LicenseTypes,
} from './resources/license-types';
import {
  BillableMetric,
  BillableMetricsPage,
  MetricCreateParams,
  MetricListParams,
  MetricUpdateParams,
  Metrics,
} from './resources/metrics';
import {
  MutatedSubscription,
  SubscriptionChangeApplyParams,
  SubscriptionChangeApplyResponse,
  SubscriptionChangeCancelResponse,
  SubscriptionChangeListParams,
  SubscriptionChangeListResponse,
  SubscriptionChangeListResponsesPage,
  SubscriptionChangeRetrieveResponse,
  SubscriptionChanges,
} from './resources/subscription-changes';
import {
  DiscountOverride,
  NewSubscriptionBulkPrice,
  NewSubscriptionBulkWithProrationPrice,
  NewSubscriptionCumulativeGroupedBulkPrice,
  NewSubscriptionGroupedAllocationPrice,
  NewSubscriptionGroupedTieredPackagePrice,
  NewSubscriptionGroupedTieredPrice,
  NewSubscriptionGroupedWithMeteredMinimumPrice,
  NewSubscriptionGroupedWithProratedMinimumPrice,
  NewSubscriptionMatrixPrice,
  NewSubscriptionMatrixWithAllocationPrice,
  NewSubscriptionMatrixWithDisplayNamePrice,
  NewSubscriptionMaxGroupTieredPackagePrice,
  NewSubscriptionMinimumCompositePrice,
  NewSubscriptionPackagePrice,
  NewSubscriptionPackageWithAllocationPrice,
  NewSubscriptionScalableMatrixWithTieredPricingPrice,
  NewSubscriptionScalableMatrixWithUnitPricingPrice,
  NewSubscriptionThresholdTotalAmountPrice,
  NewSubscriptionTieredPackagePrice,
  NewSubscriptionTieredPackageWithMinimumPrice,
  NewSubscriptionTieredPrice,
  NewSubscriptionTieredWithMinimumPrice,
  NewSubscriptionUnitPrice,
  NewSubscriptionUnitWithPercentPrice,
  NewSubscriptionUnitWithProrationPrice,
  Subscription,
  SubscriptionCancelParams,
  SubscriptionCreateParams,
  SubscriptionFetchCostsParams,
  SubscriptionFetchCostsResponse,
  SubscriptionFetchScheduleParams,
  SubscriptionFetchScheduleResponse,
  SubscriptionFetchScheduleResponsesPage,
  SubscriptionFetchUsageParams,
  SubscriptionListParams,
  SubscriptionPriceIntervalsParams,
  SubscriptionRedeemCouponParams,
  SubscriptionSchedulePlanChangeParams,
  SubscriptionTriggerPhaseParams,
  SubscriptionUnscheduleFixedFeeQuantityUpdatesParams,
  SubscriptionUpdateFixedFeeQuantityParams,
  SubscriptionUpdateParams,
  SubscriptionUpdateTrialParams,
  SubscriptionUsage,
  Subscriptions,
  SubscriptionsPage,
} from './resources/subscriptions';
import { TopLevel, TopLevelPingResponse } from './resources/top-level';
import { Webhooks } from './resources/webhooks';
import {
  Beta,
  BetaCreatePlanVersionParams,
  BetaFetchPlanVersionParams,
  BetaSetDefaultPlanVersionParams,
  PlanVersion,
  PlanVersionPhase,
} from './resources/beta/beta';
import {
  Coupon,
  CouponCreateParams,
  CouponListParams,
  Coupons,
  CouponsPage,
} from './resources/coupons/coupons';
import {
  AccountingProviderConfig,
  AddressInput,
  Customer,
  CustomerCreateParams,
  CustomerHierarchyConfig,
  CustomerListParams,
  CustomerUpdateByExternalIDParams,
  CustomerUpdateParams,
  Customers,
  CustomersPage,
  NewAccountingSyncConfiguration,
  NewAvalaraTaxConfiguration,
  NewReportingConfiguration,
  NewSphereConfiguration,
  NewTaxJarConfiguration,
} from './resources/customers/customers';
import {
  DimensionalPriceGroup,
  DimensionalPriceGroupCreateParams,
  DimensionalPriceGroupListParams,
  DimensionalPriceGroupUpdateParams,
  DimensionalPriceGroups,
  DimensionalPriceGroupsPage,
} from './resources/dimensional-price-groups/dimensional-price-groups';
import {
  EventDeprecateResponse,
  EventIngestParams,
  EventIngestResponse,
  EventSearchParams,
  EventSearchResponse,
  EventUpdateParams,
  EventUpdateResponse,
  Events,
} from './resources/events/events';
import {
  LicenseCreateParams,
  LicenseCreateResponse,
  LicenseDeactivateParams,
  LicenseDeactivateResponse,
  LicenseListParams,
  LicenseListResponse,
  LicenseListResponsesPage,
  LicenseRetrieveByExternalIDParams,
  LicenseRetrieveByExternalIDResponse,
  LicenseRetrieveResponse,
  Licenses,
} from './resources/licenses/licenses';
import {
  Plan,
  PlanCreateParams,
  PlanListParams,
  PlanUpdateParams,
  Plans,
  PlansPage,
} from './resources/plans/plans';
import {
  EvaluatePriceGroup,
  PriceCreateParams,
  PriceEvaluateMultipleParams,
  PriceEvaluateMultipleResponse,
  PriceEvaluateParams,
  PriceEvaluatePreviewEventsParams,
  PriceEvaluatePreviewEventsResponse,
  PriceEvaluateResponse,
  PriceListParams,
  PriceUpdateParams,
  Prices,
} from './resources/prices/prices';
import { type Fetch } from './internal/builtin-types';
import { HeadersLike, NullableHeaders, buildHeaders } from './internal/headers';
import { FinalRequestOptions, RequestOptions } from './internal/request-options';
import { readEnv } from './internal/utils/env';
import {
  type LogLevel,
  type Logger,
  formatRequestDetails,
  loggerFor,
  parseLogLevel,
} from './internal/utils/log';
import { isEmptyObj } from './internal/utils/values';

export interface ClientOptions {
  /**
   * Defaults to process.env['ORB_API_KEY'].
   */
  apiKey?: string | undefined;

  /**
   * Defaults to process.env['ORB_WEBHOOK_SECRET'].
   */
  webhookSecret?: string | null | undefined;

  /**
   * Override the default base URL for the API, e.g., "https://api.example.com/v2/"
   *
   * Defaults to process.env['ORB_BASE_URL'].
   */
  baseURL?: string | null | undefined;

  /**
   * The maximum amount of time (in milliseconds) that the client should wait for a response
   * from the server before timing out a single request.
   *
   * Note that request timeouts are retried by default, so in a worst-case scenario you may wait
   * much longer than this timeout before the promise succeeds or fails.
   *
   * @unit milliseconds
   */
  timeout?: number | undefined;
  /**
   * Additional `RequestInit` options to be passed to `fetch` calls.
   * Properties will be overridden by per-request `fetchOptions`.
   */
  fetchOptions?: MergedRequestInit | undefined;

  /**
   * Specify a custom `fetch` function implementation.
   *
   * If not provided, we expect that `fetch` is defined globally.
   */
  fetch?: Fetch | undefined;

  /**
   * The maximum number of times that the client will retry a request in case of a
   * temporary failure, like a network error or a 5XX error from the server.
   *
   * @default 2
   */
  maxRetries?: number | undefined;

  /**
   * Default headers to include with every request to the API.
   *
   * These can be removed in individual requests by explicitly setting the
   * header to `null` in request options.
   */
  defaultHeaders?: HeadersLike | undefined;

  /**
   * Default query parameters to include with every request to the API.
   *
   * These can be removed in individual requests by explicitly setting the
   * param to `undefined` in request options.
   */
  defaultQuery?: Record<string, string | undefined> | undefined;

  /**
   * Set the log level.
   *
   * Defaults to process.env['ORB_LOG'] or 'warn' if it isn't set.
   */
  logLevel?: LogLevel | undefined;

  /**
   * Set the logger.
   *
   * Defaults to globalThis.console.
   */
  logger?: Logger | undefined;
}

/**
 * Base class for Orb API clients.
 */
export class BaseOrb {
  apiKey: string;
  webhookSecret: string | null;

  baseURL: string;
  maxRetries: number;
  timeout: number;
  logger: Logger;
  logLevel: LogLevel | undefined;
  fetchOptions: MergedRequestInit | undefined;

  private fetch: Fetch;
  #encoder: Opts.RequestEncoder;
  protected idempotencyHeader?: string;
  private _options: ClientOptions;

  /**
   * API Client for interfacing with the Orb API.
   *
   * @param {string | undefined} [opts.apiKey=process.env['ORB_API_KEY'] ?? undefined]
   * @param {string | null | undefined} [opts.webhookSecret=process.env['ORB_WEBHOOK_SECRET'] ?? null]
   * @param {string} [opts.baseURL=process.env['ORB_BASE_URL'] ?? https://api.withorb.com/v1] - Override the default base URL for the API.
   * @param {number} [opts.timeout=1 minute] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
   * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
   */
  constructor({
    baseURL = readEnv('ORB_BASE_URL'),
    apiKey = readEnv('ORB_API_KEY'),
    webhookSecret = readEnv('ORB_WEBHOOK_SECRET') ?? null,
    ...opts
  }: ClientOptions = {}) {
    if (apiKey === undefined) {
      throw new Errors.OrbError(
        "The ORB_API_KEY environment variable is missing or empty; either provide it, or instantiate the Orb client with an apiKey option, like new Orb({ apiKey: 'My API Key' }).",
      );
    }

    const options: ClientOptions = {
      apiKey,
      webhookSecret,
      ...opts,
      baseURL: baseURL || `https://api.withorb.com/v1`,
    };

    this.baseURL = options.baseURL!;
    this.timeout = options.timeout ?? BaseOrb.DEFAULT_TIMEOUT /* 1 minute */;
    this.logger = options.logger ?? console;
    const defaultLogLevel = 'warn';
    // Set default logLevel early so that we can log a warning in parseLogLevel.
    this.logLevel = defaultLogLevel;
    this.logLevel =
      parseLogLevel(options.logLevel, 'ClientOptions.logLevel', this) ??
      parseLogLevel(readEnv('ORB_LOG'), "process.env['ORB_LOG']", this) ??
      defaultLogLevel;
    this.fetchOptions = options.fetchOptions;
    this.maxRetries = options.maxRetries ?? 2;
    this.fetch = options.fetch ?? Shims.getDefaultFetch();
    this.#encoder = Opts.FallbackEncoder;

    const customHeadersEnv = readEnv('ORB_CUSTOM_HEADERS');
    if (customHeadersEnv) {
      const parsed: Record<string, string> = {};
      for (const line of customHeadersEnv.split('\n')) {
        const colon = line.indexOf(':');
        if (colon >= 0) {
          parsed[line.substring(0, colon).trim()] = line.substring(colon + 1).trim();
        }
      }
      options.defaultHeaders = { ...parsed, ...options.defaultHeaders };
    }

    this._options = options;
    this.idempotencyHeader = 'Idempotency-Key';

    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
  }

  /**
   * Create a new client instance re-using the same options given to the current client with optional overriding.
   */
  withOptions(options: Partial<ClientOptions>): this {
    const client = new (this.constructor as any as new (props: ClientOptions) => typeof this)({
      ...this._options,
      baseURL: this.baseURL,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      logger: this.logger,
      logLevel: this.logLevel,
      fetch: this.fetch,
      fetchOptions: this.fetchOptions,
      apiKey: this.apiKey,
      webhookSecret: this.webhookSecret,
      ...options,
    });
    return client;
  }

  /**
   * Check whether the base URL is set to its default.
   */
  #baseURLOverridden(): boolean {
    return this.baseURL !== 'https://api.withorb.com/v1';
  }

  protected defaultQuery(): Record<string, string | undefined> | undefined {
    return this._options.defaultQuery;
  }

  protected validateHeaders({ values, nulls }: NullableHeaders) {
    return;
  }

  protected async authHeaders(opts: FinalRequestOptions): Promise<NullableHeaders | undefined> {
    return buildHeaders([{ Authorization: `Bearer ${this.apiKey}` }]);
  }

  protected stringifyQuery(query: object | Record<string, unknown>): string {
    return stringifyQuery(query);
  }

  private getUserAgent(): string {
    return `${this.constructor.name}/JS ${VERSION}`;
  }

  protected defaultIdempotencyKey(): string {
    return `stainless-node-retry-${uuid4()}`;
  }

  protected makeStatusError(
    status: number,
    error: Object,
    message: string | undefined,
    headers: Headers,
  ): Errors.APIError {
    return Errors.APIError.generate(status, error, message, headers);
  }

  buildURL(
    path: string,
    query: Record<string, unknown> | null | undefined,
    defaultBaseURL?: string | undefined,
  ): string {
    const baseURL = (!this.#baseURLOverridden() && defaultBaseURL) || this.baseURL;
    const url =
      isAbsoluteURL(path) ?
        new URL(path)
      : new URL(baseURL + (baseURL.endsWith('/') && path.startsWith('/') ? path.slice(1) : path));

    const defaultQuery = this.defaultQuery();
    const pathQuery = Object.fromEntries(url.searchParams);
    if (!isEmptyObj(defaultQuery) || !isEmptyObj(pathQuery)) {
      query = { ...pathQuery, ...defaultQuery, ...query };
    }

    if (typeof query === 'object' && query && !Array.isArray(query)) {
      url.search = this.stringifyQuery(query);
    }

    return url.toString();
  }

  /**
   * Used as a callback for mutating the given `FinalRequestOptions` object.
   */
  protected async prepareOptions(options: FinalRequestOptions): Promise<void> {}

  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  protected async prepareRequest(
    request: RequestInit,
    { url, options }: { url: string; options: FinalRequestOptions },
  ): Promise<void> {}

  get<Rsp>(path: string, opts?: PromiseOrValue<RequestOptions>): APIPromise<Rsp> {
    return this.methodRequest('get', path, opts);
  }

  post<Rsp>(path: string, opts?: PromiseOrValue<RequestOptions>): APIPromise<Rsp> {
    return this.methodRequest('post', path, opts);
  }

  patch<Rsp>(path: string, opts?: PromiseOrValue<RequestOptions>): APIPromise<Rsp> {
    return this.methodRequest('patch', path, opts);
  }

  put<Rsp>(path: string, opts?: PromiseOrValue<RequestOptions>): APIPromise<Rsp> {
    return this.methodRequest('put', path, opts);
  }

  delete<Rsp>(path: string, opts?: PromiseOrValue<RequestOptions>): APIPromise<Rsp> {
    return this.methodRequest('delete', path, opts);
  }

  private methodRequest<Rsp>(
    method: HTTPMethod,
    path: string,
    opts?: PromiseOrValue<RequestOptions>,
  ): APIPromise<Rsp> {
    return this.request(
      Promise.resolve(opts).then((opts) => {
        return { method, path, ...opts };
      }),
    );
  }

  request<Rsp>(
    options: PromiseOrValue<FinalRequestOptions>,
    remainingRetries: number | null = null,
  ): APIPromise<Rsp> {
    return new APIPromise(this, this.makeRequest(options, remainingRetries, undefined));
  }

  private async makeRequest(
    optionsInput: PromiseOrValue<FinalRequestOptions>,
    retriesRemaining: number | null,
    retryOfRequestLogID: string | undefined,
  ): Promise<APIResponseProps> {
    const options = await optionsInput;
    const maxRetries = options.maxRetries ?? this.maxRetries;
    if (retriesRemaining == null) {
      retriesRemaining = maxRetries;
    }

    await this.prepareOptions(options);

    const { req, url, timeout } = await this.buildRequest(options, {
      retryCount: maxRetries - retriesRemaining,
    });

    await this.prepareRequest(req, { url, options });

    /** Not an API request ID, just for correlating local log entries. */
    const requestLogID = 'log_' + ((Math.random() * (1 << 24)) | 0).toString(16).padStart(6, '0');
    const retryLogStr = retryOfRequestLogID === undefined ? '' : `, retryOf: ${retryOfRequestLogID}`;
    const startTime = Date.now();

    loggerFor(this).debug(
      `[${requestLogID}] sending request`,
      formatRequestDetails({
        retryOfRequestLogID,
        method: options.method,
        url,
        options,
        headers: req.headers,
      }),
    );

    if (options.signal?.aborted) {
      throw new Errors.APIUserAbortError();
    }

    const controller = new AbortController();
    const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
    const headersTime = Date.now();

    if (response instanceof globalThis.Error) {
      const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
      if (options.signal?.aborted) {
        throw new Errors.APIUserAbortError();
      }
      // detect native connection timeout errors
      // deno throws "TypeError: error sending request for url (https://example/): client error (Connect): tcp connect error: Operation timed out (os error 60): Operation timed out (os error 60)"
      // undici throws "TypeError: fetch failed" with cause "ConnectTimeoutError: Connect Timeout Error (attempted address: example:443, timeout: 1ms)"
      // others do not provide enough information to distinguish timeouts from other connection errors
      const isTimeout =
        isAbortError(response) ||
        /timed? ?out/i.test(String(response) + ('cause' in response ? String(response.cause) : ''));
      if (retriesRemaining) {
        loggerFor(this).info(
          `[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - ${retryMessage}`,
        );
        loggerFor(this).debug(
          `[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (${retryMessage})`,
          formatRequestDetails({
            retryOfRequestLogID,
            url,
            durationMs: headersTime - startTime,
            message: response.message,
          }),
        );
        return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
      }
      loggerFor(this).info(
        `[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} - error; no more retries left`,
      );
      loggerFor(this).debug(
        `[${requestLogID}] connection ${isTimeout ? 'timed out' : 'failed'} (error; no more retries left)`,
        formatRequestDetails({
          retryOfRequestLogID,
          url,
          durationMs: headersTime - startTime,
          message: response.message,
        }),
      );
      if (isTimeout) {
        throw new Errors.APIConnectionTimeoutError();
      }
      throw new Errors.APIConnectionError({ cause: response });
    }

    const responseInfo = `[${requestLogID}${retryLogStr}] ${req.method} ${url} ${
      response.ok ? 'succeeded' : 'failed'
    } with status ${response.status} in ${headersTime - startTime}ms`;

    if (!response.ok) {
      const shouldRetry = await this.shouldRetry(response);
      if (retriesRemaining && shouldRetry) {
        const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;

        // We don't need the body of this response.
        await Shims.CancelReadableStream(response.body);
        loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
        loggerFor(this).debug(
          `[${requestLogID}] response error (${retryMessage})`,
          formatRequestDetails({
            retryOfRequestLogID,
            url: response.url,
            status: response.status,
            headers: response.headers,
            durationMs: headersTime - startTime,
          }),
        );
        return this.retryRequest(
          options,
          retriesRemaining,
          retryOfRequestLogID ?? requestLogID,
          response.headers,
        );
      }

      const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;

      loggerFor(this).info(`${responseInfo} - ${retryMessage}`);

      const errText = await response.text().catch((err: any) => castToError(err).message);
      const errJSON = safeJSON(errText) as any;
      const errMessage = errJSON ? undefined : errText;

      loggerFor(this).debug(
        `[${requestLogID}] response error (${retryMessage})`,
        formatRequestDetails({
          retryOfRequestLogID,
          url: response.url,
          status: response.status,
          headers: response.headers,
          message: errMessage,
          durationMs: Date.now() - startTime,
        }),
      );

      const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
      throw err;
    }

    loggerFor(this).info(responseInfo);
    loggerFor(this).debug(
      `[${requestLogID}] response start`,
      formatRequestDetails({
        retryOfRequestLogID,
        url: response.url,
        status: response.status,
        headers: response.headers,
        durationMs: headersTime - startTime,
      }),
    );

    return { response, options, controller, requestLogID, retryOfRequestLogID, startTime };
  }

  getAPIList<Item, PageClass extends Pagination.AbstractPage<Item> = Pagination.AbstractPage<Item>>(
    path: string,
    Page: new (...args: any[]) => PageClass,
    opts?: PromiseOrValue<RequestOptions>,
  ): Pagination.PagePromise<PageClass, Item> {
    return this.requestAPIList(
      Page,
      opts && 'then' in opts ?
        opts.then((opts) => ({ method: 'get', path, ...opts }))
      : { method: 'get', path, ...opts },
    );
  }

  requestAPIList<
    Item = unknown,
    PageClass extends Pagination.AbstractPage<Item> = Pagination.AbstractPage<Item>,
  >(
    Page: new (...args: ConstructorParameters<typeof Pagination.AbstractPage>) => PageClass,
    options: PromiseOrValue<FinalRequestOptions>,
  ): Pagination.PagePromise<PageClass, Item> {
    const request = this.makeRequest(options, null, undefined);
    return new Pagination.PagePromise<PageClass, Item>(this as any as Orb, request, Page);
  }

  async fetchWithTimeout(
    url: RequestInfo,
    init: RequestInit | undefined,
    ms: number,
    controller: AbortController,
  ): Promise<Response> {
    const { signal, method, ...options } = init || {};
    const abort = this._makeAbort(controller);
    if (signal) signal.addEventListener('abort', abort, { once: true });

    const timeout = setTimeout(abort, ms);

    const isReadableBody =
      ((globalThis as any).ReadableStream && options.body instanceof (globalThis as any).ReadableStream) ||
      (typeof options.body === 'object' && options.body !== null && Symbol.asyncIterator in options.body);

    const fetchOptions: RequestInit = {
      signal: controller.signal as any,
      ...(isReadableBody ? { duplex: 'half' } : {}),
      method: 'GET',
      ...options,
    };
    if (method) {
      // Custom methods like 'patch' need to be uppercased
      // See https://github.com/nodejs/undici/issues/2294
      fetchOptions.method = method.toUpperCase();
    }

    try {
      // use undefined this binding; fetch errors if bound to something else in browser/cloudflare
      return await this.fetch.call(undefined, url, fetchOptions);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async shouldRetry(response: Response): Promise<boolean> {
    // Note this is not a standard header.
    const shouldRetryHeader = response.headers.get('x-should-retry');

    // If the server explicitly says whether or not to retry, obey.
    if (shouldRetryHeader === 'true') return true;
    if (shouldRetryHeader === 'false') return false;

    // Retry on request timeouts.
    if (response.status === 408) return true;

    // Retry on lock timeouts.
    if (response.status === 409) return true;

    // Retry on rate limits.
    if (response.status === 429) return true;

    // Retry internal errors.
    if (response.status >= 500) return true;

    return false;
  }

  private async retryRequest(
    options: FinalRequestOptions,
    retriesRemaining: number,
    requestLogID: string,
    responseHeaders?: Headers | undefined,
  ): Promise<APIResponseProps> {
    let timeoutMillis: number | undefined;

    // Note the `retry-after-ms` header may not be standard, but is a good idea and we'd like proactive support for it.
    const retryAfterMillisHeader = responseHeaders?.get('retry-after-ms');
    if (retryAfterMillisHeader) {
      const timeoutMs = parseFloat(retryAfterMillisHeader);
      if (!Number.isNaN(timeoutMs)) {
        timeoutMillis = timeoutMs;
      }
    }

    // About the Retry-After header: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After
    const retryAfterHeader = responseHeaders?.get('retry-after');
    if (retryAfterHeader && !timeoutMillis) {
      const timeoutSeconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1000;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }

    // If the API asks us to wait a certain amount of time, just do what it
    // says, but otherwise calculate a default
    if (timeoutMillis === undefined) {
      const maxRetries = options.maxRetries ?? this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
    }
    await sleep(timeoutMillis);

    return this.makeRequest(options, retriesRemaining - 1, requestLogID);
  }

  private calculateDefaultRetryTimeoutMillis(retriesRemaining: number, maxRetries: number): number {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8.0;

    const numRetries = maxRetries - retriesRemaining;

    // Apply exponential backoff, but not more than the max.
    const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);

    // Apply some jitter, take up to at most 25 percent of the retry time.
    const jitter = 1 - Math.random() * 0.25;

    return sleepSeconds * jitter * 1000;
  }

  async buildRequest(
    inputOptions: FinalRequestOptions,
    { retryCount = 0 }: { retryCount?: number } = {},
  ): Promise<{ req: FinalizedRequestInit; url: string; timeout: number }> {
    const options = { ...inputOptions };
    const { method, path, query, defaultBaseURL } = options;

    const url = this.buildURL(path!, query as Record<string, unknown>, defaultBaseURL);
    if ('timeout' in options) validatePositiveInteger('timeout', options.timeout);
    options.timeout = options.timeout ?? this.timeout;
    const { bodyHeaders, body } = this.buildBody({ options });
    const reqHeaders = await this.buildHeaders({ options: inputOptions, method, bodyHeaders, retryCount });

    const req: FinalizedRequestInit = {
      method,
      headers: reqHeaders,
      ...(options.signal && { signal: options.signal }),
      ...((globalThis as any).ReadableStream &&
        body instanceof (globalThis as any).ReadableStream && { duplex: 'half' }),
      ...(body && { body }),
      ...((this.fetchOptions as any) ?? {}),
      ...((options.fetchOptions as any) ?? {}),
    };

    return { req, url, timeout: options.timeout };
  }

  private async buildHeaders({
    options,
    method,
    bodyHeaders,
    retryCount,
  }: {
    options: FinalRequestOptions;
    method: HTTPMethod;
    bodyHeaders: HeadersLike;
    retryCount: number;
  }): Promise<Headers> {
    let idempotencyHeaders: HeadersLike = {};
    if (this.idempotencyHeader && method !== 'get') {
      if (!options.idempotencyKey) options.idempotencyKey = this.defaultIdempotencyKey();
      idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
    }

    const headers = buildHeaders([
      idempotencyHeaders,
      {
        Accept: 'application/json',
        'User-Agent': this.getUserAgent(),
        'X-Stainless-Retry-Count': String(retryCount),
        ...(options.timeout ? { 'X-Stainless-Timeout': String(Math.trunc(options.timeout / 1000)) } : {}),
        ...getPlatformHeaders(),
      },
      await this.authHeaders(options),
      this._options.defaultHeaders,
      bodyHeaders,
      options.headers,
    ]);

    this.validateHeaders(headers);

    return headers.values;
  }

  private _makeAbort(controller: AbortController) {
    // note: we can't just inline this method inside `fetchWithTimeout()` because then the closure
    //       would capture all request options, and cause a memory leak.
    return () => controller.abort();
  }

  private buildBody({ options }: { options: FinalRequestOptions }): {
    bodyHeaders: HeadersLike;
    body: BodyInit | undefined;
  } {
    const { body, headers: rawHeaders } = options;
    if (!body) {
      // A resource method always passes a `body` key when its operation defines a
      // request body, even if the caller omitted an optional body param. Keep the
      // content-type for those, and only elide it for operations with no body at
      // all (e.g. GET/DELETE).
      if (body == null && 'body' in options) {
        return this.#encoder({ body, headers: buildHeaders([rawHeaders]) });
      }
      return { bodyHeaders: undefined, body: undefined };
    }
    const headers = buildHeaders([rawHeaders]);
    if (
      // Pass raw type verbatim
      ArrayBuffer.isView(body) ||
      body instanceof ArrayBuffer ||
      body instanceof DataView ||
      (typeof body === 'string' &&
        // Preserve legacy string encoding behavior for now
        headers.values.has('content-type')) ||
      // `Blob` is superset of `File`
      ((globalThis as any).Blob && body instanceof (globalThis as any).Blob) ||
      // `FormData` -> `multipart/form-data`
      body instanceof FormData ||
      // `URLSearchParams` -> `application/x-www-form-urlencoded`
      body instanceof URLSearchParams ||
      // Send chunked stream (each chunk has own `length`)
      ((globalThis as any).ReadableStream && body instanceof (globalThis as any).ReadableStream)
    ) {
      return { bodyHeaders: undefined, body: body as BodyInit };
    } else if (
      typeof body === 'object' &&
      (Symbol.asyncIterator in body ||
        (Symbol.iterator in body && 'next' in body && typeof body.next === 'function'))
    ) {
      return { bodyHeaders: undefined, body: Shims.ReadableStreamFrom(body as AsyncIterable<Uint8Array>) };
    } else if (
      typeof body === 'object' &&
      headers.values.get('content-type') === 'application/x-www-form-urlencoded'
    ) {
      return {
        bodyHeaders: { 'content-type': 'application/x-www-form-urlencoded' },
        body: this.stringifyQuery(body),
      };
    } else {
      return this.#encoder({ body, headers });
    }
  }

  static Orb = this;
  static DEFAULT_TIMEOUT = 60000; // 1 minute

  static OrbError = Errors.OrbError;
  static APIError = Errors.APIError;
  static APIConnectionError = Errors.APIConnectionError;
  static APIConnectionTimeoutError = Errors.APIConnectionTimeoutError;
  static APIUserAbortError = Errors.APIUserAbortError;
  static URLNotFound = Errors.URLNotFound;
  static NotFoundError = Errors.NotFoundError;
  static ConflictError = Errors.ConflictError;
  static RateLimitError = Errors.RateLimitError;
  static BadRequestError = Errors.BadRequestError;
  static RequestTooLarge = Errors.RequestTooLarge;
  static TooManyRequests = Errors.TooManyRequests;
  static ResourceNotFound = Errors.ResourceNotFound;
  static ResourceConflict = Errors.ResourceConflict;
  static ResourceTooLarge = Errors.ResourceTooLarge;
  static AuthenticationError = Errors.AuthenticationError;
  static InternalServerError = Errors.InternalServerError;
  static ConstraintViolation = Errors.ConstraintViolation;
  static FeatureNotAvailable = Errors.FeatureNotAvailable;
  static PermissionDeniedError = Errors.PermissionDeniedError;
  static RequestValidationError = Errors.RequestValidationError;
  static OrbAuthenticationError = Errors.OrbAuthenticationError;
  static OrbInternalServerError = Errors.OrbInternalServerError;
  static UnprocessableEntityError = Errors.UnprocessableEntityError;
  static DuplicateResourceCreation = Errors.DuplicateResourceCreation;

  static toFile = Uploads.toFile;
}

/**
 * API Client for interfacing with the Orb API.
 */
export class Orb extends BaseOrb {
  topLevel: API.TopLevel = new API.TopLevel(this);
  /**
   * The [Plan](/core-concepts#plan-and-price) resource represents a plan that can be subscribed to by a
   * customer. Plans define the billing behavior of the subscription. You can see more about how to configure prices
   * in the [Price resource](/reference/price).
   */
  beta: API.Beta = new API.Beta(this);
  /**
   * A coupon represents a reusable discount configuration that can be applied either as a fixed or percentage amount to an invoice or subscription. Coupons are activated using a redemption code, which applies the discount to a subscription or invoice. The duration of a coupon determines how long it remains available for use by end users.
   */
  coupons: API.Coupons = new API.Coupons(this);
  /**
   * The [Credit Note](/invoicing/credit-notes) resource represents a credit that has been applied to a
   * particular invoice.
   */
  creditNotes: API.CreditNotes = new API.CreditNotes(this);
  /**
   * A customer is a buyer of your products, and the other party to the billing relationship.
   *
   * In Orb, customers are assigned system generated identifiers automatically, but it's often desirable to have these
   * match existing identifiers in your system. To avoid having to denormalize Orb ID information, you can pass in an
   * `external_customer_id` with your own identifier. See
   * [Customer ID Aliases](/events-and-metrics/customer-aliases) for further information about how these
   * aliases work in Orb.
   *
   * In addition to having an identifier in your system, a customer may exist in a payment provider solution like
   * Stripe. Use the `payment_provider_id` and the `payment_provider` enum field to express this mapping.
   *
   * A customer also has a timezone (from the standard [IANA timezone database](https://www.iana.org/time-zones)), which
   * defaults to your account's timezone. See [Timezone localization](/essentials/timezones) for
   * information on what this timezone parameter influences within Orb.
   */
  customers: API.Customers = new API.Customers(this);
  /**
   * The [Event](/core-concepts#event) resource represents a usage event that has been created for a
   * customer. Events are the core of Orb's usage-based billing model, and are used to calculate the usage charges for
   * a given billing period.
   */
  events: API.Events = new API.Events(this);
  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity, representing the request for payment for
   * a single subscription. This includes a set of line items, which correspond to prices in the subscription's plan and
   * can represent fixed recurring fees or usage-based fees. They are generated at the end of a billing period, or as
   * the result of an action, such as a cancellation.
   */
  invoiceLineItems: API.InvoiceLineItems = new API.InvoiceLineItems(this);
  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity, representing the request for payment for
   * a single subscription. This includes a set of line items, which correspond to prices in the subscription's plan and
   * can represent fixed recurring fees or usage-based fees. They are generated at the end of a billing period, or as
   * the result of an action, such as a cancellation.
   */
  invoices: API.Invoices = new API.Invoices(this);
  /**
   * The Item resource represents a sellable product or good. Items are associated with all line items, billable metrics,
   * and prices and are used for defining external sync behavior for invoices and tax calculation purposes.
   */
  items: API.Items = new API.Items(this);
  /**
   * The Metric resource represents a calculation of a quantity based on events.
   * Metrics are defined by the query that transforms raw usage events into meaningful values for your customers.
   */
  metrics: API.Metrics = new API.Metrics(this);
  /**
   * The [Plan](/core-concepts#plan-and-price) resource represents a plan that can be subscribed to by a
   * customer. Plans define the billing behavior of the subscription. You can see more about how to configure prices
   * in the [Price resource](/reference/price).
   */
  plans: API.Plans = new API.Plans(this);
  /**
   * The Price resource represents a price that can be billed on a subscription, resulting in a charge on an invoice in
   * the form of an invoice line item. Prices take a quantity and determine an amount to bill.
   *
   * Orb supports a few different pricing models out of the box. Each of these models is serialized differently in a
   * given Price object. The model_type field determines the key for the configuration object that is present.
   *
   * For more on the types of prices, see [the core concepts documentation](/core-concepts#plan-and-price)
   */
  prices: API.Prices = new API.Prices(this);
  subscriptions: API.Subscriptions = new API.Subscriptions(this);
  /**
   * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
   * usage, or credit balance and trigger webhooks when a threshold is exceeded.
   *
   * Alerts created through the API can be scoped to either customers or subscriptions.
   */
  alerts: API.Alerts = new API.Alerts(this);
  dimensionalPriceGroups: API.DimensionalPriceGroups = new API.DimensionalPriceGroups(this);
  subscriptionChanges: API.SubscriptionChanges = new API.SubscriptionChanges(this);
  /**
   * The [Credit Ledger Entry resource](/product-catalog/prepurchase) models prepaid credits within Orb.
   */
  creditBlocks: API.CreditBlocks = new API.CreditBlocks(this);
  /**
   * The LicenseType resource represents a type of license that can be assigned to users.
   * License types are used during billing by grouping metrics on the configured grouping key.
   */
  licenseTypes: API.LicenseTypes = new API.LicenseTypes(this);
  licenses: API.Licenses = new API.Licenses(this);
  webhooks: API.Webhooks = new API.Webhooks(this);
}

Orb.TopLevel = TopLevel;
Orb.Beta = Beta;
Orb.Coupons = Coupons;
Orb.CreditNotes = CreditNotes;
Orb.Customers = Customers;
Orb.Events = Events;
Orb.InvoiceLineItems = InvoiceLineItems;
Orb.Invoices = Invoices;
Orb.Items = Items;
Orb.Metrics = Metrics;
Orb.Plans = Plans;
Orb.Prices = Prices;
Orb.Alerts = Alerts;
Orb.SubscriptionChanges = SubscriptionChanges;
Orb.CreditBlocks = CreditBlocks;
Orb.LicenseTypes = LicenseTypes;
Orb.Licenses = Licenses;
Orb.Webhooks = Webhooks;

export declare namespace Orb {
  export type RequestOptions = Opts.RequestOptions;

  export import Page = Pagination.Page;
  export { type PageParams as PageParams, type PageResponse as PageResponse };

  export { TopLevel as TopLevel, type TopLevelPingResponse as TopLevelPingResponse };

  export {
    Beta as Beta,
    type PlanVersion as PlanVersion,
    type PlanVersionPhase as PlanVersionPhase,
    type BetaCreatePlanVersionParams as BetaCreatePlanVersionParams,
    type BetaFetchPlanVersionParams as BetaFetchPlanVersionParams,
    type BetaSetDefaultPlanVersionParams as BetaSetDefaultPlanVersionParams,
  };

  export {
    Coupons as Coupons,
    type Coupon as Coupon,
    type CouponsPage as CouponsPage,
    type CouponCreateParams as CouponCreateParams,
    type CouponListParams as CouponListParams,
  };

  export {
    CreditNotes as CreditNotes,
    type CreditNoteCreateParams as CreditNoteCreateParams,
    type CreditNoteListParams as CreditNoteListParams,
  };

  export {
    Customers as Customers,
    type AccountingProviderConfig as AccountingProviderConfig,
    type AddressInput as AddressInput,
    type Customer as Customer,
    type CustomerHierarchyConfig as CustomerHierarchyConfig,
    type NewAccountingSyncConfiguration as NewAccountingSyncConfiguration,
    type NewAvalaraTaxConfiguration as NewAvalaraTaxConfiguration,
    type NewReportingConfiguration as NewReportingConfiguration,
    type NewSphereConfiguration as NewSphereConfiguration,
    type NewTaxJarConfiguration as NewTaxJarConfiguration,
    type CustomersPage as CustomersPage,
    type CustomerCreateParams as CustomerCreateParams,
    type CustomerUpdateParams as CustomerUpdateParams,
    type CustomerListParams as CustomerListParams,
    type CustomerUpdateByExternalIDParams as CustomerUpdateByExternalIDParams,
  };

  export {
    Events as Events,
    type EventUpdateResponse as EventUpdateResponse,
    type EventDeprecateResponse as EventDeprecateResponse,
    type EventIngestResponse as EventIngestResponse,
    type EventSearchResponse as EventSearchResponse,
    type EventUpdateParams as EventUpdateParams,
    type EventIngestParams as EventIngestParams,
    type EventSearchParams as EventSearchParams,
  };

  export {
    InvoiceLineItems as InvoiceLineItems,
    type InvoiceLineItemCreateResponse as InvoiceLineItemCreateResponse,
    type InvoiceLineItemCreateParams as InvoiceLineItemCreateParams,
  };

  export {
    Invoices as Invoices,
    type InvoiceFetchUpcomingResponse as InvoiceFetchUpcomingResponse,
    type InvoiceIssueSummaryResponse as InvoiceIssueSummaryResponse,
    type InvoiceListSummaryResponse as InvoiceListSummaryResponse,
    type InvoiceListSummaryResponsesPage as InvoiceListSummaryResponsesPage,
    type InvoiceCreateParams as InvoiceCreateParams,
    type InvoiceUpdateParams as InvoiceUpdateParams,
    type InvoiceListParams as InvoiceListParams,
    type InvoiceDeleteLineItemParams as InvoiceDeleteLineItemParams,
    type InvoiceFetchUpcomingParams as InvoiceFetchUpcomingParams,
    type InvoiceIssueParams as InvoiceIssueParams,
    type InvoiceIssueSummaryParams as InvoiceIssueSummaryParams,
    type InvoiceListSummaryParams as InvoiceListSummaryParams,
    type InvoiceMarkPaidParams as InvoiceMarkPaidParams,
    type InvoicePayParams as InvoicePayParams,
  };

  export {
    Items as Items,
    type Item as Item,
    type ItemsPage as ItemsPage,
    type ItemCreateParams as ItemCreateParams,
    type ItemUpdateParams as ItemUpdateParams,
    type ItemListParams as ItemListParams,
  };

  export {
    Metrics as Metrics,
    type BillableMetric as BillableMetric,
    type BillableMetricsPage as BillableMetricsPage,
    type MetricCreateParams as MetricCreateParams,
    type MetricUpdateParams as MetricUpdateParams,
    type MetricListParams as MetricListParams,
  };

  export {
    Plans as Plans,
    type Plan as Plan,
    type PlansPage as PlansPage,
    type PlanCreateParams as PlanCreateParams,
    type PlanUpdateParams as PlanUpdateParams,
    type PlanListParams as PlanListParams,
  };

  export {
    Prices as Prices,
    type EvaluatePriceGroup as EvaluatePriceGroup,
    type PriceEvaluateResponse as PriceEvaluateResponse,
    type PriceEvaluateMultipleResponse as PriceEvaluateMultipleResponse,
    type PriceEvaluatePreviewEventsResponse as PriceEvaluatePreviewEventsResponse,
    type PriceCreateParams as PriceCreateParams,
    type PriceUpdateParams as PriceUpdateParams,
    type PriceListParams as PriceListParams,
    type PriceEvaluateParams as PriceEvaluateParams,
    type PriceEvaluateMultipleParams as PriceEvaluateMultipleParams,
    type PriceEvaluatePreviewEventsParams as PriceEvaluatePreviewEventsParams,
  };

  export {
    type Subscriptions as Subscriptions,
    type DiscountOverride as DiscountOverride,
    type NewSubscriptionBulkPrice as NewSubscriptionBulkPrice,
    type NewSubscriptionBulkWithProrationPrice as NewSubscriptionBulkWithProrationPrice,
    type NewSubscriptionCumulativeGroupedBulkPrice as NewSubscriptionCumulativeGroupedBulkPrice,
    type NewSubscriptionGroupedAllocationPrice as NewSubscriptionGroupedAllocationPrice,
    type NewSubscriptionGroupedTieredPackagePrice as NewSubscriptionGroupedTieredPackagePrice,
    type NewSubscriptionGroupedTieredPrice as NewSubscriptionGroupedTieredPrice,
    type NewSubscriptionGroupedWithMeteredMinimumPrice as NewSubscriptionGroupedWithMeteredMinimumPrice,
    type NewSubscriptionGroupedWithProratedMinimumPrice as NewSubscriptionGroupedWithProratedMinimumPrice,
    type NewSubscriptionMatrixPrice as NewSubscriptionMatrixPrice,
    type NewSubscriptionMatrixWithAllocationPrice as NewSubscriptionMatrixWithAllocationPrice,
    type NewSubscriptionMatrixWithDisplayNamePrice as NewSubscriptionMatrixWithDisplayNamePrice,
    type NewSubscriptionMaxGroupTieredPackagePrice as NewSubscriptionMaxGroupTieredPackagePrice,
    type NewSubscriptionMinimumCompositePrice as NewSubscriptionMinimumCompositePrice,
    type NewSubscriptionPackagePrice as NewSubscriptionPackagePrice,
    type NewSubscriptionPackageWithAllocationPrice as NewSubscriptionPackageWithAllocationPrice,
    type NewSubscriptionScalableMatrixWithTieredPricingPrice as NewSubscriptionScalableMatrixWithTieredPricingPrice,
    type NewSubscriptionScalableMatrixWithUnitPricingPrice as NewSubscriptionScalableMatrixWithUnitPricingPrice,
    type NewSubscriptionThresholdTotalAmountPrice as NewSubscriptionThresholdTotalAmountPrice,
    type NewSubscriptionTieredPackagePrice as NewSubscriptionTieredPackagePrice,
    type NewSubscriptionTieredPackageWithMinimumPrice as NewSubscriptionTieredPackageWithMinimumPrice,
    type NewSubscriptionTieredPrice as NewSubscriptionTieredPrice,
    type NewSubscriptionTieredWithMinimumPrice as NewSubscriptionTieredWithMinimumPrice,
    type NewSubscriptionUnitPrice as NewSubscriptionUnitPrice,
    type NewSubscriptionUnitWithPercentPrice as NewSubscriptionUnitWithPercentPrice,
    type NewSubscriptionUnitWithProrationPrice as NewSubscriptionUnitWithProrationPrice,
    type Subscription as Subscription,
    type SubscriptionUsage as SubscriptionUsage,
    type SubscriptionFetchCostsResponse as SubscriptionFetchCostsResponse,
    type SubscriptionFetchScheduleResponse as SubscriptionFetchScheduleResponse,
    type SubscriptionsPage as SubscriptionsPage,
    type SubscriptionFetchScheduleResponsesPage as SubscriptionFetchScheduleResponsesPage,
    type SubscriptionCreateParams as SubscriptionCreateParams,
    type SubscriptionUpdateParams as SubscriptionUpdateParams,
    type SubscriptionListParams as SubscriptionListParams,
    type SubscriptionCancelParams as SubscriptionCancelParams,
    type SubscriptionFetchCostsParams as SubscriptionFetchCostsParams,
    type SubscriptionFetchScheduleParams as SubscriptionFetchScheduleParams,
    type SubscriptionFetchUsageParams as SubscriptionFetchUsageParams,
    type SubscriptionPriceIntervalsParams as SubscriptionPriceIntervalsParams,
    type SubscriptionRedeemCouponParams as SubscriptionRedeemCouponParams,
    type SubscriptionSchedulePlanChangeParams as SubscriptionSchedulePlanChangeParams,
    type SubscriptionTriggerPhaseParams as SubscriptionTriggerPhaseParams,
    type SubscriptionUnscheduleFixedFeeQuantityUpdatesParams as SubscriptionUnscheduleFixedFeeQuantityUpdatesParams,
    type SubscriptionUpdateFixedFeeQuantityParams as SubscriptionUpdateFixedFeeQuantityParams,
    type SubscriptionUpdateTrialParams as SubscriptionUpdateTrialParams,
  };

  export {
    Alerts as Alerts,
    type Alert as Alert,
    type Threshold as Threshold,
    type AlertsPage as AlertsPage,
    type AlertUpdateParams as AlertUpdateParams,
    type AlertListParams as AlertListParams,
    type AlertCreateForCustomerParams as AlertCreateForCustomerParams,
    type AlertCreateForExternalCustomerParams as AlertCreateForExternalCustomerParams,
    type AlertCreateForSubscriptionParams as AlertCreateForSubscriptionParams,
    type AlertDisableParams as AlertDisableParams,
    type AlertEnableParams as AlertEnableParams,
  };

  export {
    type DimensionalPriceGroups as DimensionalPriceGroups,
    type DimensionalPriceGroup as DimensionalPriceGroup,
    type DimensionalPriceGroupsPage as DimensionalPriceGroupsPage,
    type DimensionalPriceGroupCreateParams as DimensionalPriceGroupCreateParams,
    type DimensionalPriceGroupUpdateParams as DimensionalPriceGroupUpdateParams,
    type DimensionalPriceGroupListParams as DimensionalPriceGroupListParams,
  };

  export {
    SubscriptionChanges as SubscriptionChanges,
    type MutatedSubscription as MutatedSubscription,
    type SubscriptionChangeRetrieveResponse as SubscriptionChangeRetrieveResponse,
    type SubscriptionChangeListResponse as SubscriptionChangeListResponse,
    type SubscriptionChangeApplyResponse as SubscriptionChangeApplyResponse,
    type SubscriptionChangeCancelResponse as SubscriptionChangeCancelResponse,
    type SubscriptionChangeListResponsesPage as SubscriptionChangeListResponsesPage,
    type SubscriptionChangeListParams as SubscriptionChangeListParams,
    type SubscriptionChangeApplyParams as SubscriptionChangeApplyParams,
  };

  export {
    CreditBlocks as CreditBlocks,
    type CreditBlockRetrieveResponse as CreditBlockRetrieveResponse,
    type CreditBlockListInvoicesResponse as CreditBlockListInvoicesResponse,
  };

  export {
    LicenseTypes as LicenseTypes,
    type LicenseTypeCreateResponse as LicenseTypeCreateResponse,
    type LicenseTypeRetrieveResponse as LicenseTypeRetrieveResponse,
    type LicenseTypeListResponse as LicenseTypeListResponse,
    type LicenseTypeListResponsesPage as LicenseTypeListResponsesPage,
    type LicenseTypeCreateParams as LicenseTypeCreateParams,
    type LicenseTypeListParams as LicenseTypeListParams,
  };

  export {
    Licenses as Licenses,
    type LicenseCreateResponse as LicenseCreateResponse,
    type LicenseRetrieveResponse as LicenseRetrieveResponse,
    type LicenseListResponse as LicenseListResponse,
    type LicenseDeactivateResponse as LicenseDeactivateResponse,
    type LicenseRetrieveByExternalIDResponse as LicenseRetrieveByExternalIDResponse,
    type LicenseListResponsesPage as LicenseListResponsesPage,
    type LicenseCreateParams as LicenseCreateParams,
    type LicenseListParams as LicenseListParams,
    type LicenseDeactivateParams as LicenseDeactivateParams,
    type LicenseRetrieveByExternalIDParams as LicenseRetrieveByExternalIDParams,
  };

  export { Webhooks as Webhooks };

  export type Address = API.Address;
  export type AdjustmentInterval = API.AdjustmentInterval;
  export type AggregatedCost = API.AggregatedCost;
  export type Allocation = API.Allocation;
  export type AmountDiscount = API.AmountDiscount;
  export type AmountDiscountInterval = API.AmountDiscountInterval;
  export type BillableMetricTiny = API.BillableMetricTiny;
  export type BillingCycleAnchorConfiguration = API.BillingCycleAnchorConfiguration;
  export type BillingCycleConfiguration = API.BillingCycleConfiguration;
  export type BillingCycleRelativeDate = API.BillingCycleRelativeDate;
  export type BulkConfig = API.BulkConfig;
  export type BulkTier = API.BulkTier;
  export type ChangedSubscriptionResources = API.ChangedSubscriptionResources;
  export type ConversionRateTier = API.ConversionRateTier;
  export type ConversionRateTieredConfig = API.ConversionRateTieredConfig;
  export type ConversionRateUnitConfig = API.ConversionRateUnitConfig;
  export type CouponRedemption = API.CouponRedemption;
  export type CreditNote = API.CreditNote;
  export type CreditNoteTiny = API.CreditNoteTiny;
  export type CustomExpiration = API.CustomExpiration;
  export type CustomerMinified = API.CustomerMinified;
  export type CustomerTaxID = API.CustomerTaxID;
  export type DimensionalPriceConfiguration = API.DimensionalPriceConfiguration;
  export type Discount = API.Discount;
  export type FixedFeeQuantityScheduleEntry = API.FixedFeeQuantityScheduleEntry;
  export type FixedFeeQuantityTransition = API.FixedFeeQuantityTransition;
  export type Invoice = API.Invoice;
  export type InvoiceLevelDiscount = API.InvoiceLevelDiscount;
  export type InvoiceTiny = API.InvoiceTiny;
  export type ItemSlim = API.ItemSlim;
  export type MatrixConfig = API.MatrixConfig;
  export type MatrixSubLineItem = API.MatrixSubLineItem;
  export type MatrixValue = API.MatrixValue;
  export type MatrixWithAllocationConfig = API.MatrixWithAllocationConfig;
  export type Maximum = API.Maximum;
  export type MaximumInterval = API.MaximumInterval;
  export type Minimum = API.Minimum;
  export type MinimumInterval = API.MinimumInterval;
  export type MonetaryAmountDiscountAdjustment = API.MonetaryAmountDiscountAdjustment;
  export type MonetaryMaximumAdjustment = API.MonetaryMaximumAdjustment;
  export type MonetaryMinimumAdjustment = API.MonetaryMinimumAdjustment;
  export type MonetaryPercentageDiscountAdjustment = API.MonetaryPercentageDiscountAdjustment;
  export type MonetaryUsageDiscountAdjustment = API.MonetaryUsageDiscountAdjustment;
  export type NewAllocationPrice = API.NewAllocationPrice;
  export type NewAmountDiscount = API.NewAmountDiscount;
  export type NewBillingCycleConfiguration = API.NewBillingCycleConfiguration;
  export type NewDimensionalPriceConfiguration = API.NewDimensionalPriceConfiguration;
  export type NewFloatingBulkPrice = API.NewFloatingBulkPrice;
  export type NewFloatingBulkWithProrationPrice = API.NewFloatingBulkWithProrationPrice;
  export type NewFloatingCumulativeGroupedBulkPrice = API.NewFloatingCumulativeGroupedBulkPrice;
  export type NewFloatingGroupedAllocationPrice = API.NewFloatingGroupedAllocationPrice;
  export type NewFloatingGroupedTieredPackagePrice = API.NewFloatingGroupedTieredPackagePrice;
  export type NewFloatingGroupedTieredPrice = API.NewFloatingGroupedTieredPrice;
  export type NewFloatingGroupedWithMeteredMinimumPrice = API.NewFloatingGroupedWithMeteredMinimumPrice;
  export type NewFloatingGroupedWithProratedMinimumPrice = API.NewFloatingGroupedWithProratedMinimumPrice;
  export type NewFloatingMatrixPrice = API.NewFloatingMatrixPrice;
  export type NewFloatingMatrixWithAllocationPrice = API.NewFloatingMatrixWithAllocationPrice;
  export type NewFloatingMatrixWithDisplayNamePrice = API.NewFloatingMatrixWithDisplayNamePrice;
  export type NewFloatingMaxGroupTieredPackagePrice = API.NewFloatingMaxGroupTieredPackagePrice;
  export type NewFloatingMinimumCompositePrice = API.NewFloatingMinimumCompositePrice;
  export type NewFloatingPackagePrice = API.NewFloatingPackagePrice;
  export type NewFloatingPackageWithAllocationPrice = API.NewFloatingPackageWithAllocationPrice;
  export type NewFloatingScalableMatrixWithTieredPricingPrice =
    API.NewFloatingScalableMatrixWithTieredPricingPrice;
  export type NewFloatingScalableMatrixWithUnitPricingPrice =
    API.NewFloatingScalableMatrixWithUnitPricingPrice;
  export type NewFloatingThresholdTotalAmountPrice = API.NewFloatingThresholdTotalAmountPrice;
  export type NewFloatingTieredPackagePrice = API.NewFloatingTieredPackagePrice;
  export type NewFloatingTieredPackageWithMinimumPrice = API.NewFloatingTieredPackageWithMinimumPrice;
  export type NewFloatingTieredPrice = API.NewFloatingTieredPrice;
  export type NewFloatingTieredWithMinimumPrice = API.NewFloatingTieredWithMinimumPrice;
  export type NewFloatingTieredWithProrationPrice = API.NewFloatingTieredWithProrationPrice;
  export type NewFloatingUnitPrice = API.NewFloatingUnitPrice;
  export type NewFloatingUnitWithPercentPrice = API.NewFloatingUnitWithPercentPrice;
  export type NewFloatingUnitWithProrationPrice = API.NewFloatingUnitWithProrationPrice;
  export type NewMaximum = API.NewMaximum;
  export type NewMinimum = API.NewMinimum;
  export type NewPercentageDiscount = API.NewPercentageDiscount;
  export type NewPlanBulkPrice = API.NewPlanBulkPrice;
  export type NewPlanBulkWithProrationPrice = API.NewPlanBulkWithProrationPrice;
  export type NewPlanCumulativeGroupedBulkPrice = API.NewPlanCumulativeGroupedBulkPrice;
  export type NewPlanGroupedAllocationPrice = API.NewPlanGroupedAllocationPrice;
  export type NewPlanGroupedTieredPackagePrice = API.NewPlanGroupedTieredPackagePrice;
  export type NewPlanGroupedTieredPrice = API.NewPlanGroupedTieredPrice;
  export type NewPlanGroupedWithMeteredMinimumPrice = API.NewPlanGroupedWithMeteredMinimumPrice;
  export type NewPlanGroupedWithProratedMinimumPrice = API.NewPlanGroupedWithProratedMinimumPrice;
  export type NewPlanMatrixPrice = API.NewPlanMatrixPrice;
  export type NewPlanMatrixWithAllocationPrice = API.NewPlanMatrixWithAllocationPrice;
  export type NewPlanMatrixWithDisplayNamePrice = API.NewPlanMatrixWithDisplayNamePrice;
  export type NewPlanMaxGroupTieredPackagePrice = API.NewPlanMaxGroupTieredPackagePrice;
  export type NewPlanMinimumCompositePrice = API.NewPlanMinimumCompositePrice;
  export type NewPlanPackagePrice = API.NewPlanPackagePrice;
  export type NewPlanPackageWithAllocationPrice = API.NewPlanPackageWithAllocationPrice;
  export type NewPlanScalableMatrixWithTieredPricingPrice = API.NewPlanScalableMatrixWithTieredPricingPrice;
  export type NewPlanScalableMatrixWithUnitPricingPrice = API.NewPlanScalableMatrixWithUnitPricingPrice;
  export type NewPlanThresholdTotalAmountPrice = API.NewPlanThresholdTotalAmountPrice;
  export type NewPlanTieredPackagePrice = API.NewPlanTieredPackagePrice;
  export type NewPlanTieredPackageWithMinimumPrice = API.NewPlanTieredPackageWithMinimumPrice;
  export type NewPlanTieredPrice = API.NewPlanTieredPrice;
  export type NewPlanTieredWithMinimumPrice = API.NewPlanTieredWithMinimumPrice;
  export type NewPlanUnitPrice = API.NewPlanUnitPrice;
  export type NewPlanUnitWithPercentPrice = API.NewPlanUnitWithPercentPrice;
  export type NewPlanUnitWithProrationPrice = API.NewPlanUnitWithProrationPrice;
  export type NewUsageDiscount = API.NewUsageDiscount;
  export type OtherSubLineItem = API.OtherSubLineItem;
  export type PackageConfig = API.PackageConfig;
  export type PaginationMetadata = API.PaginationMetadata;
  export type PerPriceCost = API.PerPriceCost;
  export type PercentageDiscount = API.PercentageDiscount;
  export type PercentageDiscountInterval = API.PercentageDiscountInterval;
  export type PlanPhaseAmountDiscountAdjustment = API.PlanPhaseAmountDiscountAdjustment;
  export type PlanPhaseMaximumAdjustment = API.PlanPhaseMaximumAdjustment;
  export type PlanPhaseMinimumAdjustment = API.PlanPhaseMinimumAdjustment;
  export type PlanPhasePercentageDiscountAdjustment = API.PlanPhasePercentageDiscountAdjustment;
  export type PlanPhaseUsageDiscountAdjustment = API.PlanPhaseUsageDiscountAdjustment;
  export type Price = API.Price;
  export type PriceInterval = API.PriceInterval;
  export type SubLineItemGrouping = API.SubLineItemGrouping;
  export type SubLineItemMatrixConfig = API.SubLineItemMatrixConfig;
  export type SubscriptionChangeMinified = API.SubscriptionChangeMinified;
  export type SubscriptionMinified = API.SubscriptionMinified;
  export type SubscriptionTrialInfo = API.SubscriptionTrialInfo;
  export type TaxAmount = API.TaxAmount;
  export type Tier = API.Tier;
  export type TierSubLineItem = API.TierSubLineItem;
  export type TieredConfig = API.TieredConfig;
  export type TieredConversionRateConfig = API.TieredConversionRateConfig;
  export type TrialDiscount = API.TrialDiscount;
  export type UnitConfig = API.UnitConfig;
  export type UnitConversionRateConfig = API.UnitConversionRateConfig;
  export type UsageDiscount = API.UsageDiscount;
  export type UsageDiscountInterval = API.UsageDiscountInterval;
}
