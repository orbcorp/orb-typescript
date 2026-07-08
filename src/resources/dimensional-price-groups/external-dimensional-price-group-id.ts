// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as DimensionalPriceGroupsAPI from './dimensional-price-groups';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class ExternalDimensionalPriceGroupID extends APIResource {
  /**
   * Fetch dimensional price group by external ID
   *
   * @example
   * ```ts
   * const dimensionalPriceGroup =
   *   await client.dimensionalPriceGroups.externalDimensionalPriceGroupID.retrieve(
   *     'external_dimensional_price_group_id',
   *   );
   * ```
   */
  retrieve(
    externalDimensionalPriceGroupID: string,
    options?: RequestOptions,
  ): APIPromise<DimensionalPriceGroupsAPI.DimensionalPriceGroup> {
    return this._client.get(
      path`/dimensional_price_groups/external_dimensional_price_group_id/${externalDimensionalPriceGroupID}`,
      options,
    );
  }

  /**
   * This endpoint can be used to update the `external_dimensional_price_group_id`
   * and `metadata` of an existing dimensional price group. Other fields on a
   * dimensional price group are currently immutable.
   *
   * @example
   * ```ts
   * const dimensionalPriceGroup =
   *   await client.dimensionalPriceGroups.externalDimensionalPriceGroupID.update(
   *     'external_dimensional_price_group_id',
   *   );
   * ```
   */
  update(
    externalDimensionalPriceGroupID: string,
    body: ExternalDimensionalPriceGroupIDUpdateParams,
    options?: RequestOptions,
  ): APIPromise<DimensionalPriceGroupsAPI.DimensionalPriceGroup> {
    return this._client.put(
      path`/dimensional_price_groups/external_dimensional_price_group_id/${externalDimensionalPriceGroupID}`,
      { body, ...options },
    );
  }
}

export interface ExternalDimensionalPriceGroupIDUpdateParams {
  /**
   * An optional user-defined ID for this dimensional price group resource, used
   * throughout the system as an alias for this dimensional price group. Use this
   * field to identify a dimensional price group by an existing identifier in your
   * system.
   */
  external_dimensional_price_group_id?: string | null;

  /**
   * User-specified key/value pairs for the resource. Individual keys can be removed
   * by setting the value to `null`, and the entire metadata mapping can be cleared
   * by setting `metadata` to `null`.
   */
  metadata?: { [key: string]: string | null } | null;
}

export declare namespace ExternalDimensionalPriceGroupID {
  export { type ExternalDimensionalPriceGroupIDUpdateParams as ExternalDimensionalPriceGroupIDUpdateParams };
}
