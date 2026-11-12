// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as MigrationsAPI from './migrations';
import { MigrationSubscriptionsPage } from './migrations';
import { Page, type PageParams, PagePromise } from '../../core/pagination';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * The [Plan](/core-concepts#plan-and-price) resource represents a plan that can be subscribed to by a
 * customer. Plans define the billing behavior of the subscription. You can see more about how to configure prices
 * in the [Price resource](/reference/price).
 */
export class Subscriptions extends APIResource {
  /**
   * This endpoint returns the subscriptions a migration applies to, with the status
   * of each one. A subscription that could not be migrated has the status `failed`
   * and a `failure_reason`.
   *
   * The list is empty until the migration has finished selecting its subscriptions.
   * Once a migration is canceled, only the subscriptions it processed before the
   * cancellation are returned.
   */
  list(
    migrationID: string,
    query: SubscriptionListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<MigrationSubscriptionsPage, MigrationsAPI.MigrationSubscription> {
    return this._client.getAPIList(
      path`/migrations/${migrationID}/subscriptions`,
      Page<MigrationsAPI.MigrationSubscription>,
      { query, ...options },
    );
  }
}

export interface SubscriptionListParams extends PageParams {
  /**
   * Only return subscriptions with one of these statuses.
   */
  status?: Array<'scheduling' | 'scheduled' | 'completed' | 'skipped' | 'failed'> | null;

  /**
   * Only return these subscriptions. Up to 100 IDs.
   */
  subscription_id?: Array<string> | null;
}

export declare namespace Subscriptions {
  export { type SubscriptionListParams as SubscriptionListParams };
}

export { type MigrationSubscriptionsPage };
