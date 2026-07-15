// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { Page, type PageParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

/**
 * The Item resource represents a sellable product or good. Items are associated with all line items, billable metrics,
 * and prices and are used for defining external sync behavior for invoices and tax calculation purposes.
 */
export class Items extends APIResource {
  /**
   * This endpoint is used to create an [Item](/core-concepts#item).
   *
   * @example
   * ```ts
   * const item = await client.items.create({
   *   name: 'API requests',
   * });
   * ```
   */
  create(body: ItemCreateParams, options?: RequestOptions): APIPromise<Item> {
    return this._client.post('/items', { body, ...options });
  }

  /**
   * This endpoint can be used to update properties on the Item.
   *
   * @example
   * ```ts
   * const item = await client.items.update('item_id');
   * ```
   */
  update(itemID: string, body: ItemUpdateParams, options?: RequestOptions): APIPromise<Item> {
    return this._client.put(path`/items/${itemID}`, { body, ...options });
  }

  /**
   * This endpoint returns a list of all Items, ordered in descending order by
   * creation time.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const item of client.items.list()) {
   *   // ...
   * }
   * ```
   */
  list(
    query: ItemListParams | null | undefined = {},
    options?: RequestOptions,
  ): PagePromise<ItemsPage, Item> {
    return this._client.getAPIList('/items', Page<Item>, { query, ...options });
  }

  /**
   * Archive item
   *
   * @example
   * ```ts
   * const item = await client.items.archive('item_id');
   * ```
   */
  archive(itemID: string, options?: RequestOptions): APIPromise<Item> {
    return this._client.post(path`/items/${itemID}/archive`, options);
  }

  /**
   * This endpoint returns an item identified by its item_id.
   *
   * @example
   * ```ts
   * const item = await client.items.fetch('item_id');
   * ```
   */
  fetch(itemID: string, options?: RequestOptions): APIPromise<Item> {
    return this._client.get(path`/items/${itemID}`, options);
  }
}

export type ItemsPage = Page<Item>;

/**
 * The Item resource represents a sellable product or good. Items are associated
 * with all line items, billable metrics, and prices and are used for defining
 * external sync behavior for invoices and tax calculation purposes.
 */
export interface Item {
  /**
   * The Orb-assigned unique identifier for the item.
   */
  id: string;

  /**
   * The time at which the item was created.
   */
  created_at: string;

  /**
   * A list of external connections for this item, used to sync with external
   * invoicing and tax systems.
   */
  external_connections: Array<Item.ExternalConnection>;

  /**
   * User specified key-value pairs for the resource. If not present, this defaults
   * to an empty dictionary. Individual keys can be removed by setting the value to
   * `null`, and the entire metadata mapping can be cleared by setting `metadata` to
   * `null`.
   */
  metadata: { [key: string]: string };

  /**
   * The name of the item.
   */
  name: string;

  /**
   * The time at which the item was archived. If null, the item is not archived.
   */
  archived_at?: string | null;
}

export namespace Item {
  /**
   * Represents a connection between an Item and an external system for invoicing or
   * tax calculation purposes.
   */
  export interface ExternalConnection {
    /**
     * The name of the external system this item is connected to.
     */
    external_connection_name:
      | 'stripe'
      | 'quickbooks'
      | 'bill.com'
      | 'netsuite'
      | 'taxjar'
      | 'avalara'
      | 'anrok'
      | 'numeral'
      | 'stripe_tax';

    /**
     * The identifier of this item in the external system.
     */
    external_entity_id: string;
  }
}

export interface ItemCreateParams {
  /**
   * The name of the item.
   */
  name: string;

  /**
   * User-specified key/value pairs for the resource. Individual keys can be removed
   * by setting the value to `null`, and the entire metadata mapping can be cleared
   * by setting `metadata` to `null`.
   */
  metadata?: { [key: string]: string | null } | null;
}

export interface ItemUpdateParams {
  external_connections?: Array<ItemUpdateParams.ExternalConnection> | null;

  /**
   * User-specified key/value pairs for the resource. Individual keys can be removed
   * by setting the value to `null`, and the entire metadata mapping can be cleared
   * by setting `metadata` to `null`.
   */
  metadata?: { [key: string]: string | null } | null;

  name?: string | null;
}

export namespace ItemUpdateParams {
  /**
   * Represents a connection between an Item and an external system for invoicing or
   * tax calculation purposes.
   */
  export interface ExternalConnection {
    /**
     * The name of the external system this item is connected to.
     */
    external_connection_name:
      | 'stripe'
      | 'quickbooks'
      | 'bill.com'
      | 'netsuite'
      | 'taxjar'
      | 'avalara'
      | 'anrok'
      | 'numeral'
      | 'stripe_tax';

    /**
     * The identifier of this item in the external system.
     */
    external_entity_id: string;
  }
}

export interface ItemListParams extends PageParams {}

export declare namespace Items {
  export {
    type Item as Item,
    type ItemsPage as ItemsPage,
    type ItemCreateParams as ItemCreateParams,
    type ItemUpdateParams as ItemUpdateParams,
    type ItemListParams as ItemListParams,
  };
}
