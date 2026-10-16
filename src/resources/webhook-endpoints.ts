// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { Page, type PageParams, PagePromise } from '../core/pagination';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

/**
 * A webhook endpoint is an HTTPS URL that Orb sends [webhook events](/integrations-and-exports/webhooks) to.
 */
export class WebhookEndpoints extends APIResource {
  /**
   * This endpoint creates a webhook endpoint and returns the secret used to sign its
   * webhook events. The secret isn't returned by any other endpoint. An account can
   * have at most 20 webhook endpoints by default.
   */
  create(body: WebhookEndpointCreateParams, options?: RequestOptions): APIPromise<WebhookEndpointWithSecret> {
    return this._client.post('/webhook_endpoints', { body, ...options });
  }

  /**
   * This endpoint returns a webhook endpoint identified by its ID.
   */
  retrieve(webhookEndpointID: string, options?: RequestOptions): APIPromise<WebhookEndpoint> {
    return this._client.get(path`/webhook_endpoints/${webhookEndpointID}`, options);
  }

  /**
   * This endpoint updates a webhook endpoint's URL or the event types sent to it.
   */
  update(
    webhookEndpointID: string,
    body: WebhookEndpointUpdateParams,
    options?: RequestOptions,
  ): APIPromise<WebhookEndpoint> {
    return this._client.put(path`/webhook_endpoints/${webhookEndpointID}`, { body, ...options });
  }

  /**
   * This endpoint returns the account's webhook endpoints, ordered starting from the
   * most recently created.
   */
  list(
    query: WebhookEndpointListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<WebhookEndpointsPage, WebhookEndpoint> {
    return this._client.getAPIList('/webhook_endpoints', Page<WebhookEndpoint>, { query, ...options });
  }

  /**
   * This endpoint deletes a webhook endpoint. Orb stops sending webhook events to it
   * immediately.
   */
  delete(webhookEndpointID: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/webhook_endpoints/${webhookEndpointID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * This endpoint disables a webhook endpoint, so Orb stops sending webhook events
   * to it until it is enabled again.
   */
  disable(webhookEndpointID: string, options?: RequestOptions): APIPromise<WebhookEndpoint> {
    return this._client.post(path`/webhook_endpoints/${webhookEndpointID}/disable`, options);
  }

  /**
   * This endpoint enables a webhook endpoint, so Orb resumes sending webhook events
   * to it.
   */
  enable(webhookEndpointID: string, options?: RequestOptions): APIPromise<WebhookEndpoint> {
    return this._client.post(path`/webhook_endpoints/${webhookEndpointID}/enable`, options);
  }
}

export type WebhookEndpointsPage = Page<WebhookEndpoint>;

/**
 * A webhook endpoint is an HTTPS URL that Orb sends
 * [webhook events](/integrations-and-exports/webhooks) to.
 */
export interface WebhookEndpoint {
  /**
   * The Orb-assigned unique identifier for the webhook endpoint.
   */
  id: string;

  /**
   * The time the webhook endpoint was created.
   */
  created_at: string;

  /**
   * Whether Orb sends webhook events to this endpoint.
   */
  enabled: boolean;

  /**
   * The webhook event types sent to this endpoint. If null, all event types are
   * sent.
   */
  enabled_event_types: Array<string> | null;

  /**
   * The HTTPS URL that Orb sends webhook events to.
   */
  url: string;
}

/**
 * A newly created webhook endpoint, along with the secret used to sign its webhook
 * events.
 */
export interface WebhookEndpointWithSecret {
  /**
   * The Orb-assigned unique identifier for the webhook endpoint.
   */
  id: string;

  /**
   * The time the webhook endpoint was created.
   */
  created_at: string;

  /**
   * Whether Orb sends webhook events to this endpoint.
   */
  enabled: boolean;

  /**
   * The webhook event types sent to this endpoint. If null, all event types are
   * sent.
   */
  enabled_event_types: Array<string> | null;

  /**
   * The secret used to sign the webhook events sent to this endpoint. Only returned
   * when the endpoint is created.
   */
  secret: string;

  /**
   * The HTTPS URL that Orb sends webhook events to.
   */
  url: string;
}

export interface WebhookEndpointCreateParams {
  /**
   * The HTTPS URL that Orb sends webhook events to.
   */
  url: string;

  /**
   * The webhook event types to send to this endpoint. If omitted or null, all event
   * types are sent.
   */
  enabled_event_types?: Array<string> | null;
}

export interface WebhookEndpointUpdateParams {
  /**
   * The webhook event types to send to this endpoint. Null sends all event types;
   * omit to leave them unchanged.
   */
  enabled_event_types?: Array<string> | null;

  /**
   * The HTTPS URL that Orb sends webhook events to.
   */
  url?: string | null;
}

export interface WebhookEndpointListParams extends PageParams {}

export declare namespace WebhookEndpoints {
  export {
    type WebhookEndpoint as WebhookEndpoint,
    type WebhookEndpointWithSecret as WebhookEndpointWithSecret,
    type WebhookEndpointsPage as WebhookEndpointsPage,
    type WebhookEndpointCreateParams as WebhookEndpointCreateParams,
    type WebhookEndpointUpdateParams as WebhookEndpointUpdateParams,
    type WebhookEndpointListParams as WebhookEndpointListParams,
  };
}
