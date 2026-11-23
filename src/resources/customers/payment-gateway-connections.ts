// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * A customer is a buyer of your products, and the other party to the billing relationship.
 *
 * In Orb, customers are assigned system generated identifiers automatically, but it's often desirable to have these
 * match existing identifiers in your system. To avoid having to denormalize Orb ID information, you can pass in an
 * `external_customer_id` with your own identifier. See
 * [Customer ID Aliases](/events-and-metrics/customer-aliases) for further information about how these
 * aliases work in Orb.
 *
 * In addition to having an identifier in your system, a customer may exist in a payment provider solution like
 * Stripe. Use the `payment_provider_id` and the `payment_provider` enum field to express this mapping.
 *
 * A customer also has a timezone (from the standard [IANA timezone database](https://www.iana.org/time-zones)), which
 * defaults to your account's timezone. See [Timezone localization](/essentials/timezones) for
 * information on what this timezone parameter influences within Orb.
 */
export class PaymentGatewayConnections extends APIResource {
  /**
   * This endpoint maps the customer to a payment gateway connection. Orb charges the
   * customer for a billing entity's invoices through the customer's first mapping
   * for that billing entity; `is_default` moves that to this mapping when the
   * customer already has one.
   */
  create(
    customerID: string,
    body: PaymentGatewayConnectionCreateParams,
    options?: RequestOptions,
  ): APIPromise<CustomerPaymentGatewayConnection> {
    return this._client.post(path`/customers/${customerID}/payment_gateway_connections`, {
      body,
      ...options,
    });
  }

  /**
   * This endpoint updates the customer's mapping to a payment gateway connection:
   * the customer's ID in that account, and whether Orb charges the customer for the
   * billing entity's invoices through it. Omitted fields keep their value.
   */
  update(
    paymentGatewayConnectionID: string,
    params: PaymentGatewayConnectionUpdateParams,
    options?: RequestOptions,
  ): APIPromise<CustomerPaymentGatewayConnection> {
    const { customer_id, ...body } = params;
    return this._client.put(
      path`/customers/${customer_id}/payment_gateway_connections/${paymentGatewayConnectionID}`,
      { body, ...options },
    );
  }

  /**
   * This endpoint returns the customer's mappings to payment gateway connections,
   * for example the customer's Stripe ID in each connected Stripe account. A
   * customer has at most one mapping per connection, so the list is not paginated.
   */
  list(
    customerID: string,
    query: PaymentGatewayConnectionListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<PaymentGatewayConnectionListResponse> {
    return this._client.get(path`/customers/${customerID}/payment_gateway_connections`, {
      query,
      ...options,
    });
  }

  /**
   * This endpoint removes the customer's mapping to a payment gateway connection and
   * returns it. Active subscriptions and unpaid invoices do not block it. If the
   * mapping was the customer's default for the billing entity, the customer's oldest
   * remaining mapping on that entity becomes the default. With no mapping left, the
   * next charge goes through the billing entity's default connection.
   */
  delete(
    paymentGatewayConnectionID: string,
    params: PaymentGatewayConnectionDeleteParams,
    options?: RequestOptions,
  ): APIPromise<CustomerPaymentGatewayConnection> {
    const { customer_id } = params;
    return this._client.delete(
      path`/customers/${customer_id}/payment_gateway_connections/${paymentGatewayConnectionID}`,
      options,
    );
  }

  /**
   * This endpoint maps the customer to a payment gateway connection. Orb charges the
   * customer for a billing entity's invoices through the customer's first mapping
   * for that billing entity; `is_default` moves that to this mapping when the
   * customer already has one.
   */
  createByExternalID(
    externalCustomerID: string,
    body: PaymentGatewayConnectionCreateByExternalIDParams,
    options?: RequestOptions,
  ): APIPromise<CustomerPaymentGatewayConnection> {
    return this._client.post(
      path`/customers/external_customer_id/${externalCustomerID}/payment_gateway_connections`,
      { body, ...options },
    );
  }

  /**
   * This endpoint removes the customer's mapping to a payment gateway connection and
   * returns it. Active subscriptions and unpaid invoices do not block it. If the
   * mapping was the customer's default for the billing entity, the customer's oldest
   * remaining mapping on that entity becomes the default. With no mapping left, the
   * next charge goes through the billing entity's default connection.
   */
  deleteByExternalID(
    paymentGatewayConnectionID: string,
    params: PaymentGatewayConnectionDeleteByExternalIDParams,
    options?: RequestOptions,
  ): APIPromise<CustomerPaymentGatewayConnection> {
    const { external_customer_id } = params;
    return this._client.delete(
      path`/customers/external_customer_id/${external_customer_id}/payment_gateway_connections/${paymentGatewayConnectionID}`,
      options,
    );
  }

  /**
   * This endpoint returns the customer's mappings to payment gateway connections,
   * for example the customer's Stripe ID in each connected Stripe account. A
   * customer has at most one mapping per connection, so the list is not paginated.
   */
  listByExternalID(
    externalCustomerID: string,
    query: PaymentGatewayConnectionListByExternalIDParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<PaymentGatewayConnectionListByExternalIDResponse> {
    return this._client.get(
      path`/customers/external_customer_id/${externalCustomerID}/payment_gateway_connections`,
      { query, ...options },
    );
  }

  /**
   * This endpoint updates the customer's mapping to a payment gateway connection:
   * the customer's ID in that account, and whether Orb charges the customer for the
   * billing entity's invoices through it. Omitted fields keep their value.
   */
  updateByExternalID(
    paymentGatewayConnectionID: string,
    params: PaymentGatewayConnectionUpdateByExternalIDParams,
    options?: RequestOptions,
  ): APIPromise<CustomerPaymentGatewayConnection> {
    const { external_customer_id, ...body } = params;
    return this._client.put(
      path`/customers/external_customer_id/${external_customer_id}/payment_gateway_connections/${paymentGatewayConnectionID}`,
      { body, ...options },
    );
  }
}

/**
 * A customer's mapping to one payment gateway connection.
 */
export interface CustomerPaymentGatewayConnection {
  /**
   * The ID of the billing entity that collects payments through the connection.
   */
  billing_entity_id: string;

  /**
   * The time the mapping was created.
   */
  created_at: string;

  /**
   * The ID of the account in the external payment provider.
   */
  external_account_id: string | null;

  /**
   * Whether Orb charges the customer for that billing entity's invoices through this
   * mapping. On the default billing entity, it is the mapping the customer's
   * `payment_provider_id` reflects.
   */
  is_default: boolean;

  /**
   * The ID of the payment gateway connection the customer is mapped to.
   */
  payment_gateway_connection_id: string;

  /**
   * The ID of the customer in the external payment provider, or null if none is set.
   */
  provider_customer_id: string | null;

  /**
   * The external payment provider of the connection.
   */
  provider_type: 'stripe' | 'adyen';
}

export interface PaymentGatewayConnectionListResponse {
  customer_id: string;

  payment_gateway_connections: Array<CustomerPaymentGatewayConnection>;
}

export interface PaymentGatewayConnectionListByExternalIDResponse {
  customer_id: string;

  payment_gateway_connections: Array<CustomerPaymentGatewayConnection>;
}

export interface PaymentGatewayConnectionCreateParams {
  /**
   * The ID of the payment gateway connection to map the customer to.
   */
  payment_gateway_connection_id: string;

  /**
   * Whether Orb charges the customer for the billing entity's invoices through this
   * mapping. The customer's first mapping for a billing entity is the default
   * regardless.
   */
  is_default?: boolean;

  /**
   * The ID of the customer in the external payment provider.
   */
  provider_customer_id?: string | null;
}

export interface PaymentGatewayConnectionUpdateParams {
  /**
   * Path param
   */
  customer_id: string;

  /**
   * Body param: Only `true` is accepted: it makes this the customer's default
   * mapping for the connection's billing entity. Omit it to keep the current
   * default. To move the default, set it on another mapping.
   */
  is_default?: true | null;

  /**
   * Body param: The ID of the customer in the external payment provider. Omit it to
   * keep the current one; `null` clears it, and Orb creates a Stripe customer at the
   * next payment through this connection.
   */
  provider_customer_id?: string | null;
}

export interface PaymentGatewayConnectionListParams {
  /**
   * Only return mappings to this billing entity's connections.
   */
  billing_entity_id?: string | null;

  /**
   * Only return the mapping to this connection.
   */
  payment_gateway_connection_id?: string | null;
}

export interface PaymentGatewayConnectionDeleteParams {
  customer_id: string;
}

export interface PaymentGatewayConnectionCreateByExternalIDParams {
  /**
   * The ID of the payment gateway connection to map the customer to.
   */
  payment_gateway_connection_id: string;

  /**
   * Whether Orb charges the customer for the billing entity's invoices through this
   * mapping. The customer's first mapping for a billing entity is the default
   * regardless.
   */
  is_default?: boolean;

  /**
   * The ID of the customer in the external payment provider.
   */
  provider_customer_id?: string | null;
}

export interface PaymentGatewayConnectionDeleteByExternalIDParams {
  external_customer_id: string;
}

export interface PaymentGatewayConnectionListByExternalIDParams {
  /**
   * Only return mappings to this billing entity's connections.
   */
  billing_entity_id?: string | null;

  /**
   * Only return the mapping to this connection.
   */
  payment_gateway_connection_id?: string | null;
}

export interface PaymentGatewayConnectionUpdateByExternalIDParams {
  /**
   * Path param
   */
  external_customer_id: string;

  /**
   * Body param: Only `true` is accepted: it makes this the customer's default
   * mapping for the connection's billing entity. Omit it to keep the current
   * default. To move the default, set it on another mapping.
   */
  is_default?: true | null;

  /**
   * Body param: The ID of the customer in the external payment provider. Omit it to
   * keep the current one; `null` clears it, and Orb creates a Stripe customer at the
   * next payment through this connection.
   */
  provider_customer_id?: string | null;
}

export declare namespace PaymentGatewayConnections {
  export {
    type CustomerPaymentGatewayConnection as CustomerPaymentGatewayConnection,
    type PaymentGatewayConnectionListResponse as PaymentGatewayConnectionListResponse,
    type PaymentGatewayConnectionListByExternalIDResponse as PaymentGatewayConnectionListByExternalIDResponse,
    type PaymentGatewayConnectionCreateParams as PaymentGatewayConnectionCreateParams,
    type PaymentGatewayConnectionUpdateParams as PaymentGatewayConnectionUpdateParams,
    type PaymentGatewayConnectionListParams as PaymentGatewayConnectionListParams,
    type PaymentGatewayConnectionDeleteParams as PaymentGatewayConnectionDeleteParams,
    type PaymentGatewayConnectionCreateByExternalIDParams as PaymentGatewayConnectionCreateByExternalIDParams,
    type PaymentGatewayConnectionDeleteByExternalIDParams as PaymentGatewayConnectionDeleteByExternalIDParams,
    type PaymentGatewayConnectionListByExternalIDParams as PaymentGatewayConnectionListByExternalIDParams,
    type PaymentGatewayConnectionUpdateByExternalIDParams as PaymentGatewayConnectionUpdateByExternalIDParams,
  };
}
