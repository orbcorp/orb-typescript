// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as Shared from '../shared';
import { PricesPage } from '../shared';
import { APIPromise } from '../../core/api-promise';
import { Page, type PageParams, PagePromise } from '../../core/pagination';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Prices extends APIResource {
  /**
   * Create prices in a dimensional price group. Every price shares `item_id`,
   * `cadence`, `currency`, and `model_type`. Tiered prices also share tier
   * boundaries; each row supplies its own amounts. The request is one transaction.
   *
   * @example
   * ```ts
   * const price =
   *   await client.dimensionalPriceGroups.prices.create(
   *     'dimensional_price_group_id',
   *     {
   *       cadence: 'one_time',
   *       currency: 'USD',
   *       item_id: 'item_id',
   *       model_type: 'unit',
   *       prices: [
   *         { amounts: [0], dimension_values: ['string'] },
   *       ],
   *     },
   *   );
   * ```
   */
  create(
    dimensionalPriceGroupID: string,
    body: PriceCreateParams,
    options?: RequestOptions,
  ): APIPromise<PriceCreateResponse> {
    return this._client.post(path`/dimensional_price_groups/${dimensionalPriceGroupID}/prices`, {
      body,
      ...options,
    });
  }

  /**
   * This endpoint returns the prices in a dimensional price group. Subscription
   * overrides are omitted. Archived prices are omitted unless `status` is `archived`
   * or `all`.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const price of client.dimensionalPriceGroups.prices.list(
   *   'dimensional_price_group_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(
    dimensionalPriceGroupID: string,
    query: PriceListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<PricesPage, Shared.Price> {
    return this._client.getAPIList(
      path`/dimensional_price_groups/${dimensionalPriceGroupID}/prices`,
      Page<Shared.Price>,
      { query, ...options },
    );
  }
}

export interface PriceCreateResponse {
  /**
   * The prices created by this request, in request order.
   */
  data: Array<Shared.Price>;
}

export interface PriceCreateParams {
  /**
   * Billing cadence for every price
   */
  cadence: 'one_time' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

  /**
   * An ISO 4217 currency string for every price.
   */
  currency: string;

  /**
   * The item for every price. Must be the group's billable metric item.
   */
  item_id: string;

  model_type: 'unit' | 'tiered';

  prices: Array<PriceCreateParams.Price>;

  /**
   * Shared tier boundaries. Required for tiered prices and omitted for unit prices.
   */
  tiers?: Array<PriceCreateParams.Tier> | null;
}

export namespace PriceCreateParams {
  export interface Price {
    /**
     * One amount for a unit price. One amount per tier for a tiered price, in tier
     * order.
     */
    amounts: Array<number>;

    /**
     * Dimension values, in the group's dimension order.
     */
    dimension_values: Array<string>;

    /**
     * Price name. Defaults to the dimension values.
     */
    name?: string | null;
  }

  export interface Tier {
    /**
     * Exclusive tier starting value
     */
    first_unit: number;

    /**
     * Inclusive tier ending value. Null on the last tier.
     */
    last_unit?: number | null;
  }
}

export interface PriceListParams extends PageParams {
  /**
   * active omits archived prices. archived returns only archived prices. all returns
   * both.
   */
  status?: 'active' | 'archived' | 'all';
}

export declare namespace Prices {
  export {
    type PriceCreateResponse as PriceCreateResponse,
    type PriceCreateParams as PriceCreateParams,
    type PriceListParams as PriceListParams,
  };
}

export { type PricesPage };
