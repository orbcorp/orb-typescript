// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as SubscriptionsAPI from '../subscriptions';
import { SubscriptionsPage } from '../subscriptions';
import { Page, type PageParams, PagePromise } from '../../core/pagination';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * A coupon represents a reusable discount configuration that can be applied either as a fixed or percentage amount to an invoice or subscription. Coupons are activated using a redemption code, which applies the discount to a subscription or invoice. The duration of a coupon determines how long it remains available for use by end users.
 */
export class Subscriptions extends APIResource {
  /**
   * This endpoint returns a list of all subscriptions that have redeemed a given
   * coupon as a [paginated](/api-reference/pagination) list, ordered starting from
   * the most recently created subscription. For a full discussion of the
   * subscription resource, see [Subscription](/core-concepts#subscription).
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const subscription of client.coupons.subscriptions.list(
   *   'coupon_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(
    couponId: string,
    query: SubscriptionListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<SubscriptionsPage, SubscriptionsAPI.Subscription> {
    return this._client.getAPIList(
      path`/coupons/${couponId}/subscriptions`,
      Page<SubscriptionsAPI.Subscription>,
      { query, ...options },
    );
  }
}

export interface SubscriptionListParams extends PageParams {}

export declare namespace Subscriptions {
  export { type SubscriptionListParams as SubscriptionListParams };
}

export { type SubscriptionsPage };
