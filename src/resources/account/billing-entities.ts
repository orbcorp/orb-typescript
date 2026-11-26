// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as Shared from '../shared';
import * as CustomersAPI from '../customers/customers';
import { APIPromise } from '../../core/api-promise';
import { Page, type PageParams, PagePromise } from '../../core/pagination';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * A billing entity is a legal entity an account invoices from, with its own legal name, address and tax
 * registrations.
 */
export class BillingEntities extends APIResource {
  /**
   * This endpoint creates a billing entity: a legal entity the account invoices
   * from, with its own legal name, address, tax registrations, and invoice settings.
   * `external_billing_entity_id` cannot be changed after creation. This endpoint
   * requires an admin API key.
   */
  create(body: BillingEntityCreateParams, options?: RequestOptions): APIPromise<BillingEntity> {
    return this._client.post('/account/billing_entities', { body, ...options });
  }

  /**
   * This endpoint updates a billing entity, including the default one. Omitted
   * fields keep their value. A change to the name, legal name, address, or tax
   * registrations writes a new version of the billing entity; invoices already
   * issued keep the version they were issued with. In `invoice_settings`, a null
   * `memo` clears it so the billing entity uses the account's memo. An archived
   * billing entity cannot be updated until it is unarchived. This endpoint requires
   * an admin API key.
   *
   * `payment_gateway_connections` is the full set of connections the billing entity
   * collects payments through; a connection left out is disconnected from the
   * billing entity. If a payment through a connection left out is still in progress,
   * the whole update is rejected and can be retried once the payment finishes.
   */
  update(
    billingEntityID: string,
    body: BillingEntityUpdateParams,
    options?: RequestOptions,
  ): APIPromise<BillingEntity> {
    return this._client.put(path`/account/billing_entities/${billingEntityID}`, { body, ...options });
  }

  /**
   * This endpoint returns the account's billing entities, including the default
   * billing entity (`is_default: true`), ordered in descending order by creation
   * time.
   */
  list(
    query: BillingEntityListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<BillingEntitiesPage, BillingEntity> {
    return this._client.getAPIList('/account/billing_entities', Page<BillingEntity>, { query, ...options });
  }

  /**
   * This endpoint archives a billing entity. An archived billing entity cannot be
   * updated; invoices already issued keep it. The default billing entity cannot be
   * archived. Archiving a billing entity that is already archived returns it
   * unchanged. This endpoint requires an admin API key.
   */
  archive(billingEntityID: string, options?: RequestOptions): APIPromise<BillingEntity> {
    return this._client.post(path`/account/billing_entities/${billingEntityID}/archive`, options);
  }

  /**
   * This endpoint archives a billing entity. An archived billing entity cannot be
   * updated; invoices already issued keep it. The default billing entity cannot be
   * archived. Archiving a billing entity that is already archived returns it
   * unchanged. This endpoint requires an admin API key.
   */
  archiveByExternalID(externalBillingEntityID: string, options?: RequestOptions): APIPromise<BillingEntity> {
    return this._client.post(
      path`/account/billing_entities/external_billing_entity_id/${externalBillingEntityID}/archive`,
      options,
    );
  }

  /**
   * This endpoint returns a billing entity identified by its ID, or by the
   * `external_billing_entity_id` set when it was created.
   */
  fetch(billingEntityID: string, options?: RequestOptions): APIPromise<BillingEntity> {
    return this._client.get(path`/account/billing_entities/${billingEntityID}`, options);
  }

  /**
   * This endpoint returns a billing entity identified by its ID, or by the
   * `external_billing_entity_id` set when it was created.
   */
  fetchByExternalID(externalBillingEntityID: string, options?: RequestOptions): APIPromise<BillingEntity> {
    return this._client.get(
      path`/account/billing_entities/external_billing_entity_id/${externalBillingEntityID}`,
      options,
    );
  }

  /**
   * This endpoint restores an archived billing entity to active. Unarchiving an
   * active billing entity returns it unchanged. This endpoint requires an admin API
   * key.
   */
  unarchive(billingEntityID: string, options?: RequestOptions): APIPromise<BillingEntity> {
    return this._client.post(path`/account/billing_entities/${billingEntityID}/unarchive`, options);
  }

  /**
   * This endpoint restores an archived billing entity to active. Unarchiving an
   * active billing entity returns it unchanged. This endpoint requires an admin API
   * key.
   */
  unarchiveByExternalID(
    externalBillingEntityID: string,
    options?: RequestOptions,
  ): APIPromise<BillingEntity> {
    return this._client.post(
      path`/account/billing_entities/external_billing_entity_id/${externalBillingEntityID}/unarchive`,
      options,
    );
  }

  /**
   * This endpoint updates a billing entity, including the default one. Omitted
   * fields keep their value. A change to the name, legal name, address, or tax
   * registrations writes a new version of the billing entity; invoices already
   * issued keep the version they were issued with. In `invoice_settings`, a null
   * `memo` clears it so the billing entity uses the account's memo. An archived
   * billing entity cannot be updated until it is unarchived. This endpoint requires
   * an admin API key.
   *
   * `payment_gateway_connections` is the full set of connections the billing entity
   * collects payments through; a connection left out is disconnected from the
   * billing entity. If a payment through a connection left out is still in progress,
   * the whole update is rejected and can be retried once the payment finishes.
   */
  updateByExternalID(
    externalBillingEntityID: string,
    body: BillingEntityUpdateByExternalIDParams,
    options?: RequestOptions,
  ): APIPromise<BillingEntity> {
    return this._client.put(
      path`/account/billing_entities/external_billing_entity_id/${externalBillingEntityID}`,
      { body, ...options },
    );
  }
}

export type BillingEntitiesPage = Page<BillingEntity>;

/**
 * A billing entity is a legal entity an account invoices from, with its own legal
 * name, address and tax registrations.
 */
export interface BillingEntity {
  /**
   * The Orb-assigned unique identifier for the billing entity.
   */
  id: string;

  /**
   * The address printed on invoices.
   */
  address: Shared.Address | null;

  /**
   * The time the billing entity was created.
   */
  created_at: string;

  /**
   * The ID of the connection Orb charges when the customer is not mapped to any of
   * the billing entity's connections.
   */
  default_payment_gateway_connection_id: string | null;

  /**
   * An optional user-defined ID for this billing entity, unique within the account.
   * This cannot be changed after creation.
   */
  external_billing_entity_id: string | null;

  /**
   * The billing entity's own invoice settings. Each null field inherits the
   * account's setting.
   */
  invoice_settings: BillingEntity.InvoiceSettings;

  /**
   * Whether this is the account's default billing entity.
   */
  is_default: boolean;

  /**
   * The legal name printed on invoices.
   */
  legal_name: string;

  /**
   * An internal name for the billing entity.
   */
  name: string;

  /**
   * The payment gateway connections the billing entity collects payments through.
   */
  payment_gateway_connections: Array<BillingEntity.PaymentGatewayConnection>;

  status: 'active' | 'archived';

  tax_registrations: Array<BillingEntity.TaxRegistration>;
}

export namespace BillingEntity {
  /**
   * The billing entity's own invoice settings. Each null field inherits the
   * account's setting.
   */
  export interface InvoiceSettings {
    /**
     * The memo printed on the entity's invoices.
     */
    memo: string | null;
  }

  export interface PaymentGatewayConnection {
    /**
     * Whether this is the billing entity's default payment gateway connection.
     */
    is_default: boolean;

    /**
     * The ID of the billing entity's payment gateway connection.
     */
    payment_gateway_connection_id: string;

    /**
     * The connection's payment provider.
     */
    payment_provider_type: 'stripe' | 'adyen';
  }

  export interface TaxRegistration {
    /**
     * The jurisdiction the registration applies to. If null, it applies to every
     * customer. A Canadian provincial registration (`CA PST-BC`, `CA PST-MB`,
     * `CA PST-SK`, `CA QST`) only applies to customers in its province, whatever this
     * field holds.
     */
    applies_to: string | null;

    /**
     * The tax registration type, for example `DE VAT`.
     */
    code: string;

    /**
     * The registration number.
     */
    value: string;
  }
}

export interface BillingEntityCreateParams {
  /**
   * The address printed on invoices.
   */
  address: CustomersAPI.AddressInput;

  /**
   * The legal name printed on invoices.
   */
  legal_name: string;

  /**
   * An internal name for the billing entity.
   */
  name: string;

  /**
   * An optional user-defined ID for this billing entity, unique within the account.
   * This cannot be changed after creation.
   */
  external_billing_entity_id?: string | null;

  /**
   * Settings that override the account's for this billing entity.
   */
  invoice_settings?: BillingEntityCreateParams.InvoiceSettings | null;

  tax_registrations?: Array<BillingEntityCreateParams.TaxRegistration>;
}

export namespace BillingEntityCreateParams {
  /**
   * Settings that override the account's for this billing entity.
   */
  export interface InvoiceSettings {
    /**
     * The memo printed on the entity's invoices.
     */
    memo?: string | null;
  }

  export interface TaxRegistration {
    /**
     * The tax registration type, for example `DE VAT`.
     */
    code: string;

    /**
     * The registration number.
     */
    value: string;

    /**
     * The jurisdiction the registration applies to. If null, it applies to every
     * customer. A Canadian provincial registration (`CA PST-BC`, `CA PST-MB`,
     * `CA PST-SK`, `CA QST`) only applies to customers in its province, whatever this
     * field holds.
     */
    applies_to?: string | null;
  }
}

export interface BillingEntityUpdateParams {
  /**
   * Replaces the whole address. Omit it to keep the current one.
   */
  address?: CustomersAPI.AddressInput | null;

  /**
   * The ID of the connection Orb charges when the customer is not mapped to any of
   * the billing entity's connections. Required when `payment_gateway_connections`
   * has more than one entry.
   */
  default_payment_gateway_connection_id?: string | null;

  /**
   * The invoice settings to change. Omitted fields keep their value; null clears a
   * field so it inherits the account's setting.
   */
  invoice_settings?: BillingEntityUpdateParams.InvoiceSettings | null;

  /**
   * The legal name printed on invoices.
   */
  legal_name?: string | null;

  /**
   * An internal name for the billing entity.
   */
  name?: string | null;

  /**
   * The full set of payment gateway connections the billing entity collects payments
   * through. Omit it to keep the current ones. Naming another billing entity's
   * connection gives this billing entity a connection of its own through the same
   * Stripe account or Adyen merchant account.
   */
  payment_gateway_connections?: Array<BillingEntityUpdateParams.PaymentGatewayConnection> | null;

  /**
   * The full list of registrations. Omit it to keep the current ones.
   */
  tax_registrations?: Array<BillingEntityUpdateParams.TaxRegistration> | null;
}

export namespace BillingEntityUpdateParams {
  /**
   * The invoice settings to change. Omitted fields keep their value; null clears a
   * field so it inherits the account's setting.
   */
  export interface InvoiceSettings {
    /**
     * The memo printed on the entity's invoices.
     */
    memo?: string | null;
  }

  export interface PaymentGatewayConnection {
    /**
     * The ID of a payment gateway connection of the account.
     */
    payment_gateway_connection_id: string;

    /**
     * The connection's payment provider.
     */
    payment_provider_type: 'stripe' | 'adyen';
  }

  export interface TaxRegistration {
    /**
     * The tax registration type, for example `DE VAT`.
     */
    code: string;

    /**
     * The registration number.
     */
    value: string;

    /**
     * The jurisdiction the registration applies to. If null, it applies to every
     * customer. A Canadian provincial registration (`CA PST-BC`, `CA PST-MB`,
     * `CA PST-SK`, `CA QST`) only applies to customers in its province, whatever this
     * field holds.
     */
    applies_to?: string | null;
  }
}

export interface BillingEntityListParams extends PageParams {
  /**
   * Only return billing entities with this status. Omit to return both.
   */
  status?: 'active' | 'archived' | null;
}

export interface BillingEntityUpdateByExternalIDParams {
  /**
   * Replaces the whole address. Omit it to keep the current one.
   */
  address?: CustomersAPI.AddressInput | null;

  /**
   * The ID of the connection Orb charges when the customer is not mapped to any of
   * the billing entity's connections. Required when `payment_gateway_connections`
   * has more than one entry.
   */
  default_payment_gateway_connection_id?: string | null;

  /**
   * The invoice settings to change. Omitted fields keep their value; null clears a
   * field so it inherits the account's setting.
   */
  invoice_settings?: BillingEntityUpdateByExternalIDParams.InvoiceSettings | null;

  /**
   * The legal name printed on invoices.
   */
  legal_name?: string | null;

  /**
   * An internal name for the billing entity.
   */
  name?: string | null;

  /**
   * The full set of payment gateway connections the billing entity collects payments
   * through. Omit it to keep the current ones. Naming another billing entity's
   * connection gives this billing entity a connection of its own through the same
   * Stripe account or Adyen merchant account.
   */
  payment_gateway_connections?: Array<BillingEntityUpdateByExternalIDParams.PaymentGatewayConnection> | null;

  /**
   * The full list of registrations. Omit it to keep the current ones.
   */
  tax_registrations?: Array<BillingEntityUpdateByExternalIDParams.TaxRegistration> | null;
}

export namespace BillingEntityUpdateByExternalIDParams {
  /**
   * The invoice settings to change. Omitted fields keep their value; null clears a
   * field so it inherits the account's setting.
   */
  export interface InvoiceSettings {
    /**
     * The memo printed on the entity's invoices.
     */
    memo?: string | null;
  }

  export interface PaymentGatewayConnection {
    /**
     * The ID of a payment gateway connection of the account.
     */
    payment_gateway_connection_id: string;

    /**
     * The connection's payment provider.
     */
    payment_provider_type: 'stripe' | 'adyen';
  }

  export interface TaxRegistration {
    /**
     * The tax registration type, for example `DE VAT`.
     */
    code: string;

    /**
     * The registration number.
     */
    value: string;

    /**
     * The jurisdiction the registration applies to. If null, it applies to every
     * customer. A Canadian provincial registration (`CA PST-BC`, `CA PST-MB`,
     * `CA PST-SK`, `CA QST`) only applies to customers in its province, whatever this
     * field holds.
     */
    applies_to?: string | null;
  }
}

export declare namespace BillingEntities {
  export {
    type BillingEntity as BillingEntity,
    type BillingEntitiesPage as BillingEntitiesPage,
    type BillingEntityCreateParams as BillingEntityCreateParams,
    type BillingEntityUpdateParams as BillingEntityUpdateParams,
    type BillingEntityListParams as BillingEntityListParams,
    type BillingEntityUpdateByExternalIDParams as BillingEntityUpdateByExternalIDParams,
  };
}
