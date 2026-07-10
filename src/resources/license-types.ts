// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { Page, type PageParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

/**
 * The LicenseType resource represents a type of license that can be assigned to users.
 * License types are used during billing by grouping metrics on the configured grouping key.
 */
export class LicenseTypes extends APIResource {
  /**
   * This endpoint is used to create a new license type.
   *
   * License types are used to group licenses and define billing behavior. Each
   * license type has a name and a grouping key that determines how metrics are
   * aggregated for billing purposes.
   */
  create(body: LicenseTypeCreateParams, options?: RequestOptions): APIPromise<LicenseTypeCreateResponse> {
    return this._client.post('/license_types', { body, ...options });
  }

  /**
   * This endpoint returns a license type identified by its license_type_id.
   *
   * Use this endpoint to retrieve details about a specific license type, including
   * its name and grouping key.
   */
  retrieve(licenseTypeId: string, options?: RequestOptions): APIPromise<LicenseTypeRetrieveResponse> {
    return this._client.get(path`/license_types/${licenseTypeId}`, options);
  }

  /**
   * This endpoint returns a list of all license types configured for the account,
   * ordered in ascending order by creation time.
   *
   * License types are used to group licenses and define billing behavior. Each
   * license type has a name and a grouping key that determines how metrics are
   * aggregated for billing purposes.
   */
  list(
    query: LicenseTypeListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<LicenseTypeListResponsesPage, LicenseTypeListResponse> {
    return this._client.getAPIList('/license_types', Page<LicenseTypeListResponse>, { query, ...options });
  }
}

export type LicenseTypeListResponsesPage = Page<LicenseTypeListResponse>;

/**
 * The LicenseType resource represents a type of license that can be assigned to
 * users. License types are used during billing by grouping metrics on the
 * configured grouping key.
 */
export interface LicenseTypeCreateResponse {
  /**
   * The Orb-assigned unique identifier for the license type.
   */
  id: string;

  /**
   * The key used for grouping licenses of this type. This is typically a user
   * identifier field.
   */
  grouping_key: string;

  /**
   * The name of the license type.
   */
  name: string;
}

/**
 * The LicenseType resource represents a type of license that can be assigned to
 * users. License types are used during billing by grouping metrics on the
 * configured grouping key.
 */
export interface LicenseTypeRetrieveResponse {
  /**
   * The Orb-assigned unique identifier for the license type.
   */
  id: string;

  /**
   * The key used for grouping licenses of this type. This is typically a user
   * identifier field.
   */
  grouping_key: string;

  /**
   * The name of the license type.
   */
  name: string;
}

/**
 * The LicenseType resource represents a type of license that can be assigned to
 * users. License types are used during billing by grouping metrics on the
 * configured grouping key.
 */
export interface LicenseTypeListResponse {
  /**
   * The Orb-assigned unique identifier for the license type.
   */
  id: string;

  /**
   * The key used for grouping licenses of this type. This is typically a user
   * identifier field.
   */
  grouping_key: string;

  /**
   * The name of the license type.
   */
  name: string;
}

export interface LicenseTypeCreateParams {
  /**
   * The key used for grouping licenses of this type. This is typically a user
   * identifier field.
   */
  grouping_key: string;

  /**
   * The name of the license type.
   */
  name: string;
}

export interface LicenseTypeListParams extends PageParams {}

export declare namespace LicenseTypes {
  export {
    type LicenseTypeCreateResponse as LicenseTypeCreateResponse,
    type LicenseTypeRetrieveResponse as LicenseTypeRetrieveResponse,
    type LicenseTypeListResponse as LicenseTypeListResponse,
    type LicenseTypeListResponsesPage as LicenseTypeListResponsesPage,
    type LicenseTypeCreateParams as LicenseTypeCreateParams,
    type LicenseTypeListParams as LicenseTypeListParams,
  };
}
