// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as Shared from '../shared';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * The Price resource represents a price that can be billed on a subscription, resulting in a charge on an invoice in
 * the form of an invoice line item. Prices take a quantity and determine an amount to bill.
 *
 * Orb supports a few different pricing models out of the box. Each of these models is serialized differently in a
 * given Price object. The model_type field determines the key for the configuration object that is present.
 *
 * For more on the types of prices, see [the core concepts documentation](/core-concepts#plan-and-price)
 */
export class ExternalPriceID extends APIResource {
  /**
   * This endpoint allows you to update the `metadata` property on a price. If you
   * pass null for the metadata value, it will clear any existing metadata for that
   * price.
   *
   * @example
   * ```ts
   * const price = await client.prices.externalPriceID.update(
   *   'external_price_id',
   * );
   * ```
   */
  update(
    externalPriceId: string,
    body: ExternalPriceIDUpdateParams,
    options?: RequestOptions,
  ): APIPromise<Shared.Price> {
    return this._client.put(path`/prices/external_price_id/${externalPriceId}`, { body, ...options });
  }

  /**
   * This endpoint returns a price given an external price id. See the
   * [price creation API](/api-reference/price/create-price) for more information
   * about external price aliases.
   *
   * @example
   * ```ts
   * const price = await client.prices.externalPriceID.fetch(
   *   'external_price_id',
   * );
   * ```
   */
  fetch(externalPriceId: string, options?: RequestOptions): APIPromise<Shared.Price> {
    return this._client.get(path`/prices/external_price_id/${externalPriceId}`, options);
  }
}

export interface ExternalPriceIDUpdateParams {
  /**
   * User-specified key/value pairs for the resource. Individual keys can be removed
   * by setting the value to `null`, and the entire metadata mapping can be cleared
   * by setting `metadata` to `null`.
   */
  metadata?: { [key: string]: string | null } | null;
}

export declare namespace ExternalPriceID {
  export { type ExternalPriceIDUpdateParams as ExternalPriceIDUpdateParams };
}
