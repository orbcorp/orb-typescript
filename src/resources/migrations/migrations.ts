// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as Shared from '../shared';
import * as SubscriptionsAPI from './subscriptions';
import { SubscriptionListParams, Subscriptions } from './subscriptions';
import { APIPromise } from '../../core/api-promise';
import { Page, type PageParams, PagePromise } from '../../core/pagination';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * The [Plan](/core-concepts#plan-and-price) resource represents a plan that can be subscribed to by a
 * customer. Plans define the billing behavior of the subscription. You can see more about how to configure prices
 * in the [Price resource](/reference/price).
 */
export class Migrations extends APIResource {
  subscriptions: SubscriptionsAPI.Subscriptions = new SubscriptionsAPI.Subscriptions(this._client);

  /**
   * This endpoint creates a migration of a plan's subscriptions to one of its
   * versions. With `included_subscription_ids` it migrates exactly those
   * subscriptions; otherwise it migrates the plan's subscriptions that match the
   * filters. Each subscription is migrated asynchronously; fetch the migration to
   * follow its status.
   */
  create(body: MigrationCreateParams, options?: RequestOptions): APIPromise<MigrationCreateResponse> {
    return this._client.post('/migrations', { body, ...options });
  }

  /**
   * This endpoint returns a migration identified by its ID.
   */
  retrieve(migrationID: string, options?: RequestOptions): APIPromise<MigrationRetrieveResponse> {
    return this._client.get(path`/migrations/${migrationID}`, options);
  }

  /**
   * This endpoint returns a list of migrations across all plans in the account,
   * optionally filtered by plan (`plan_id` or `external_plan_id`). The list of
   * migrations is ordered starting from the most recently created migration. The
   * response also includes pagination_metadata, which lets the caller retrieve the
   * next page of results if they exist.
   */
  list(
    query: MigrationListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<MigrationListResponsesPage, MigrationListResponse> {
    return this._client.getAPIList('/migrations', Page<MigrationListResponse>, { query, ...options });
  }

  /**
   * This endpoint cancels a migration identified by its ID.
   */
  cancel(migrationID: string, options?: RequestOptions): APIPromise<MigrationCancelResponse> {
    return this._client.post(path`/migrations/${migrationID}/cancel`, options);
  }
}

export type MigrationListResponsesPage = Page<MigrationListResponse>;

export type MigrationSubscriptionsPage = Page<MigrationSubscription>;

export interface MigrationSubscription {
  customer: Shared.CustomerMinified;

  /**
   * When the subscription is migrated to the target plan version. Null unless the
   * status is 'scheduled' or 'completed'.
   */
  effective_date: string | null;

  /**
   * Why the subscription could not be migrated. Null unless the status is 'failed'.
   */
  failure_reason: string | null;

  /**
   * The subscription's status in the migration: 'scheduling' until the migration has
   * processed it, 'scheduled' when it will be migrated to the target version at
   * `effective_date`, 'completed' once it has been migrated, 'skipped' when the
   * migration left it unchanged, or 'failed' when it could not be migrated (see
   * `failure_reason`).
   */
  status: 'scheduling' | 'scheduled' | 'completed' | 'skipped' | 'failed';

  /**
   * The ID of the subscription.
   */
  subscription_id: string;
}

export interface MigrationCreateResponse {
  /**
   * Unique identifier for this plan version change.
   */
  id: string;

  /**
   * When the migration takes effect. Can be a specific date/time, 'start_of_term' or
   * 'end_of_term' when scheduled to be at the start or end of the current billing
   * period, or 'start_of_invoice' or 'end_of_invoice' when scheduled to be at the
   * start of the current or next invoice.
   */
  effective_time:
    | (string & {})
    | (string & {})
    | 'start_of_term'
    | 'end_of_term'
    | 'start_of_invoice'
    | 'end_of_invoice'
    | null;

  /**
   * When the migration completed or was canceled, or null if it is still in
   * progress.
   */
  ended_at: string | null;

  /**
   * The ID of the plan being migrated.
   */
  plan_id: string;

  /**
   * When Orb began migrating the plan's subscriptions. Null if the migration has not
   * begun, or was canceled before it began.
   */
  started_at: string | null;

  /**
   * Current status of the migration: 'not_started', 'in_progress', 'completed',
   * 'action_needed', or 'canceled'.
   */
  status: 'not_started' | 'in_progress' | 'completed' | 'action_needed' | 'canceled';

  /**
   * The plan version subscriptions are migrated to.
   */
  target_plan_version_number: number;
}

export interface MigrationRetrieveResponse {
  /**
   * Unique identifier for this plan version change.
   */
  id: string;

  /**
   * When the migration takes effect. Can be a specific date/time, 'start_of_term' or
   * 'end_of_term' when scheduled to be at the start or end of the current billing
   * period, or 'start_of_invoice' or 'end_of_invoice' when scheduled to be at the
   * start of the current or next invoice.
   */
  effective_time:
    | (string & {})
    | (string & {})
    | 'start_of_term'
    | 'end_of_term'
    | 'start_of_invoice'
    | 'end_of_invoice'
    | null;

  /**
   * When the migration completed or was canceled, or null if it is still in
   * progress.
   */
  ended_at: string | null;

  /**
   * The ID of the plan being migrated.
   */
  plan_id: string;

  /**
   * When Orb began migrating the plan's subscriptions. Null if the migration has not
   * begun, or was canceled before it began.
   */
  started_at: string | null;

  /**
   * Current status of the migration: 'not_started', 'in_progress', 'completed',
   * 'action_needed', or 'canceled'.
   */
  status: 'not_started' | 'in_progress' | 'completed' | 'action_needed' | 'canceled';

  /**
   * The plan version subscriptions are migrated to.
   */
  target_plan_version_number: number;
}

export interface MigrationListResponse {
  /**
   * Unique identifier for this plan version change.
   */
  id: string;

  /**
   * When the migration takes effect. Can be a specific date/time, 'start_of_term' or
   * 'end_of_term' when scheduled to be at the start or end of the current billing
   * period, or 'start_of_invoice' or 'end_of_invoice' when scheduled to be at the
   * start of the current or next invoice.
   */
  effective_time:
    | (string & {})
    | (string & {})
    | 'start_of_term'
    | 'end_of_term'
    | 'start_of_invoice'
    | 'end_of_invoice'
    | null;

  /**
   * When the migration completed or was canceled, or null if it is still in
   * progress.
   */
  ended_at: string | null;

  /**
   * The ID of the plan being migrated.
   */
  plan_id: string;

  /**
   * When Orb began migrating the plan's subscriptions. Null if the migration has not
   * begun, or was canceled before it began.
   */
  started_at: string | null;

  /**
   * Current status of the migration: 'not_started', 'in_progress', 'completed',
   * 'action_needed', or 'canceled'.
   */
  status: 'not_started' | 'in_progress' | 'completed' | 'action_needed' | 'canceled';

  /**
   * The plan version subscriptions are migrated to.
   */
  target_plan_version_number: number;
}

export interface MigrationCancelResponse {
  /**
   * Unique identifier for this plan version change.
   */
  id: string;

  /**
   * When the migration takes effect. Can be a specific date/time, 'start_of_term' or
   * 'end_of_term' when scheduled to be at the start or end of the current billing
   * period, or 'start_of_invoice' or 'end_of_invoice' when scheduled to be at the
   * start of the current or next invoice.
   */
  effective_time:
    | (string & {})
    | (string & {})
    | 'start_of_term'
    | 'end_of_term'
    | 'start_of_invoice'
    | 'end_of_invoice'
    | null;

  /**
   * When the migration completed or was canceled, or null if it is still in
   * progress.
   */
  ended_at: string | null;

  /**
   * The ID of the plan being migrated.
   */
  plan_id: string;

  /**
   * When Orb began migrating the plan's subscriptions. Null if the migration has not
   * begun, or was canceled before it began.
   */
  started_at: string | null;

  /**
   * Current status of the migration: 'not_started', 'in_progress', 'completed',
   * 'action_needed', or 'canceled'.
   */
  status: 'not_started' | 'in_progress' | 'completed' | 'action_needed' | 'canceled';

  /**
   * The plan version subscriptions are migrated to.
   */
  target_plan_version_number: number;
}

export interface MigrationCreateParams {
  /**
   * When the migration takes effect: 'immediately', 'requested_date' on
   * `effective_date`, 'start_of_term' or 'end_of_term' for the start or end of each
   * subscription's current billing period, or 'start_of_invoice' or 'end_of_invoice'
   * for the start of its current or next invoice.
   */
  effective_time:
    | 'immediately'
    | 'requested_date'
    | 'start_of_term'
    | 'end_of_term'
    | 'start_of_invoice'
    | 'end_of_invoice';

  /**
   * The plan version to migrate subscriptions to. It can't be a draft version.
   */
  target_plan_version_number: number;

  /**
   * When false, a subscription whose migration would void an issued invoice or
   * create a credit note fails instead.
   */
  allow_invoice_credit_or_void?: boolean;

  /**
   * When true, an in-arrears price the migration ends mid-cycle bills its final line
   * item on the next scheduled invoice instead of on its end date.
   */
  can_defer_billing?: boolean;

  /**
   * The date the migration takes effect, at midnight in each customer's timezone.
   * Required when `effective_time` is `requested_date`, and not allowed otherwise.
   */
  effective_date?: string | null;

  /**
   * Leave these subscriptions out. Can't be combined with
   * `included_subscription_ids`.
   */
  excluded_subscription_ids?: Array<string> | null;

  /**
   * The external ID of the plan whose subscriptions to migrate.
   */
  external_plan_id?: string | null;

  /**
   * `true` migrates only subscriptions in a trial, `false` only subscriptions not in
   * a trial.
   */
  in_trial?: boolean | null;

  /**
   * Migrate only these subscriptions. When set, the filters below are ignored.
   */
  included_subscription_ids?: Array<string> | null;

  /**
   * The plan whose subscriptions to migrate. Exactly one of `plan_id` and
   * `external_plan_id` is required.
   */
  plan_id?: string | null;

  /**
   * Migrate only subscriptions currently on these plan versions.
   */
  plan_version_numbers?: Array<number> | null;

  /**
   * Why the migration was created.
   */
  reason?: string | null;

  /**
   * Migrate subscriptions with these statuses. Defaults to active subscriptions.
   */
  statuses?: Array<'active' | 'upcoming'>;
}

export interface MigrationListParams extends PageParams {
  external_plan_id?: string | null;

  plan_id?: string | null;
}

Migrations.Subscriptions = Subscriptions;

export declare namespace Migrations {
  export {
    type MigrationSubscription as MigrationSubscription,
    type MigrationCreateResponse as MigrationCreateResponse,
    type MigrationRetrieveResponse as MigrationRetrieveResponse,
    type MigrationListResponse as MigrationListResponse,
    type MigrationCancelResponse as MigrationCancelResponse,
    type MigrationListResponsesPage as MigrationListResponsesPage,
    type MigrationCreateParams as MigrationCreateParams,
    type MigrationListParams as MigrationListParams,
  };

  export { Subscriptions as Subscriptions, type SubscriptionListParams as SubscriptionListParams };
}
