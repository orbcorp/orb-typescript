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
   * Fetch migration
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

export interface MigrationRetrieveResponse {
  /**
   * Unique identifier for this plan version change.
   */
  id: string;

  /**
   * When the migration takes effect. Can be a specific date/time, or 'end_of_term'
   * when scheduled to be at the end of the current billing period.
   */
  effective_time: (string & {}) | (string & {}) | 'end_of_term' | null;

  /**
   * The ID of the plan being migrated.
   */
  plan_id: string;

  /**
   * Current status of the migration: 'not_started', 'in_progress', 'completed',
   * 'action_needed', or 'canceled'.
   */
  status: 'not_started' | 'in_progress' | 'completed' | 'action_needed' | 'canceled';
}

export interface MigrationListResponse {
  /**
   * Unique identifier for this plan version change.
   */
  id: string;

  /**
   * When the migration takes effect. Can be a specific date/time, or 'end_of_term'
   * when scheduled to be at the end of the current billing period.
   */
  effective_time: (string & {}) | (string & {}) | 'end_of_term' | null;

  /**
   * The ID of the plan being migrated.
   */
  plan_id: string;

  /**
   * Current status of the migration: 'not_started', 'in_progress', 'completed',
   * 'action_needed', or 'canceled'.
   */
  status: 'not_started' | 'in_progress' | 'completed' | 'action_needed' | 'canceled';
}

export interface MigrationCancelResponse {
  /**
   * Unique identifier for this plan version change.
   */
  id: string;

  /**
   * When the migration takes effect. Can be a specific date/time, or 'end_of_term'
   * when scheduled to be at the end of the current billing period.
   */
  effective_time: (string & {}) | (string & {}) | 'end_of_term' | null;

  /**
   * The ID of the plan being migrated.
   */
  plan_id: string;

  /**
   * Current status of the migration: 'not_started', 'in_progress', 'completed',
   * 'action_needed', or 'canceled'.
   */
  status: 'not_started' | 'in_progress' | 'completed' | 'action_needed' | 'canceled';
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
