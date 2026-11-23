// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { Page, type PageParams, PagePromise } from '../../core/pagination';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * A payment gateway connection is one Stripe account or one Adyen merchant account that a billing entity collects
 * payments through.
 */
export class PaymentGatewayConnections extends APIResource {
  /**
   * This endpoint returns the account's payment gateway connections with the billing
   * entity each one collects for, ordered in descending order by creation time.
   */
  list(
    query: PaymentGatewayConnectionListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<PaymentGatewayConnectionsPage, PaymentGatewayConnection> {
    return this._client.getAPIList('/account/payment_gateway_connections', Page<PaymentGatewayConnection>, {
      query,
      ...options,
    });
  }

  /**
   * This endpoint returns a payment gateway connection identified by its ID.
   */
  fetch(paymentGatewayConnectionID: string, options?: RequestOptions): APIPromise<PaymentGatewayConnection> {
    return this._client.get(
      path`/account/payment_gateway_connections/${paymentGatewayConnectionID}`,
      options,
    );
  }
}

export type PaymentGatewayConnectionsPage = Page<PaymentGatewayConnection>;

/**
 * A payment gateway connection is one Stripe account or one Adyen merchant account
 * that a billing entity collects payments through.
 */
export interface PaymentGatewayConnection {
  /**
   * The Orb-assigned unique identifier for the payment gateway connection.
   */
  id: string;

  /**
   * The ID of the billing entity that collects payments through this connection.
   */
  billing_entity_id: string;

  /**
   * The time the connection was created.
   */
  created_at: string;

  /**
   * The ID of the account in the external payment provider.
   */
  external_account_id: string | null;

  /**
   * Whether this is the billing entity's default payment gateway connection.
   */
  is_default: boolean;

  /**
   * The external payment provider of this connection.
   */
  provider_type: 'stripe' | 'adyen';
}

export interface PaymentGatewayConnectionListParams extends PageParams {
  /**
   * Only return connections of this billing entity.
   */
  billing_entity_id?: string | null;

  /**
   * Only return connections of this payment provider.
   */
  provider_type?: 'stripe' | 'adyen' | null;
}

export declare namespace PaymentGatewayConnections {
  export {
    type PaymentGatewayConnection as PaymentGatewayConnection,
    type PaymentGatewayConnectionsPage as PaymentGatewayConnectionsPage,
    type PaymentGatewayConnectionListParams as PaymentGatewayConnectionListParams,
  };
}
