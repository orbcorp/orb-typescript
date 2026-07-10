// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as ExternalLicensesAPI from './external-licenses';
import {
  ExternalLicenseGetUsageParams,
  ExternalLicenseGetUsageResponse,
  ExternalLicenses,
} from './external-licenses';
import * as UsageAPI from './usage';
import {
  Usage,
  UsageGetAllUsageParams,
  UsageGetAllUsageResponse,
  UsageGetUsageParams,
  UsageGetUsageResponse,
} from './usage';
import { APIPromise } from '../../core/api-promise';
import { Page, type PageParams, PagePromise } from '../../core/pagination';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Licenses extends APIResource {
  externalLicenses: ExternalLicensesAPI.ExternalLicenses = new ExternalLicensesAPI.ExternalLicenses(
    this._client,
  );
  usage: UsageAPI.Usage = new UsageAPI.Usage(this._client);

  /**
   * This endpoint is used to create a new license for a user.
   *
   * If a start date is provided, the license will be activated at the **start** of
   * the specified date in the customer's timezone. Otherwise, the activation time
   * will default to the **start** of the current day in the customer's timezone.
   *
   * @example
   * ```ts
   * const license = await client.licenses.create({
   *   external_license_id: 'external_license_id',
   *   license_type_id: 'license_type_id',
   *   subscription_id: 'subscription_id',
   * });
   * ```
   */
  create(body: LicenseCreateParams, options?: RequestOptions): APIPromise<LicenseCreateResponse> {
    return this._client.post('/licenses', { body, ...options });
  }

  /**
   * This endpoint is used to fetch a license given an identifier.
   *
   * @example
   * ```ts
   * const license = await client.licenses.retrieve(
   *   'license_id',
   * );
   * ```
   */
  retrieve(licenseId: string, options?: RequestOptions): APIPromise<LicenseRetrieveResponse> {
    return this._client.get(path`/licenses/${licenseId}`, options);
  }

  /**
   * This endpoint returns a list of all licenses for a subscription.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const licenseListResponse of client.licenses.list(
   *   { subscription_id: 'subscription_id' },
   * )) {
   *   // ...
   * }
   * ```
   */
  list(
    query: LicenseListParams,
    options?: RequestOptions,
  ): PagePromise<LicenseListResponsesPage, LicenseListResponse> {
    return this._client.getAPIList('/licenses', Page<LicenseListResponse>, { query, ...options });
  }

  /**
   * This endpoint is used to deactivate an existing license.
   *
   * If an end date is provided, the license will be deactivated at the **start** of
   * the specified date in the customer's timezone. Otherwise, the deactivation time
   * will default to the **end** of the current day in the customer's timezone.
   *
   * @example
   * ```ts
   * const response = await client.licenses.deactivate(
   *   'license_id',
   * );
   * ```
   */
  deactivate(
    licenseId: string,
    body: LicenseDeactivateParams,
    options?: RequestOptions,
  ): APIPromise<LicenseDeactivateResponse> {
    return this._client.post(path`/licenses/${licenseId}/deactivate`, { body, ...options });
  }

  /**
   * This endpoint is used to fetch a license given an external license identifier.
   *
   * @example
   * ```ts
   * const response = await client.licenses.retrieveByExternalID(
   *   'external_license_id',
   *   {
   *     license_type_id: 'license_type_id',
   *     subscription_id: 'subscription_id',
   *   },
   * );
   * ```
   */
  retrieveByExternalID(
    externalLicenseId: string,
    query: LicenseRetrieveByExternalIDParams,
    options?: RequestOptions,
  ): APIPromise<LicenseRetrieveByExternalIDResponse> {
    return this._client.get(path`/licenses/external_license_id/${externalLicenseId}`, { query, ...options });
  }
}

export type LicenseListResponsesPage = Page<LicenseListResponse>;

export interface LicenseCreateResponse {
  id: string;

  end_date: string | null;

  external_license_id: string;

  license_type_id: string;

  start_date: string;

  status: 'active' | 'inactive';

  subscription_id: string;
}

export interface LicenseRetrieveResponse {
  id: string;

  end_date: string | null;

  external_license_id: string;

  license_type_id: string;

  start_date: string;

  status: 'active' | 'inactive';

  subscription_id: string;
}

export interface LicenseListResponse {
  id: string;

  end_date: string | null;

  external_license_id: string;

  license_type_id: string;

  start_date: string;

  status: 'active' | 'inactive';

  subscription_id: string;
}

export interface LicenseDeactivateResponse {
  id: string;

  end_date: string | null;

  external_license_id: string;

  license_type_id: string;

  start_date: string;

  status: 'active' | 'inactive';

  subscription_id: string;
}

export interface LicenseRetrieveByExternalIDResponse {
  id: string;

  end_date: string | null;

  external_license_id: string;

  license_type_id: string;

  start_date: string;

  status: 'active' | 'inactive';

  subscription_id: string;
}

export interface LicenseCreateParams {
  /**
   * The external identifier for the license.
   */
  external_license_id: string;

  license_type_id: string;

  subscription_id: string;

  /**
   * The end date of the license. If not provided, the license will remain active
   * until deactivated.
   */
  end_date?: string | null;

  /**
   * The start date of the license. If not provided, defaults to start of day today
   * in the customer's timezone.
   */
  start_date?: string | null;
}

export interface LicenseListParams extends PageParams {
  subscription_id: string;

  external_license_id?: string | null;

  license_type_id?: string | null;

  status?: 'active' | 'inactive' | null;
}

export interface LicenseDeactivateParams {
  /**
   * The date to deactivate the license. If not provided, defaults to end of day
   * today in the customer's timezone.
   */
  end_date?: string | null;
}

export interface LicenseRetrieveByExternalIDParams {
  /**
   * The ID of the license type to fetch the license for.
   */
  license_type_id: string;

  /**
   * The ID of the subscription to fetch the license for.
   */
  subscription_id: string;
}

Licenses.ExternalLicenses = ExternalLicenses;
Licenses.Usage = Usage;

export declare namespace Licenses {
  export {
    type LicenseCreateResponse as LicenseCreateResponse,
    type LicenseRetrieveResponse as LicenseRetrieveResponse,
    type LicenseListResponse as LicenseListResponse,
    type LicenseDeactivateResponse as LicenseDeactivateResponse,
    type LicenseRetrieveByExternalIDResponse as LicenseRetrieveByExternalIDResponse,
    type LicenseListResponsesPage as LicenseListResponsesPage,
    type LicenseCreateParams as LicenseCreateParams,
    type LicenseListParams as LicenseListParams,
    type LicenseDeactivateParams as LicenseDeactivateParams,
    type LicenseRetrieveByExternalIDParams as LicenseRetrieveByExternalIDParams,
  };

  export {
    ExternalLicenses as ExternalLicenses,
    type ExternalLicenseGetUsageResponse as ExternalLicenseGetUsageResponse,
    type ExternalLicenseGetUsageParams as ExternalLicenseGetUsageParams,
  };

  export {
    Usage as Usage,
    type UsageGetAllUsageResponse as UsageGetAllUsageResponse,
    type UsageGetUsageResponse as UsageGetUsageResponse,
    type UsageGetAllUsageParams as UsageGetAllUsageParams,
    type UsageGetUsageParams as UsageGetUsageParams,
  };
}
