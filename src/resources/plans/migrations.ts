// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
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
  /**
   * This endpoint returns a migration for a plan, identified by its ID. A migration
   * moves a plan's subscriptions onto a new version of that plan; the response
   * reports the effective time it is scheduled for and its current status.
   */
  retrieve(
    migrationID: string,
    params: MigrationRetrieveParams,
    options?: RequestOptions,
  ): APIPromise<MigrationRetrieveResponse> {
    const { plan_id } = params;
    return this._client.get(path`/plans/${plan_id}/migrations/${migrationID}`, options);
  }

  /**
   * This endpoint returns a list of all migrations for a plan. The list of
   * migrations is ordered starting from the most recently created migration. The
   * response also includes pagination_metadata, which lets the caller retrieve the
   * next page of results if they exist.
   */
  list(
    planID: string,
    query: MigrationListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<MigrationListResponsesPage, MigrationListResponse> {
    return this._client.getAPIList(path`/plans/${planID}/migrations`, Page<MigrationListResponse>, {
      query,
      ...options,
    });
  }

  /**
   * This endpoint cancels a migration.
   */
  cancel(
    migrationID: string,
    params: MigrationCancelParams,
    options?: RequestOptions,
  ): APIPromise<MigrationCancelResponse> {
    const { plan_id } = params;
    return this._client.post(path`/plans/${plan_id}/migrations/${migrationID}/cancel`, options);
  }
}

export type MigrationListResponsesPage = Page<MigrationListResponse>;

/**
 * A migration moves a plan's subscriptions onto one of the plan's versions. Each
 * subscription is migrated asynchronously, either immediately or at a scheduled
 * time, and the migration reports its overall status as it progresses.
 */
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

/**
 * A migration moves a plan's subscriptions onto one of the plan's versions. Each
 * subscription is migrated asynchronously, either immediately or at a scheduled
 * time, and the migration reports its overall status as it progresses.
 */
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

/**
 * A migration moves a plan's subscriptions onto one of the plan's versions. Each
 * subscription is migrated asynchronously, either immediately or at a scheduled
 * time, and the migration reports its overall status as it progresses.
 */
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

export interface MigrationRetrieveParams {
  plan_id: string;
}

export interface MigrationListParams extends PageParams {}

export interface MigrationCancelParams {
  plan_id: string;
}

export declare namespace Migrations {
  export {
    type MigrationRetrieveResponse as MigrationRetrieveResponse,
    type MigrationListResponse as MigrationListResponse,
    type MigrationCancelResponse as MigrationCancelResponse,
    type MigrationListResponsesPage as MigrationListResponsesPage,
    type MigrationRetrieveParams as MigrationRetrieveParams,
    type MigrationListParams as MigrationListParams,
    type MigrationCancelParams as MigrationCancelParams,
  };
}
