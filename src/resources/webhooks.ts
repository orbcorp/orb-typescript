// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { loggerFor } from '../internal/utils';
import { buildHeaders, type HeadersLike } from '../internal/headers';
import { APIResource } from '../core/resource';
import { createHmac } from 'node:crypto';
import * as MetricsAPI from './metrics';
import * as Shared from './shared';
import * as SubscriptionsAPI from './subscriptions';
import * as CustomersAPI from './customers/customers';

function getRequiredHeader(headers: HeadersLike, name: string): string {
  const value = buildHeaders([headers]).values.get(name);
  if (value === null || value === undefined) {
    throw new Error(`Could not find ${name} header`);
  }
  return value;
}

export class Webhooks extends APIResource {
  /**
   * Validates that the given payload was sent by Orb and parses the payload.
   *
   * An error will be raised if the webhook payload was not sent by Orb.
   */
  unwrap(
    payload: string,
    headers: HeadersLike,
    secret: string | undefined | null = this._client.webhookSecret,
  ): UnwrapWebhookEvent {
    this.verifySignature(payload, headers, secret);
    return JSON.parse(payload) as UnwrapWebhookEvent;
  }

  private parseSecret(secret: string | null | undefined): Uint8Array {
    if (!secret) {
      throw new Error(
        "The webhook secret must either be set using the env var, ORB_WEBHOOK_SECRET, on the client class, Orb({ webhookSecret: '123' }), or passed to this function",
      );
    }

    const buf = Buffer.from(secret, 'utf-8');
    if (buf.toString('utf-8') !== secret) {
      throw new Error(`Given secret is not valid`);
    }

    return new Uint8Array(buf);
  }

  private signPayload(payload: string, { timestamp, secret }: { timestamp: string; secret: Uint8Array }) {
    const encoder = new TextEncoder();
    const toSign = encoder.encode(`v1:${timestamp}:${payload}`);

    const hmac = createHmac('sha256', secret);
    hmac.update(toSign);

    return `v1=${hmac.digest('hex')}`;
  }

  /** Make an assertion, if not `true`, then throw. */
  private assert(expr: unknown, msg = ''): asserts expr {
    if (!expr) {
      throw new Error(msg);
    }
  }

  /** Compare to array buffers or data views in a way that timing based attacks
   * cannot gain information about the platform. */
  private timingSafeEqual(
    a: ArrayBufferView | ArrayBufferLike | DataView,
    b: ArrayBufferView | ArrayBufferLike | DataView,
  ): boolean {
    if (a.byteLength !== b.byteLength) {
      return false;
    }
    if (!(a instanceof DataView)) {
      a = new DataView(ArrayBuffer.isView(a) ? a.buffer : a);
    }
    if (!(b instanceof DataView)) {
      b = new DataView(ArrayBuffer.isView(b) ? b.buffer : b);
    }
    this.assert(a instanceof DataView);
    this.assert(b instanceof DataView);
    const length = a.byteLength;
    let out = 0;
    let i = -1;
    while (++i < length) {
      out |= a.getUint8(i) ^ b.getUint8(i);
    }
    return out === 0;
  }

  /**
   * Validates whether or not the webhook payload was sent by Orb.
   *
   * An error will be raised if the webhook payload was not sent by Orb.
   */
  verifySignature(
    body: string,
    headers: HeadersLike,
    secret: string | undefined | null = this._client.webhookSecret,
  ): void {
    const whsecret = this.parseSecret(secret);

    const msgTimestamp = getRequiredHeader(headers, 'X-Orb-Timestamp');
    const msgSignature = getRequiredHeader(headers, 'X-Orb-Signature');

    const nowSeconds = Math.floor(Date.now() / 1000);
    // The timestamp header does not include a timezone (it is UTC by default)
    const timezoneSuffix = msgTimestamp.includes('Z') || msgTimestamp.includes('+') ? '' : 'Z';
    const timestamp = new Date(msgTimestamp + timezoneSuffix);
    const timestampSeconds = Math.floor(timestamp.getTime() / 1000);
    if (isNaN(timestampSeconds)) {
      throw new Error('Invalid timestamp header');
    }

    const webhookToleranceInSeconds = 5 * 60; // 5 minutes
    if (nowSeconds - timestampSeconds > webhookToleranceInSeconds) {
      throw new Error('Webhook timestamp is too old');
    }

    if (timestampSeconds > nowSeconds + webhookToleranceInSeconds) {
      console.warn({ timestampSeconds, nowSeconds, webhookToleranceInSeconds });
      throw new Error('Webhook timestamp is too new');
    }

    if (typeof body !== 'string') {
      throw new Error(
        'Webhook body must be passed as the raw JSON string sent from the server (do not parse it first).',
      );
    }

    const computedSignature = this.signPayload(body, { timestamp: msgTimestamp, secret: whsecret });
    const expectedSignature = computedSignature.split('=')[1];

    const passedSignatures = msgSignature.split(' ');

    const encoder = new globalThis.TextEncoder();
    for (const versionedSignature of passedSignatures) {
      const [version, signature] = versionedSignature.split('=');
      loggerFor(this._client).debug('verifySignature', {
        version,
        signature,
        expectedSignature,
        computedSignature,
      });

      if (version !== 'v1') {
        continue;
      }

      if (this.timingSafeEqual(encoder.encode(signature), encoder.encode(expectedSignature))) {
        // valid!
        return;
      }
    }

    throw new Error('None of the given webhook signatures match the expected signature');
  }
}

/**
 * Issued when a backfill is closed and its events are reflected into usage.
 */
export interface BackfillReflectedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * A backfill represents an update to historical usage data, adding or replacing
   * events in a timeframe.
   */
  backfill: BackfillReflectedWebhookEvent.Backfill;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: unknown;

  /**
   * The event this payload describes.
   */
  type: 'backfill.reflected';
}

export namespace BackfillReflectedWebhookEvent {
  /**
   * A backfill represents an update to historical usage data, adding or replacing
   * events in a timeframe.
   */
  export interface Backfill {
    id: string;

    /**
     * If in the future, the time at which the backfill will automatically close. If in
     * the past, the time at which the backfill was closed.
     */
    close_time: string | null;

    created_at: string;

    /**
     * The Orb-generated ID of the customer to which this backfill is scoped. If
     * `null`, this backfill is scoped to all customers.
     */
    customer_id: string | null;

    /**
     * The number of events ingested in this backfill.
     */
    events_ingested: number;

    /**
     * If `true`, existing events in the backfill's timeframe will be replaced with the
     * newly ingested events associated with the backfill. If `false`, newly ingested
     * events will be added to the existing events.
     */
    replace_existing_events: boolean;

    /**
     * The time at which this backfill was reverted.
     */
    reverted_at: string | null;

    /**
     * The status of the backfill.
     */
    status: 'pending' | 'reflected' | 'pending_revert' | 'reverted';

    timeframe_end: string;

    timeframe_start: string;

    /**
     * A boolean
     * [computed property](/extensibility/advanced-metrics#computed-properties) used to
     * filter the set of events to deprecate
     */
    deprecation_filter?: string | null;
  }
}

/**
 * Issued when a backfill is reverted, removing its events from usage.
 */
export interface BackfillRevertedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * A backfill represents an update to historical usage data, adding or replacing
   * events in a timeframe.
   */
  backfill: BackfillRevertedWebhookEvent.Backfill;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: unknown;

  /**
   * The event this payload describes.
   */
  type: 'backfill.reverted';
}

export namespace BackfillRevertedWebhookEvent {
  /**
   * A backfill represents an update to historical usage data, adding or replacing
   * events in a timeframe.
   */
  export interface Backfill {
    id: string;

    /**
     * If in the future, the time at which the backfill will automatically close. If in
     * the past, the time at which the backfill was closed.
     */
    close_time: string | null;

    created_at: string;

    /**
     * The Orb-generated ID of the customer to which this backfill is scoped. If
     * `null`, this backfill is scoped to all customers.
     */
    customer_id: string | null;

    /**
     * The number of events ingested in this backfill.
     */
    events_ingested: number;

    /**
     * If `true`, existing events in the backfill's timeframe will be replaced with the
     * newly ingested events associated with the backfill. If `false`, newly ingested
     * events will be added to the existing events.
     */
    replace_existing_events: boolean;

    /**
     * The time at which this backfill was reverted.
     */
    reverted_at: string | null;

    /**
     * The status of the backfill.
     */
    status: 'pending' | 'reflected' | 'pending_revert' | 'reverted';

    timeframe_end: string;

    timeframe_start: string;

    /**
     * A boolean
     * [computed property](/extensibility/advanced-metrics#computed-properties) used to
     * filter the set of events to deprecate
     */
    deprecation_filter?: string | null;
  }
}

/**
 * Issued when a billable metric is edited.
 */
export interface BillableMetricEditedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The Metric resource represents a calculation of a quantity based on events.
   * Metrics are defined by the query that transforms raw usage events into
   * meaningful values for your customers.
   */
  billable_metric: MetricsAPI.BillableMetric;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: BillableMetricEditedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'billable_metric.edited';
}

export namespace BillableMetricEditedWebhookEvent {
  export interface Properties {
    /**
     * metadata values are non-null on the wire, as on the price event.
     */
    previous_attributes: Properties.PreviousAttributes;
  }

  export namespace Properties {
    /**
     * metadata values are non-null on the wire, as on the price event.
     */
    export interface PreviousAttributes {
      description?: string | null;

      metadata?: { [key: string]: string } | null;

      name?: string | null;
    }
  }
}

/**
 * Issued when a credit block accounting sync fails.
 */
export interface CreditBlockAccountingSyncFailedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  accounting_sync_record: CreditBlockAccountingSyncFailedWebhookEvent.AccountingSyncRecord;

  /**
   * The Credit Block resource models prepaid credits within Orb.
   */
  block: CreditBlockAccountingSyncFailedWebhookEvent.Block;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: CreditBlockAccountingSyncFailedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'credit_block.accounting_sync_failed';
}

export namespace CreditBlockAccountingSyncFailedWebhookEvent {
  export interface AccountingSyncRecord {
    id: string;

    customer_id: string;

    record_type:
      | 'customer'
      | 'invoice'
      | 'transaction'
      | 'customer_balance_transaction'
      | 'credit_note'
      | 'subscription'
      | 'sales_order'
      | 'block';

    block_id?: string | null;

    error_details?: { [key: string]: unknown } | null;

    invoice_id?: string | null;

    provider_customer_id?: string | null;

    status?: string | null;

    sync_action?: string | null;
  }

  /**
   * The Credit Block resource models prepaid credits within Orb.
   */
  export interface Block {
    id: string;

    balance: string;

    /**
     * How this credit block was created: `allocation` (a subscription's recurring
     * credit allocation), `top_up` (an automatic balance-threshold top-up),
     * `commitment` (a subscription commitment true-up rolled forward as credit), or
     * `manual` (a manual credit ledger increment, including credits voided or expired
     * off another block).
     */
    credit_block_source: 'allocation' | 'top_up' | 'commitment' | 'manual';

    effective_date: string | null;

    expiry_date: string | null;

    filters: Array<Block.Filter>;

    maximum_initial_balance: string | null;

    /**
     * User specified key-value pairs for the resource. If not present, this defaults
     * to an empty dictionary. Individual keys can be removed by setting the value to
     * `null`, and the entire metadata mapping can be cleared by setting `metadata` to
     * `null`.
     */
    metadata: { [key: string]: string };

    per_unit_cost_basis: string | null;

    status: 'active' | 'pending_payment';

    /**
     * The credit allocation that funded a block. Extends the allocation resource
     * serialized on prices with the catalog-item attribution of the funding price.
     */
    credit_allocation?: Block.CreditAllocation | null;

    /**
     * The subscription commitment whose true-up rolled forward into this credit block.
     * Present only when `credit_block_source` is `commitment`.
     */
    credit_commitment?: Block.CreditCommitment | null;
  }

  export namespace Block {
    export interface Filter {
      /**
       * The property of the price to filter on.
       */
      field: 'price_id' | 'item_id' | 'price_type' | 'currency' | 'pricing_unit_id';

      /**
       * Should prices that match the filter be included or excluded.
       */
      operator: 'includes' | 'excludes';

      /**
       * The IDs or values that match this filter.
       */
      values: Array<string>;
    }

    /**
     * The credit allocation that funded a block. Extends the allocation resource
     * serialized on prices with the catalog-item attribution of the funding price.
     */
    export interface CreditAllocation {
      allows_rollover: boolean;

      currency: string;

      custom_expiration: Shared.CustomExpiration | null;

      /**
       * The ID of the catalog item this block was allocated from, derived from the
       * allocation's price.
       */
      item_id: string;

      filters?: Array<CreditAllocation.Filter>;

      license_type_id?: string | null;
    }

    export namespace CreditAllocation {
      export interface Filter {
        /**
         * The property of the price to filter on.
         */
        field: 'price_id' | 'item_id' | 'price_type' | 'currency' | 'pricing_unit_id';

        /**
         * Should prices that match the filter be included or excluded.
         */
        operator: 'includes' | 'excludes';

        /**
         * The IDs or values that match this filter.
         */
        values: Array<string>;
      }
    }

    /**
     * The subscription commitment whose true-up rolled forward into this credit block.
     * Present only when `credit_block_source` is `commitment`.
     */
    export interface CreditCommitment {
      /**
       * The ID of the subscription commitment this block was rolled forward from.
       */
      id: string;

      /**
       * The subscription the commitment belongs to.
       */
      subscription_id?: string | null;
    }
  }

  export interface Properties {
    connection_type: string;

    failure_reason: string;
  }
}

/**
 * Issued when a credit block accounting sync succeeds.
 */
export interface CreditBlockAccountingSyncSucceededWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  accounting_sync_record: CreditBlockAccountingSyncSucceededWebhookEvent.AccountingSyncRecord;

  /**
   * The Credit Block resource models prepaid credits within Orb.
   */
  block: CreditBlockAccountingSyncSucceededWebhookEvent.Block;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: CreditBlockAccountingSyncSucceededWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'credit_block.accounting_sync_succeeded';
}

export namespace CreditBlockAccountingSyncSucceededWebhookEvent {
  export interface AccountingSyncRecord {
    id: string;

    customer_id: string;

    record_type:
      | 'customer'
      | 'invoice'
      | 'transaction'
      | 'customer_balance_transaction'
      | 'credit_note'
      | 'subscription'
      | 'sales_order'
      | 'block';

    block_id?: string | null;

    error_details?: { [key: string]: unknown } | null;

    invoice_id?: string | null;

    provider_customer_id?: string | null;

    status?: string | null;

    sync_action?: string | null;
  }

  /**
   * The Credit Block resource models prepaid credits within Orb.
   */
  export interface Block {
    id: string;

    balance: string;

    /**
     * How this credit block was created: `allocation` (a subscription's recurring
     * credit allocation), `top_up` (an automatic balance-threshold top-up),
     * `commitment` (a subscription commitment true-up rolled forward as credit), or
     * `manual` (a manual credit ledger increment, including credits voided or expired
     * off another block).
     */
    credit_block_source: 'allocation' | 'top_up' | 'commitment' | 'manual';

    effective_date: string | null;

    expiry_date: string | null;

    filters: Array<Block.Filter>;

    maximum_initial_balance: string | null;

    /**
     * User specified key-value pairs for the resource. If not present, this defaults
     * to an empty dictionary. Individual keys can be removed by setting the value to
     * `null`, and the entire metadata mapping can be cleared by setting `metadata` to
     * `null`.
     */
    metadata: { [key: string]: string };

    per_unit_cost_basis: string | null;

    status: 'active' | 'pending_payment';

    /**
     * The credit allocation that funded a block. Extends the allocation resource
     * serialized on prices with the catalog-item attribution of the funding price.
     */
    credit_allocation?: Block.CreditAllocation | null;

    /**
     * The subscription commitment whose true-up rolled forward into this credit block.
     * Present only when `credit_block_source` is `commitment`.
     */
    credit_commitment?: Block.CreditCommitment | null;
  }

  export namespace Block {
    export interface Filter {
      /**
       * The property of the price to filter on.
       */
      field: 'price_id' | 'item_id' | 'price_type' | 'currency' | 'pricing_unit_id';

      /**
       * Should prices that match the filter be included or excluded.
       */
      operator: 'includes' | 'excludes';

      /**
       * The IDs or values that match this filter.
       */
      values: Array<string>;
    }

    /**
     * The credit allocation that funded a block. Extends the allocation resource
     * serialized on prices with the catalog-item attribution of the funding price.
     */
    export interface CreditAllocation {
      allows_rollover: boolean;

      currency: string;

      custom_expiration: Shared.CustomExpiration | null;

      /**
       * The ID of the catalog item this block was allocated from, derived from the
       * allocation's price.
       */
      item_id: string;

      filters?: Array<CreditAllocation.Filter>;

      license_type_id?: string | null;
    }

    export namespace CreditAllocation {
      export interface Filter {
        /**
         * The property of the price to filter on.
         */
        field: 'price_id' | 'item_id' | 'price_type' | 'currency' | 'pricing_unit_id';

        /**
         * Should prices that match the filter be included or excluded.
         */
        operator: 'includes' | 'excludes';

        /**
         * The IDs or values that match this filter.
         */
        values: Array<string>;
      }
    }

    /**
     * The subscription commitment whose true-up rolled forward into this credit block.
     * Present only when `credit_block_source` is `commitment`.
     */
    export interface CreditCommitment {
      /**
       * The ID of the subscription commitment this block was rolled forward from.
       */
      id: string;

      /**
       * The subscription the commitment belongs to.
       */
      subscription_id?: string | null;
    }
  }

  export interface Properties {
    connection_type: string;
  }
}

/**
 * Issued when a credit note accounting sync fails.
 */
export interface CreditNoteAccountingSyncFailedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  accounting_sync_record: CreditNoteAccountingSyncFailedWebhookEvent.AccountingSyncRecord;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * The [Credit Note](/invoicing/credit-notes) resource represents a credit that has
   * been applied to a particular invoice.
   */
  credit_note: Shared.CreditNote;

  properties: CreditNoteAccountingSyncFailedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'credit_note.accounting_sync_failed';
}

export namespace CreditNoteAccountingSyncFailedWebhookEvent {
  export interface AccountingSyncRecord {
    id: string;

    customer_id: string;

    record_type:
      | 'customer'
      | 'invoice'
      | 'transaction'
      | 'customer_balance_transaction'
      | 'credit_note'
      | 'subscription'
      | 'sales_order'
      | 'block';

    credit_note_id?: string | null;

    error_details?: { [key: string]: unknown } | null;

    provider_customer_id?: string | null;

    status?: string | null;

    sync_action?: string | null;
  }

  export interface Properties {
    connection_type: string;

    failure_reason: string;
  }
}

/**
 * Issued when a credit note accounting sync succeeds.
 */
export interface CreditNoteAccountingSyncSucceededWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  accounting_sync_record: CreditNoteAccountingSyncSucceededWebhookEvent.AccountingSyncRecord;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * The [Credit Note](/invoicing/credit-notes) resource represents a credit that has
   * been applied to a particular invoice.
   */
  credit_note: Shared.CreditNote;

  properties: CreditNoteAccountingSyncSucceededWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'credit_note.accounting_sync_succeeded';
}

export namespace CreditNoteAccountingSyncSucceededWebhookEvent {
  export interface AccountingSyncRecord {
    id: string;

    customer_id: string;

    record_type:
      | 'customer'
      | 'invoice'
      | 'transaction'
      | 'customer_balance_transaction'
      | 'credit_note'
      | 'subscription'
      | 'sales_order'
      | 'block';

    credit_note_id?: string | null;

    error_details?: { [key: string]: unknown } | null;

    provider_customer_id?: string | null;

    status?: string | null;

    sync_action?: string | null;
  }

  export interface Properties {
    connection_type: string;
  }
}

/**
 * Issued when a credit note is created.
 */
export interface CreditNoteIssuedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * The [Credit Note](/invoicing/credit-notes) resource represents a credit that has
   * been applied to a particular invoice.
   */
  credit_note: Shared.CreditNote;

  properties: unknown;

  /**
   * The event this payload describes.
   */
  type: 'credit_note.issued';
}

/**
 * Issued when a credit note is marked as void.
 */
export interface CreditNoteMarkedAsVoidWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * The [Credit Note](/invoicing/credit-notes) resource represents a credit that has
   * been applied to a particular invoice.
   */
  credit_note: Shared.CreditNote;

  properties: unknown;

  /**
   * The event this payload describes.
   */
  type: 'credit_note.marked_as_void';
}

/**
 * Issued when a customer accounting sync fails.
 */
export interface CustomerAccountingSyncFailedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  accounting_sync_record: CustomerAccountingSyncFailedWebhookEvent.AccountingSyncRecord;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * A customer is a buyer of your products, and the other party to the billing
   * relationship.
   *
   * In Orb, customers are assigned system generated identifiers automatically, but
   * it's often desirable to have these match existing identifiers in your system. To
   * avoid having to denormalize Orb ID information, you can pass in an
   * `external_customer_id` with your own identifier. See
   * [Customer ID Aliases](/events-and-metrics/customer-aliases) for further
   * information about how these aliases work in Orb.
   *
   * In addition to having an identifier in your system, a customer may exist in a
   * payment provider solution like Stripe. Use the `payment_provider_id` and the
   * `payment_provider` enum field to express this mapping.
   *
   * A customer also has a timezone (from the standard
   * [IANA timezone database](https://www.iana.org/time-zones)), which defaults to
   * your account's timezone. See [Timezone localization](/essentials/timezones) for
   * information on what this timezone parameter influences within Orb.
   */
  customer: CustomersAPI.Customer;

  properties: CustomerAccountingSyncFailedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'customer.accounting_sync_failed';
}

export namespace CustomerAccountingSyncFailedWebhookEvent {
  export interface AccountingSyncRecord {
    id: string;

    customer_id: string;

    record_type:
      | 'customer'
      | 'invoice'
      | 'transaction'
      | 'customer_balance_transaction'
      | 'credit_note'
      | 'subscription'
      | 'sales_order'
      | 'block';

    error_details?: { [key: string]: unknown } | null;

    provider_customer_id?: string | null;

    status?: string | null;

    sync_action?: string | null;
  }

  export interface Properties {
    connection_type: string;

    failure_reason: string;
  }
}

/**
 * Issued when a customer accounting sync succeeds.
 */
export interface CustomerAccountingSyncSucceededWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  accounting_sync_record: CustomerAccountingSyncSucceededWebhookEvent.AccountingSyncRecord;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * A customer is a buyer of your products, and the other party to the billing
   * relationship.
   *
   * In Orb, customers are assigned system generated identifiers automatically, but
   * it's often desirable to have these match existing identifiers in your system. To
   * avoid having to denormalize Orb ID information, you can pass in an
   * `external_customer_id` with your own identifier. See
   * [Customer ID Aliases](/events-and-metrics/customer-aliases) for further
   * information about how these aliases work in Orb.
   *
   * In addition to having an identifier in your system, a customer may exist in a
   * payment provider solution like Stripe. Use the `payment_provider_id` and the
   * `payment_provider` enum field to express this mapping.
   *
   * A customer also has a timezone (from the standard
   * [IANA timezone database](https://www.iana.org/time-zones)), which defaults to
   * your account's timezone. See [Timezone localization](/essentials/timezones) for
   * information on what this timezone parameter influences within Orb.
   */
  customer: CustomersAPI.Customer;

  properties: CustomerAccountingSyncSucceededWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'customer.accounting_sync_succeeded';
}

export namespace CustomerAccountingSyncSucceededWebhookEvent {
  export interface AccountingSyncRecord {
    id: string;

    customer_id: string;

    record_type:
      | 'customer'
      | 'invoice'
      | 'transaction'
      | 'customer_balance_transaction'
      | 'credit_note'
      | 'subscription'
      | 'sales_order'
      | 'block';

    error_details?: { [key: string]: unknown } | null;

    provider_customer_id?: string | null;

    status?: string | null;

    sync_action?: string | null;
  }

  export interface Properties {
    connection_type: string;
  }
}

/**
 * Issued when a customer balance transaction is created.
 */
export interface CustomerBalanceTransactionCreatedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * A customer is a buyer of your products, and the other party to the billing
   * relationship.
   *
   * In Orb, customers are assigned system generated identifiers automatically, but
   * it's often desirable to have these match existing identifiers in your system. To
   * avoid having to denormalize Orb ID information, you can pass in an
   * `external_customer_id` with your own identifier. See
   * [Customer ID Aliases](/events-and-metrics/customer-aliases) for further
   * information about how these aliases work in Orb.
   *
   * In addition to having an identifier in your system, a customer may exist in a
   * payment provider solution like Stripe. Use the `payment_provider_id` and the
   * `payment_provider` enum field to express this mapping.
   *
   * A customer also has a timezone (from the standard
   * [IANA timezone database](https://www.iana.org/time-zones)), which defaults to
   * your account's timezone. See [Timezone localization](/essentials/timezones) for
   * information on what this timezone parameter influences within Orb.
   */
  customer: CustomersAPI.Customer;

  properties: CustomerBalanceTransactionCreatedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'customer.balance_transaction_created';
}

export namespace CustomerBalanceTransactionCreatedWebhookEvent {
  export interface Properties {
    balance_transaction: Properties.BalanceTransaction;
  }

  export namespace Properties {
    export interface BalanceTransaction {
      /**
       * A unique id for this transaction.
       */
      id: string;

      action:
        | 'applied_to_invoice'
        | 'manual_adjustment'
        | 'prorated_refund'
        | 'revert_prorated_refund'
        | 'return_from_voiding'
        | 'credit_note_applied'
        | 'credit_note_voided'
        | 'overpayment_refund'
        | 'external_payment'
        | 'small_invoice_carryover'
        | 'prepaid_commit_cancel';

      /**
       * The value of the amount changed in the transaction.
       */
      amount: string;

      /**
       * The creation time of this transaction.
       */
      created_at: string;

      credit_note: Shared.CreditNoteTiny | null;

      /**
       * An optional description provided for manual customer balance adjustments.
       */
      description: string | null;

      /**
       * The new value of the customer's balance prior to the transaction, in the
       * customer's currency.
       */
      ending_balance: string;

      invoice: Shared.InvoiceTiny | null;

      /**
       * The original value of the customer's balance prior to the transaction, in the
       * customer's currency.
       */
      starting_balance: string;

      type: 'increment' | 'decrement';
    }
  }
}

/**
 * Issued when a customer resource is created.
 */
export interface CustomerCreatedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * A customer is a buyer of your products, and the other party to the billing
   * relationship.
   *
   * In Orb, customers are assigned system generated identifiers automatically, but
   * it's often desirable to have these match existing identifiers in your system. To
   * avoid having to denormalize Orb ID information, you can pass in an
   * `external_customer_id` with your own identifier. See
   * [Customer ID Aliases](/events-and-metrics/customer-aliases) for further
   * information about how these aliases work in Orb.
   *
   * In addition to having an identifier in your system, a customer may exist in a
   * payment provider solution like Stripe. Use the `payment_provider_id` and the
   * `payment_provider` enum field to express this mapping.
   *
   * A customer also has a timezone (from the standard
   * [IANA timezone database](https://www.iana.org/time-zones)), which defaults to
   * your account's timezone. See [Timezone localization](/essentials/timezones) for
   * information on what this timezone parameter influences within Orb.
   */
  customer: CustomersAPI.Customer;

  properties: unknown;

  /**
   * The event this payload describes.
   */
  type: 'customer.created';
}

/**
 * Issued when a customer's prepaid credits balance is depleted.
 */
export interface CustomerCreditBalanceDepletedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * A customer is a buyer of your products, and the other party to the billing
   * relationship.
   *
   * In Orb, customers are assigned system generated identifiers automatically, but
   * it's often desirable to have these match existing identifiers in your system. To
   * avoid having to denormalize Orb ID information, you can pass in an
   * `external_customer_id` with your own identifier. See
   * [Customer ID Aliases](/events-and-metrics/customer-aliases) for further
   * information about how these aliases work in Orb.
   *
   * In addition to having an identifier in your system, a customer may exist in a
   * payment provider solution like Stripe. Use the `payment_provider_id` and the
   * `payment_provider` enum field to express this mapping.
   *
   * A customer also has a timezone (from the standard
   * [IANA timezone database](https://www.iana.org/time-zones)), which defaults to
   * your account's timezone. See [Timezone localization](/essentials/timezones) for
   * information on what this timezone parameter influences within Orb.
   */
  customer: CustomersAPI.Customer;

  properties: CustomerCreditBalanceDepletedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'customer.credit_balance_depleted';
}

export namespace CustomerCreditBalanceDepletedWebhookEvent {
  export interface Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    alert_configuration: Properties.AlertConfiguration;

    /**
     * A currency or custom credit unit, as embedded in webhook payloads.
     */
    pricing_unit: Properties.PricingUnit | null;
  }

  export namespace Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    export interface AlertConfiguration {
      /**
       * Also referred to as alert_id in this documentation.
       */
      id: string;

      /**
       * The creation time of the resource in Orb.
       */
      created_at: string;

      /**
       * The name of the currency the credit balance or invoice cost is denominated in.
       */
      currency: string | null;

      /**
       * The customer the alert applies to.
       */
      customer: Shared.CustomerMinified | null;

      /**
       * Whether the alert is enabled or disabled.
       */
      enabled: boolean;

      /**
       * The metric the alert applies to.
       */
      metric: AlertConfiguration.Metric | null;

      /**
       * The plan the alert applies to.
       */
      plan: AlertConfiguration.Plan | null;

      /**
       * The subscription the alert applies to.
       */
      subscription: Shared.SubscriptionMinified | null;

      /**
       * The thresholds that define the conditions under which the alert will be
       * triggered.
       */
      thresholds: Array<AlertConfiguration.Threshold> | null;

      /**
       * The type of alert. This must be a valid alert type.
       */
      type:
        | 'credit_balance_depleted'
        | 'credit_balance_dropped'
        | 'credit_balance_recovered'
        | 'usage_exceeded'
        | 'cost_exceeded'
        | 'spend_exceeded'
        | 'license_balance_threshold_reached';

      /**
       * The current status of the alert. This field is only present for credit balance
       * alerts.
       */
      balance_alert_status?: Array<AlertConfiguration.BalanceAlertStatus> | null;

      /**
       * The property keys to group cost alerts by. Only present for cost alerts with
       * grouping enabled.
       */
      grouping_keys?: Array<string> | null;

      /**
       * Minified license type for alert serialization.
       */
      license_type?: AlertConfiguration.LicenseType | null;

      /**
       * Filters scoping which prices are included in spend and grouped cost alert
       * evaluation. Alerts use the price_id, item_id, and price_type fields only; the
       * alert's pricing unit is reported by currency.
       */
      price_filters?: Array<AlertConfiguration.PriceFilter> | null;

      /**
       * Per-group threshold overrides. Each override maps a specific combination of
       * grouping_keys values to a replacement threshold list. Only present for grouped
       * cost alerts that have at least one override.
       */
      threshold_overrides?: Array<AlertConfiguration.ThresholdOverride> | null;
    }

    export namespace AlertConfiguration {
      /**
       * The metric the alert applies to.
       */
      export interface Metric {
        id: string;
      }

      /**
       * The plan the alert applies to.
       */
      export interface Plan {
        id: string | null;

        /**
         * An optional user-defined ID for this plan resource, used throughout the system
         * as an alias for this Plan. Use this field to identify a plan by an existing
         * identifier in your system.
         */
        external_plan_id: string | null;

        name: string | null;

        plan_version: string;
      }

      /**
       * Thresholds are used to define the conditions under which an alert will be
       * triggered.
       */
      export interface Threshold {
        /**
         * The value at which an alert will fire. For credit balance alerts, the alert will
         * fire at or below this value. For usage and cost alerts, the alert will fire at
         * or above this value.
         */
        value: string;
      }

      /**
       * Alert status is used to determine if an alert is currently in-alert or not.
       */
      export interface BalanceAlertStatus {
        /**
         * Whether the alert is currently in-alert or not.
         */
        in_alert: boolean;

        /**
         * The value of the threshold that defines the alert status.
         */
        threshold_value: string;
      }

      /**
       * Minified license type for alert serialization.
       */
      export interface LicenseType {
        id: string;
      }

      export interface PriceFilter {
        /**
         * The property of the price to filter on.
         */
        field: 'price_id' | 'item_id' | 'price_type' | 'currency' | 'pricing_unit_id';

        /**
         * Should prices that match the filter be included or excluded.
         */
        operator: 'includes' | 'excludes';

        /**
         * The IDs or values that match this filter.
         */
        values: Array<string>;
      }

      /**
       * A per-group threshold override on a grouped cost alert.
       *
       * An empty `thresholds` list means the group is silenced (never fires). A
       * non-empty list fully replaces the default thresholds for that group.
       */
      export interface ThresholdOverride {
        /**
         * The values identifying this group, ordered to match group_keys when set and the
         * alert's grouping_keys otherwise.
         */
        group_values: Array<string>;

        /**
         * The thresholds applied to this group. An empty list means the group is silenced.
         */
        thresholds: Array<ThresholdOverride.Threshold>;

        /**
         * The subset of the alert's grouping_keys this override binds. Null when the
         * override targets one exact group across every grouping key.
         */
        group_keys?: Array<string> | null;
      }

      export namespace ThresholdOverride {
        /**
         * Thresholds are used to define the conditions under which an alert will be
         * triggered.
         */
        export interface Threshold {
          /**
           * The value at which an alert will fire. For credit balance alerts, the alert will
           * fire at or below this value. For usage and cost alerts, the alert will fire at
           * or above this value.
           */
          value: string;
        }
      }
    }

    /**
     * A currency or custom credit unit, as embedded in webhook payloads.
     */
    export interface PricingUnit {
      id: string;

      display_name: string | null;

      name: string;

      symbol: string | null;
    }
  }
}

/**
 * Issued when a customer's prepaid credits balance is depleted to a configured
 * threshold.
 */
export interface CustomerCreditBalanceDroppedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * A customer is a buyer of your products, and the other party to the billing
   * relationship.
   *
   * In Orb, customers are assigned system generated identifiers automatically, but
   * it's often desirable to have these match existing identifiers in your system. To
   * avoid having to denormalize Orb ID information, you can pass in an
   * `external_customer_id` with your own identifier. See
   * [Customer ID Aliases](/events-and-metrics/customer-aliases) for further
   * information about how these aliases work in Orb.
   *
   * In addition to having an identifier in your system, a customer may exist in a
   * payment provider solution like Stripe. Use the `payment_provider_id` and the
   * `payment_provider` enum field to express this mapping.
   *
   * A customer also has a timezone (from the standard
   * [IANA timezone database](https://www.iana.org/time-zones)), which defaults to
   * your account's timezone. See [Timezone localization](/essentials/timezones) for
   * information on what this timezone parameter influences within Orb.
   */
  customer: CustomersAPI.Customer;

  properties: CustomerCreditBalanceDroppedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'customer.credit_balance_dropped';
}

export namespace CustomerCreditBalanceDroppedWebhookEvent {
  export interface Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    alert_configuration: Properties.AlertConfiguration;

    balance_threshold: string;

    /**
     * A currency or custom credit unit, as embedded in webhook payloads.
     */
    pricing_unit: Properties.PricingUnit | null;
  }

  export namespace Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    export interface AlertConfiguration {
      /**
       * Also referred to as alert_id in this documentation.
       */
      id: string;

      /**
       * The creation time of the resource in Orb.
       */
      created_at: string;

      /**
       * The name of the currency the credit balance or invoice cost is denominated in.
       */
      currency: string | null;

      /**
       * The customer the alert applies to.
       */
      customer: Shared.CustomerMinified | null;

      /**
       * Whether the alert is enabled or disabled.
       */
      enabled: boolean;

      /**
       * The metric the alert applies to.
       */
      metric: AlertConfiguration.Metric | null;

      /**
       * The plan the alert applies to.
       */
      plan: AlertConfiguration.Plan | null;

      /**
       * The subscription the alert applies to.
       */
      subscription: Shared.SubscriptionMinified | null;

      /**
       * The thresholds that define the conditions under which the alert will be
       * triggered.
       */
      thresholds: Array<AlertConfiguration.Threshold> | null;

      /**
       * The type of alert. This must be a valid alert type.
       */
      type:
        | 'credit_balance_depleted'
        | 'credit_balance_dropped'
        | 'credit_balance_recovered'
        | 'usage_exceeded'
        | 'cost_exceeded'
        | 'spend_exceeded'
        | 'license_balance_threshold_reached';

      /**
       * The current status of the alert. This field is only present for credit balance
       * alerts.
       */
      balance_alert_status?: Array<AlertConfiguration.BalanceAlertStatus> | null;

      /**
       * The property keys to group cost alerts by. Only present for cost alerts with
       * grouping enabled.
       */
      grouping_keys?: Array<string> | null;

      /**
       * Minified license type for alert serialization.
       */
      license_type?: AlertConfiguration.LicenseType | null;

      /**
       * Filters scoping which prices are included in spend and grouped cost alert
       * evaluation. Alerts use the price_id, item_id, and price_type fields only; the
       * alert's pricing unit is reported by currency.
       */
      price_filters?: Array<AlertConfiguration.PriceFilter> | null;

      /**
       * Per-group threshold overrides. Each override maps a specific combination of
       * grouping_keys values to a replacement threshold list. Only present for grouped
       * cost alerts that have at least one override.
       */
      threshold_overrides?: Array<AlertConfiguration.ThresholdOverride> | null;
    }

    export namespace AlertConfiguration {
      /**
       * The metric the alert applies to.
       */
      export interface Metric {
        id: string;
      }

      /**
       * The plan the alert applies to.
       */
      export interface Plan {
        id: string | null;

        /**
         * An optional user-defined ID for this plan resource, used throughout the system
         * as an alias for this Plan. Use this field to identify a plan by an existing
         * identifier in your system.
         */
        external_plan_id: string | null;

        name: string | null;

        plan_version: string;
      }

      /**
       * Thresholds are used to define the conditions under which an alert will be
       * triggered.
       */
      export interface Threshold {
        /**
         * The value at which an alert will fire. For credit balance alerts, the alert will
         * fire at or below this value. For usage and cost alerts, the alert will fire at
         * or above this value.
         */
        value: string;
      }

      /**
       * Alert status is used to determine if an alert is currently in-alert or not.
       */
      export interface BalanceAlertStatus {
        /**
         * Whether the alert is currently in-alert or not.
         */
        in_alert: boolean;

        /**
         * The value of the threshold that defines the alert status.
         */
        threshold_value: string;
      }

      /**
       * Minified license type for alert serialization.
       */
      export interface LicenseType {
        id: string;
      }

      export interface PriceFilter {
        /**
         * The property of the price to filter on.
         */
        field: 'price_id' | 'item_id' | 'price_type' | 'currency' | 'pricing_unit_id';

        /**
         * Should prices that match the filter be included or excluded.
         */
        operator: 'includes' | 'excludes';

        /**
         * The IDs or values that match this filter.
         */
        values: Array<string>;
      }

      /**
       * A per-group threshold override on a grouped cost alert.
       *
       * An empty `thresholds` list means the group is silenced (never fires). A
       * non-empty list fully replaces the default thresholds for that group.
       */
      export interface ThresholdOverride {
        /**
         * The values identifying this group, ordered to match group_keys when set and the
         * alert's grouping_keys otherwise.
         */
        group_values: Array<string>;

        /**
         * The thresholds applied to this group. An empty list means the group is silenced.
         */
        thresholds: Array<ThresholdOverride.Threshold>;

        /**
         * The subset of the alert's grouping_keys this override binds. Null when the
         * override targets one exact group across every grouping key.
         */
        group_keys?: Array<string> | null;
      }

      export namespace ThresholdOverride {
        /**
         * Thresholds are used to define the conditions under which an alert will be
         * triggered.
         */
        export interface Threshold {
          /**
           * The value at which an alert will fire. For credit balance alerts, the alert will
           * fire at or below this value. For usage and cost alerts, the alert will fire at
           * or above this value.
           */
          value: string;
        }
      }
    }

    /**
     * A currency or custom credit unit, as embedded in webhook payloads.
     */
    export interface PricingUnit {
      id: string;

      display_name: string | null;

      name: string;

      symbol: string | null;
    }
  }
}

/**
 * Issued when a customer's credit balance recovers from depleted.
 */
export interface CustomerCreditBalanceRecoveredWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * A customer is a buyer of your products, and the other party to the billing
   * relationship.
   *
   * In Orb, customers are assigned system generated identifiers automatically, but
   * it's often desirable to have these match existing identifiers in your system. To
   * avoid having to denormalize Orb ID information, you can pass in an
   * `external_customer_id` with your own identifier. See
   * [Customer ID Aliases](/events-and-metrics/customer-aliases) for further
   * information about how these aliases work in Orb.
   *
   * In addition to having an identifier in your system, a customer may exist in a
   * payment provider solution like Stripe. Use the `payment_provider_id` and the
   * `payment_provider` enum field to express this mapping.
   *
   * A customer also has a timezone (from the standard
   * [IANA timezone database](https://www.iana.org/time-zones)), which defaults to
   * your account's timezone. See [Timezone localization](/essentials/timezones) for
   * information on what this timezone parameter influences within Orb.
   */
  customer: CustomersAPI.Customer;

  properties: CustomerCreditBalanceRecoveredWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'customer.credit_balance_recovered';
}

export namespace CustomerCreditBalanceRecoveredWebhookEvent {
  export interface Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    alert_configuration: Properties.AlertConfiguration;

    /**
     * A currency or custom credit unit, as embedded in webhook payloads.
     */
    pricing_unit: Properties.PricingUnit | null;
  }

  export namespace Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    export interface AlertConfiguration {
      /**
       * Also referred to as alert_id in this documentation.
       */
      id: string;

      /**
       * The creation time of the resource in Orb.
       */
      created_at: string;

      /**
       * The name of the currency the credit balance or invoice cost is denominated in.
       */
      currency: string | null;

      /**
       * The customer the alert applies to.
       */
      customer: Shared.CustomerMinified | null;

      /**
       * Whether the alert is enabled or disabled.
       */
      enabled: boolean;

      /**
       * The metric the alert applies to.
       */
      metric: AlertConfiguration.Metric | null;

      /**
       * The plan the alert applies to.
       */
      plan: AlertConfiguration.Plan | null;

      /**
       * The subscription the alert applies to.
       */
      subscription: Shared.SubscriptionMinified | null;

      /**
       * The thresholds that define the conditions under which the alert will be
       * triggered.
       */
      thresholds: Array<AlertConfiguration.Threshold> | null;

      /**
       * The type of alert. This must be a valid alert type.
       */
      type:
        | 'credit_balance_depleted'
        | 'credit_balance_dropped'
        | 'credit_balance_recovered'
        | 'usage_exceeded'
        | 'cost_exceeded'
        | 'spend_exceeded'
        | 'license_balance_threshold_reached';

      /**
       * The current status of the alert. This field is only present for credit balance
       * alerts.
       */
      balance_alert_status?: Array<AlertConfiguration.BalanceAlertStatus> | null;

      /**
       * The property keys to group cost alerts by. Only present for cost alerts with
       * grouping enabled.
       */
      grouping_keys?: Array<string> | null;

      /**
       * Minified license type for alert serialization.
       */
      license_type?: AlertConfiguration.LicenseType | null;

      /**
       * Filters scoping which prices are included in spend and grouped cost alert
       * evaluation. Alerts use the price_id, item_id, and price_type fields only; the
       * alert's pricing unit is reported by currency.
       */
      price_filters?: Array<AlertConfiguration.PriceFilter> | null;

      /**
       * Per-group threshold overrides. Each override maps a specific combination of
       * grouping_keys values to a replacement threshold list. Only present for grouped
       * cost alerts that have at least one override.
       */
      threshold_overrides?: Array<AlertConfiguration.ThresholdOverride> | null;
    }

    export namespace AlertConfiguration {
      /**
       * The metric the alert applies to.
       */
      export interface Metric {
        id: string;
      }

      /**
       * The plan the alert applies to.
       */
      export interface Plan {
        id: string | null;

        /**
         * An optional user-defined ID for this plan resource, used throughout the system
         * as an alias for this Plan. Use this field to identify a plan by an existing
         * identifier in your system.
         */
        external_plan_id: string | null;

        name: string | null;

        plan_version: string;
      }

      /**
       * Thresholds are used to define the conditions under which an alert will be
       * triggered.
       */
      export interface Threshold {
        /**
         * The value at which an alert will fire. For credit balance alerts, the alert will
         * fire at or below this value. For usage and cost alerts, the alert will fire at
         * or above this value.
         */
        value: string;
      }

      /**
       * Alert status is used to determine if an alert is currently in-alert or not.
       */
      export interface BalanceAlertStatus {
        /**
         * Whether the alert is currently in-alert or not.
         */
        in_alert: boolean;

        /**
         * The value of the threshold that defines the alert status.
         */
        threshold_value: string;
      }

      /**
       * Minified license type for alert serialization.
       */
      export interface LicenseType {
        id: string;
      }

      export interface PriceFilter {
        /**
         * The property of the price to filter on.
         */
        field: 'price_id' | 'item_id' | 'price_type' | 'currency' | 'pricing_unit_id';

        /**
         * Should prices that match the filter be included or excluded.
         */
        operator: 'includes' | 'excludes';

        /**
         * The IDs or values that match this filter.
         */
        values: Array<string>;
      }

      /**
       * A per-group threshold override on a grouped cost alert.
       *
       * An empty `thresholds` list means the group is silenced (never fires). A
       * non-empty list fully replaces the default thresholds for that group.
       */
      export interface ThresholdOverride {
        /**
         * The values identifying this group, ordered to match group_keys when set and the
         * alert's grouping_keys otherwise.
         */
        group_values: Array<string>;

        /**
         * The thresholds applied to this group. An empty list means the group is silenced.
         */
        thresholds: Array<ThresholdOverride.Threshold>;

        /**
         * The subset of the alert's grouping_keys this override binds. Null when the
         * override targets one exact group across every grouping key.
         */
        group_keys?: Array<string> | null;
      }

      export namespace ThresholdOverride {
        /**
         * Thresholds are used to define the conditions under which an alert will be
         * triggered.
         */
        export interface Threshold {
          /**
           * The value at which an alert will fire. For credit balance alerts, the alert will
           * fire at or below this value. For usage and cost alerts, the alert will fire at
           * or above this value.
           */
          value: string;
        }
      }
    }

    /**
     * A currency or custom credit unit, as embedded in webhook payloads.
     */
    export interface PricingUnit {
      id: string;

      display_name: string | null;

      name: string;

      symbol: string | null;
    }
  }
}

/**
 * Issued when a customer's credit ledger is incremented.
 */
export interface CustomerCreditLedgerIncrementedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * A customer is a buyer of your products, and the other party to the billing
   * relationship.
   *
   * In Orb, customers are assigned system generated identifiers automatically, but
   * it's often desirable to have these match existing identifiers in your system. To
   * avoid having to denormalize Orb ID information, you can pass in an
   * `external_customer_id` with your own identifier. See
   * [Customer ID Aliases](/events-and-metrics/customer-aliases) for further
   * information about how these aliases work in Orb.
   *
   * In addition to having an identifier in your system, a customer may exist in a
   * payment provider solution like Stripe. Use the `payment_provider_id` and the
   * `payment_provider` enum field to express this mapping.
   *
   * A customer also has a timezone (from the standard
   * [IANA timezone database](https://www.iana.org/time-zones)), which defaults to
   * your account's timezone. See [Timezone localization](/essentials/timezones) for
   * information on what this timezone parameter influences within Orb.
   */
  customer: CustomersAPI.Customer;

  properties: CustomerCreditLedgerIncrementedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'customer.credit_ledger_incremented';
}

export namespace CustomerCreditLedgerIncrementedWebhookEvent {
  export interface Properties {
    /**
     * The Credit Block resource models prepaid credits within Orb.
     */
    block: Properties.Block;

    /**
     * A currency or custom credit unit, as embedded in webhook payloads.
     */
    pricing_unit: Properties.PricingUnit;
  }

  export namespace Properties {
    /**
     * The Credit Block resource models prepaid credits within Orb.
     */
    export interface Block {
      id: string;

      balance: string;

      /**
       * How this credit block was created: `allocation` (a subscription's recurring
       * credit allocation), `top_up` (an automatic balance-threshold top-up),
       * `commitment` (a subscription commitment true-up rolled forward as credit), or
       * `manual` (a manual credit ledger increment, including credits voided or expired
       * off another block).
       */
      credit_block_source: 'allocation' | 'top_up' | 'commitment' | 'manual';

      effective_date: string | null;

      expiry_date: string | null;

      filters: Array<Block.Filter>;

      maximum_initial_balance: string | null;

      /**
       * User specified key-value pairs for the resource. If not present, this defaults
       * to an empty dictionary. Individual keys can be removed by setting the value to
       * `null`, and the entire metadata mapping can be cleared by setting `metadata` to
       * `null`.
       */
      metadata: { [key: string]: string };

      per_unit_cost_basis: string | null;

      status: 'active' | 'pending_payment';

      /**
       * The credit allocation that funded a block. Extends the allocation resource
       * serialized on prices with the catalog-item attribution of the funding price.
       */
      credit_allocation?: Block.CreditAllocation | null;

      /**
       * The subscription commitment whose true-up rolled forward into this credit block.
       * Present only when `credit_block_source` is `commitment`.
       */
      credit_commitment?: Block.CreditCommitment | null;
    }

    export namespace Block {
      export interface Filter {
        /**
         * The property of the price to filter on.
         */
        field: 'price_id' | 'item_id' | 'price_type' | 'currency' | 'pricing_unit_id';

        /**
         * Should prices that match the filter be included or excluded.
         */
        operator: 'includes' | 'excludes';

        /**
         * The IDs or values that match this filter.
         */
        values: Array<string>;
      }

      /**
       * The credit allocation that funded a block. Extends the allocation resource
       * serialized on prices with the catalog-item attribution of the funding price.
       */
      export interface CreditAllocation {
        allows_rollover: boolean;

        currency: string;

        custom_expiration: Shared.CustomExpiration | null;

        /**
         * The ID of the catalog item this block was allocated from, derived from the
         * allocation's price.
         */
        item_id: string;

        filters?: Array<CreditAllocation.Filter>;

        license_type_id?: string | null;
      }

      export namespace CreditAllocation {
        export interface Filter {
          /**
           * The property of the price to filter on.
           */
          field: 'price_id' | 'item_id' | 'price_type' | 'currency' | 'pricing_unit_id';

          /**
           * Should prices that match the filter be included or excluded.
           */
          operator: 'includes' | 'excludes';

          /**
           * The IDs or values that match this filter.
           */
          values: Array<string>;
        }
      }

      /**
       * The subscription commitment whose true-up rolled forward into this credit block.
       * Present only when `credit_block_source` is `commitment`.
       */
      export interface CreditCommitment {
        /**
         * The ID of the subscription commitment this block was rolled forward from.
         */
        id: string;

        /**
         * The subscription the commitment belongs to.
         */
        subscription_id?: string | null;
      }
    }

    /**
     * A currency or custom credit unit, as embedded in webhook payloads.
     */
    export interface PricingUnit {
      id: string;

      display_name: string | null;

      name: string;

      symbol: string | null;
    }
  }
}

/**
 * Issued when a customer is updated.
 */
export interface CustomerEditedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * A customer is a buyer of your products, and the other party to the billing
   * relationship.
   *
   * In Orb, customers are assigned system generated identifiers automatically, but
   * it's often desirable to have these match existing identifiers in your system. To
   * avoid having to denormalize Orb ID information, you can pass in an
   * `external_customer_id` with your own identifier. See
   * [Customer ID Aliases](/events-and-metrics/customer-aliases) for further
   * information about how these aliases work in Orb.
   *
   * In addition to having an identifier in your system, a customer may exist in a
   * payment provider solution like Stripe. Use the `payment_provider_id` and the
   * `payment_provider` enum field to express this mapping.
   *
   * A customer also has a timezone (from the standard
   * [IANA timezone database](https://www.iana.org/time-zones)), which defaults to
   * your account's timezone. See [Timezone localization](/essentials/timezones) for
   * information on what this timezone parameter influences within Orb.
   */
  customer: CustomersAPI.Customer;

  properties: CustomerEditedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'customer.edited';
}

export namespace CustomerEditedWebhookEvent {
  export interface Properties {
    /**
     * metadata values are non-null on the wire (deleting a key removes it from
     * storage); the Optional[str] values only exist on the new half of a metadata
     * FieldChange.
     */
    previous_attributes: Properties.PreviousAttributes;
  }

  export namespace Properties {
    /**
     * metadata values are non-null on the wire (deleting a key removes it from
     * storage); the Optional[str] values only exist on the new half of a metadata
     * FieldChange.
     */
    export interface PreviousAttributes {
      auto_collection?: boolean | null;

      billing_address?: Shared.Address | null;

      default_payment_method_id?: string | null;

      email?: string | null;

      email_delivery?: boolean | null;

      external_customer_id?: string | null;

      metadata?: { [key: string]: string } | null;

      name?: string | null;

      payment_provider?: string | null;

      payment_provider_id?: string | null;

      shipping_address?: Shared.Address | null;

      /**
       * Tax IDs are commonly required to be displayed on customer invoices, which are
       * added to the headers of invoices.
       *
       * ### Supported Tax ID Countries and Types
       *
       * | Country                | Type         | Description                                                                                             |
       * | ---------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
       * | Albania                | `al_tin`     | Albania Tax Identification Number                                                                       |
       * | Andorra                | `ad_nrt`     | Andorran NRT Number                                                                                     |
       * | Angola                 | `ao_tin`     | Angola Tax Identification Number                                                                        |
       * | Argentina              | `ar_cuit`    | Argentinian Tax ID Number                                                                               |
       * | Armenia                | `am_tin`     | Armenia Tax Identification Number                                                                       |
       * | Aruba                  | `aw_tin`     | Aruba Tax Identification Number                                                                         |
       * | Australia              | `au_abn`     | Australian Business Number (AU ABN)                                                                     |
       * | Australia              | `au_arn`     | Australian Taxation Office Reference Number                                                             |
       * | Austria                | `eu_vat`     | European VAT Number                                                                                     |
       * | Azerbaijan             | `az_tin`     | Azerbaijan Tax Identification Number                                                                    |
       * | Bahamas                | `bs_tin`     | Bahamas Tax Identification Number                                                                       |
       * | Bahrain                | `bh_vat`     | Bahraini VAT Number                                                                                     |
       * | Bangladesh             | `bd_bin`     | Bangladesh Business Identification Number                                                               |
       * | Barbados               | `bb_tin`     | Barbados Tax Identification Number                                                                      |
       * | Belarus                | `by_tin`     | Belarus TIN Number                                                                                      |
       * | Belgium                | `eu_vat`     | European VAT Number                                                                                     |
       * | Benin                  | `bj_ifu`     | Benin Tax Identification Number (Identifiant Fiscal Unique)                                             |
       * | Bolivia                | `bo_tin`     | Bolivian Tax ID                                                                                         |
       * | Bosnia and Herzegovina | `ba_tin`     | Bosnia and Herzegovina Tax Identification Number                                                        |
       * | Brazil                 | `br_cnpj`    | Brazilian CNPJ Number                                                                                   |
       * | Brazil                 | `br_cpf`     | Brazilian CPF Number                                                                                    |
       * | Bulgaria               | `bg_uic`     | Bulgaria Unified Identification Code                                                                    |
       * | Bulgaria               | `eu_vat`     | European VAT Number                                                                                     |
       * | Burkina Faso           | `bf_ifu`     | Burkina Faso Tax Identification Number (Numéro d'Identifiant Fiscal Unique)                             |
       * | Cambodia               | `kh_tin`     | Cambodia Tax Identification Number                                                                      |
       * | Cameroon               | `cm_niu`     | Cameroon Tax Identification Number (Numéro d'Identifiant fiscal Unique)                                 |
       * | Canada                 | `ca_bn`      | Canadian BN                                                                                             |
       * | Canada                 | `ca_gst_hst` | Canadian GST/HST Number                                                                                 |
       * | Canada                 | `ca_pst_bc`  | Canadian PST Number (British Columbia)                                                                  |
       * | Canada                 | `ca_pst_mb`  | Canadian PST Number (Manitoba)                                                                          |
       * | Canada                 | `ca_pst_sk`  | Canadian PST Number (Saskatchewan)                                                                      |
       * | Canada                 | `ca_qst`     | Canadian QST Number (Québec)                                                                            |
       * | Cape Verde             | `cv_nif`     | Cape Verde Tax Identification Number (Número de Identificação Fiscal)                                   |
       * | Chile                  | `cl_tin`     | Chilean TIN                                                                                             |
       * | China                  | `cn_tin`     | Chinese Tax ID                                                                                          |
       * | Colombia               | `co_nit`     | Colombian NIT Number                                                                                    |
       * | Congo-Kinshasa         | `cd_nif`     | Congo (DR) Tax Identification Number (Número de Identificação Fiscal)                                   |
       * | Costa Rica             | `cr_tin`     | Costa Rican Tax ID                                                                                      |
       * | Croatia                | `eu_vat`     | European VAT Number                                                                                     |
       * | Croatia                | `hr_oib`     | Croatian Personal Identification Number (OIB)                                                           |
       * | Cyprus                 | `eu_vat`     | European VAT Number                                                                                     |
       * | Czech Republic         | `eu_vat`     | European VAT Number                                                                                     |
       * | Denmark                | `eu_vat`     | European VAT Number                                                                                     |
       * | Dominican Republic     | `do_rcn`     | Dominican RCN Number                                                                                    |
       * | Ecuador                | `ec_ruc`     | Ecuadorian RUC Number                                                                                   |
       * | Egypt                  | `eg_tin`     | Egyptian Tax Identification Number                                                                      |
       * | El Salvador            | `sv_nit`     | El Salvadorian NIT Number                                                                               |
       * | Estonia                | `eu_vat`     | European VAT Number                                                                                     |
       * | Ethiopia               | `et_tin`     | Ethiopia Tax Identification Number                                                                      |
       * | European Union         | `eu_oss_vat` | European One Stop Shop VAT Number for non-Union scheme                                                  |
       * | Faroe Islands          | `fo_vat`     | Faroe Islands VAT Number                                                                                |
       * | Finland                | `eu_vat`     | European VAT Number                                                                                     |
       * | France                 | `eu_vat`     | European VAT Number                                                                                     |
       * | Georgia                | `ge_vat`     | Georgian VAT                                                                                            |
       * | Germany                | `de_stn`     | German Tax Number (Steuernummer)                                                                        |
       * | Germany                | `eu_vat`     | European VAT Number                                                                                     |
       * | Gibraltar              | `gi_tin`     | Gibraltar Tax Identification Number                                                                     |
       * | Greece                 | `eu_vat`     | European VAT Number                                                                                     |
       * | Guinea                 | `gn_nif`     | Guinea Tax Identification Number (Número de Identificação Fiscal)                                       |
       * | Hong Kong              | `hk_br`      | Hong Kong BR Number                                                                                     |
       * | Hungary                | `eu_vat`     | European VAT Number                                                                                     |
       * | Hungary                | `hu_tin`     | Hungary Tax Number (adószám)                                                                            |
       * | Iceland                | `is_vat`     | Icelandic VAT                                                                                           |
       * | India                  | `in_gst`     | Indian GST Number                                                                                       |
       * | Indonesia              | `id_npwp`    | Indonesian NPWP Number                                                                                  |
       * | Ireland                | `eu_vat`     | European VAT Number                                                                                     |
       * | Israel                 | `il_vat`     | Israel VAT                                                                                              |
       * | Italy                  | `eu_vat`     | European VAT Number                                                                                     |
       * | Italy                  | `it_cf`      | Italian Codice Fiscale Number                                                                           |
       * | Japan                  | `jp_cn`      | Japanese Corporate Number (_Hōjin Bangō_)                                                               |
       * | Japan                  | `jp_rn`      | Japanese Registered Foreign Businesses' Registration Number (_Tōroku Kokugai Jigyōsha no Tōroku Bangō_) |
       * | Japan                  | `jp_trn`     | Japanese Tax Registration Number (_Tōroku Bangō_)                                                       |
       * | Kazakhstan             | `kz_bin`     | Kazakhstani Business Identification Number                                                              |
       * | Kenya                  | `ke_pin`     | Kenya Revenue Authority Personal Identification Number                                                  |
       * | Kyrgyzstan             | `kg_tin`     | Kyrgyzstan Tax Identification Number                                                                    |
       * | Laos                   | `la_tin`     | Laos Tax Identification Number                                                                          |
       * | Latvia                 | `eu_vat`     | European VAT Number                                                                                     |
       * | Liechtenstein          | `li_uid`     | Liechtensteinian UID Number                                                                             |
       * | Liechtenstein          | `li_vat`     | Liechtenstein VAT Number                                                                                |
       * | Lithuania              | `eu_vat`     | European VAT Number                                                                                     |
       * | Luxembourg             | `eu_vat`     | European VAT Number                                                                                     |
       * | Malaysia               | `my_frp`     | Malaysian FRP Number                                                                                    |
       * | Malaysia               | `my_itn`     | Malaysian ITN                                                                                           |
       * | Malaysia               | `my_sst`     | Malaysian SST Number                                                                                    |
       * | Malta                  | `eu_vat`     | European VAT Number                                                                                     |
       * | Mauritania             | `mr_nif`     | Mauritania Tax Identification Number (Número de Identificação Fiscal)                                   |
       * | Mexico                 | `mx_rfc`     | Mexican RFC Number                                                                                      |
       * | Moldova                | `md_vat`     | Moldova VAT Number                                                                                      |
       * | Montenegro             | `me_pib`     | Montenegro PIB Number                                                                                   |
       * | Morocco                | `ma_vat`     | Morocco VAT Number                                                                                      |
       * | Nepal                  | `np_pan`     | Nepal PAN Number                                                                                        |
       * | Netherlands            | `eu_vat`     | European VAT Number                                                                                     |
       * | New Zealand            | `nz_gst`     | New Zealand GST Number                                                                                  |
       * | Nigeria                | `ng_tin`     | Nigerian Tax Identification Number                                                                      |
       * | North Macedonia        | `mk_vat`     | North Macedonia VAT Number                                                                              |
       * | Northern Ireland       | `eu_vat`     | Northern Ireland VAT Number                                                                             |
       * | Norway                 | `no_vat`     | Norwegian VAT Number                                                                                    |
       * | Norway                 | `no_voec`    | Norwegian VAT on e-commerce Number                                                                      |
       * | Oman                   | `om_vat`     | Omani VAT Number                                                                                        |
       * | Paraguay               | `py_ruc`     | Paraguayan RUC Number                                                                                   |
       * | Peru                   | `pe_ruc`     | Peruvian RUC Number                                                                                     |
       * | Philippines            | `ph_tin`     | Philippines Tax Identification Number                                                                   |
       * | Poland                 | `eu_vat`     | European VAT Number                                                                                     |
       * | Poland                 | `pl_nip`     | Polish Tax ID Number                                                                                    |
       * | Portugal               | `eu_vat`     | European VAT Number                                                                                     |
       * | Romania                | `eu_vat`     | European VAT Number                                                                                     |
       * | Romania                | `ro_tin`     | Romanian Tax ID Number                                                                                  |
       * | Russia                 | `ru_inn`     | Russian INN                                                                                             |
       * | Russia                 | `ru_kpp`     | Russian KPP                                                                                             |
       * | Saudi Arabia           | `sa_vat`     | Saudi Arabia VAT                                                                                        |
       * | Senegal                | `sn_ninea`   | Senegal NINEA Number                                                                                    |
       * | Serbia                 | `rs_pib`     | Serbian PIB Number                                                                                      |
       * | Singapore              | `sg_gst`     | Singaporean GST                                                                                         |
       * | Singapore              | `sg_uen`     | Singaporean UEN                                                                                         |
       * | Slovakia               | `eu_vat`     | European VAT Number                                                                                     |
       * | Slovenia               | `eu_vat`     | European VAT Number                                                                                     |
       * | Slovenia               | `si_tin`     | Slovenia Tax Number (davčna številka)                                                                   |
       * | South Africa           | `za_vat`     | South African VAT Number                                                                                |
       * | South Korea            | `kr_brn`     | Korean BRN                                                                                              |
       * | Spain                  | `es_cif`     | Spanish NIF Number (previously Spanish CIF Number)                                                      |
       * | Spain                  | `eu_vat`     | European VAT Number                                                                                     |
       * | Sri Lanka              | `lk_vat`     | Sri Lanka VAT Number                                                                                    |
       * | Suriname               | `sr_fin`     | Suriname FIN Number                                                                                     |
       * | Sweden                 | `eu_vat`     | European VAT Number                                                                                     |
       * | Switzerland            | `ch_uid`     | Switzerland UID Number                                                                                  |
       * | Switzerland            | `ch_vat`     | Switzerland VAT Number                                                                                  |
       * | Taiwan                 | `tw_vat`     | Taiwanese VAT                                                                                           |
       * | Tajikistan             | `tj_tin`     | Tajikistan Tax Identification Number                                                                    |
       * | Tanzania               | `tz_vat`     | Tanzania VAT Number                                                                                     |
       * | Thailand               | `th_vat`     | Thai VAT                                                                                                |
       * | Turkey                 | `tr_tin`     | Turkish Tax Identification Number                                                                       |
       * | Uganda                 | `ug_tin`     | Uganda Tax Identification Number                                                                        |
       * | Ukraine                | `ua_vat`     | Ukrainian VAT                                                                                           |
       * | United Arab Emirates   | `ae_trn`     | United Arab Emirates TRN                                                                                |
       * | United Kingdom         | `gb_vat`     | United Kingdom VAT Number                                                                               |
       * | United States          | `us_ein`     | United States EIN                                                                                       |
       * | Uruguay                | `uy_ruc`     | Uruguayan RUC Number                                                                                    |
       * | Uzbekistan             | `uz_tin`     | Uzbekistan TIN Number                                                                                   |
       * | Uzbekistan             | `uz_vat`     | Uzbekistan VAT Number                                                                                   |
       * | Venezuela              | `ve_rif`     | Venezuelan RIF Number                                                                                   |
       * | Vietnam                | `vn_tin`     | Vietnamese Tax ID Number                                                                                |
       * | Zambia                 | `zm_tin`     | Zambia Tax Identification Number                                                                        |
       * | Zimbabwe               | `zw_tin`     | Zimbabwe Tax Identification Number                                                                      |
       */
      tax_id?: Shared.CustomerTaxID | null;
    }
  }
}

/**
 * Issued when a data export transfer fails.
 */
export interface DataExportsTransferErrorWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: DataExportsTransferErrorWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'data_exports.transfer_error';
}

export namespace DataExportsTransferErrorWebhookEvent {
  export interface Properties {
    description: string;

    destination_name: string;

    resources: Array<string>;

    rows_transferred: number;

    transfer_blamed_party: string;

    transfer_ended_at: string;

    transfer_started_at: string;
  }
}

/**
 * Issued when a data export transfer succeeds.
 */
export interface DataExportsTransferSuccessWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: DataExportsTransferSuccessWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'data_exports.transfer_success';
}

export namespace DataExportsTransferSuccessWebhookEvent {
  export interface Properties {
    description: string;

    destination_name: string;

    resources: Array<string>;

    rows_transferred: number;

    transfer_ended_at: string;

    transfer_started_at: string;
  }
}

/**
 * Issued when an event does not match any customer.
 */
export interface EventUnmatchedEventWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: EventUnmatchedEventWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'event.unmatched_event';
}

export namespace EventUnmatchedEventWebhookEvent {
  export interface Properties {
    event: Properties.Event;
  }

  export namespace Properties {
    export interface Event {
      customer_id: string | null;

      event_name: string;

      external_customer_id: string | null;

      idempotency_key: string;

      properties: { [key: string]: unknown };

      timestamp: string;
    }
  }
}

/**
 * Issued when ingestion events reference unmatched customer IDs.
 */
export interface IngestionUnmatchedCustomerIDsWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: IngestionUnmatchedCustomerIDsWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'ingestion.unmatched_customer_ids';
}

export namespace IngestionUnmatchedCustomerIDsWebhookEvent {
  export interface Properties {
    external_customer_ids: Array<string>;
  }
}

/**
 * Issued when an invoice accounting sync fails.
 */
export interface InvoiceAccountingSyncFailedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  accounting_sync_record: InvoiceAccountingSyncFailedWebhookEvent.AccountingSyncRecord;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: InvoiceAccountingSyncFailedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.accounting_sync_failed';
}

export namespace InvoiceAccountingSyncFailedWebhookEvent {
  export interface AccountingSyncRecord {
    id: string;

    customer_id: string;

    record_type:
      | 'customer'
      | 'invoice'
      | 'transaction'
      | 'customer_balance_transaction'
      | 'credit_note'
      | 'subscription'
      | 'sales_order'
      | 'block';

    error_details?: { [key: string]: unknown } | null;

    invoice_id?: string | null;

    provider_customer_id?: string | null;

    status?: string | null;

    sync_action?: string | null;
  }

  export interface Properties {
    connection_type: string;

    failure_reason: string;
  }
}

/**
 * Issued when an invoice accounting sync succeeds.
 */
export interface InvoiceAccountingSyncSucceededWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  accounting_sync_record: InvoiceAccountingSyncSucceededWebhookEvent.AccountingSyncRecord;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: InvoiceAccountingSyncSucceededWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.accounting_sync_succeeded';
}

export namespace InvoiceAccountingSyncSucceededWebhookEvent {
  export interface AccountingSyncRecord {
    id: string;

    customer_id: string;

    record_type:
      | 'customer'
      | 'invoice'
      | 'transaction'
      | 'customer_balance_transaction'
      | 'credit_note'
      | 'subscription'
      | 'sales_order'
      | 'block';

    error_details?: { [key: string]: unknown } | null;

    invoice_id?: string | null;

    provider_customer_id?: string | null;

    status?: string | null;

    sync_action?: string | null;
  }

  export interface Properties {
    connection_type: string;
  }
}

/**
 * Issued when a collections-automation schedule step is executed for an invoice.
 */
export interface InvoiceAutomationScheduleStepExecutedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * The invoice fields a consumer needs to run their own notification flows without
   * a follow-up API call, mirroring the variables Orb's own automation emails render
   * against.
   */
  invoice: InvoiceAutomationScheduleStepExecutedWebhookEvent.Invoice;

  properties: InvoiceAutomationScheduleStepExecutedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.automation_schedule_step_executed';
}

export namespace InvoiceAutomationScheduleStepExecutedWebhookEvent {
  /**
   * The invoice fields a consumer needs to run their own notification flows without
   * a follow-up API call, mirroring the variables Orb's own automation emails render
   * against.
   */
  export interface Invoice {
    id: string;

    amount_due: string;

    currency: string;

    customer_id: string;

    customer_name: string;

    due_date: string | null;

    external_customer_id: string | null;

    hosted_invoice_url: string | null;

    invoice_date: string;

    invoice_number: string;

    issued_at: string | null;

    memo: string | null;

    payment_method_last_four_digits: string | null;

    status: string;

    subscription_id: string | null;
  }

  export interface Properties {
    actions: Array<Properties.SendEmailActionEntry | Properties.RetryPaymentActionEntry>;

    automation_schedule_template_id: string | null;

    automation_schedule_template_name: string | null;

    executed_at: string;

    label: string;

    scheduled_at: string;

    step_id: string;
  }

  export namespace Properties {
    export interface SendEmailActionEntry {
      recipient: string | null;

      sent: boolean;

      action_type?: 'send_email';
    }

    export interface RetryPaymentActionEntry {
      amount_attempted: string | null;

      currency: string | null;

      failure_reason: string | null;

      outcome: 'succeeded' | 'failed' | 'skipped';

      payment_provider: string | null;

      payment_provider_transaction_id: string | null;

      payment_transaction_record_id: string | null;

      action_type?: 'retry_payment';
    }
  }
}

/**
 * Issued when invoice cost data is exported.
 */
export interface InvoiceCostDataExportedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  invoice: string;

  properties: InvoiceCostDataExportedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.cost_data_exported';
}

export namespace InvoiceCostDataExportedWebhookEvent {
  export interface Properties {
    exported_date: string;

    s3_bucket: string;

    s3_key: string;
  }
}

/**
 * Issued when a dunning schedule is created for an invoice.
 */
export interface InvoiceDunningScheduleCreatedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: InvoiceDunningScheduleCreatedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.dunning_schedule_created';
}

export namespace InvoiceDunningScheduleCreatedWebhookEvent {
  export interface Properties {
    dunning_schedule: Properties.DunningSchedule;

    dunning_steps: Array<Properties.DunningStep>;

    source: string;
  }

  export namespace Properties {
    export interface DunningSchedule {
      completion_time: string | null;

      created_at: string | null;

      invoice_id: string;

      modified_at: string | null;

      start_time: string | null;

      status: string;
    }

    export interface DunningStep {
      actions: Array<string>;

      created_at: string | null;

      execution_time: string | null;

      manually_triggered_at: string | null;

      modified_at: string | null;

      status: string;

      step_number: number | null;

      timestamp: string | null;
    }
  }
}

/**
 * Issued when a dunning schedule ends.
 */
export interface InvoiceDunningScheduleEndedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: InvoiceDunningScheduleEndedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.dunning_schedule_ended';
}

export namespace InvoiceDunningScheduleEndedWebhookEvent {
  export interface Properties {
    dunning_schedule: Properties.DunningSchedule;

    dunning_steps: Array<Properties.DunningStep>;
  }

  export namespace Properties {
    export interface DunningSchedule {
      completion_time: string | null;

      created_at: string | null;

      invoice_id: string;

      modified_at: string | null;

      start_time: string | null;

      status: string;
    }

    export interface DunningStep {
      actions: Array<string>;

      created_at: string | null;

      execution_time: string | null;

      manually_triggered_at: string | null;

      modified_at: string | null;

      status: string;

      step_number: number | null;

      timestamp: string | null;
    }
  }
}

/**
 * Issued when a dunning schedule is reset.
 */
export interface InvoiceDunningScheduleResetWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: InvoiceDunningScheduleResetWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.dunning_schedule_reset';
}

export namespace InvoiceDunningScheduleResetWebhookEvent {
  export interface Properties {
    /**
     * The schedule shape `DunningScheduleV2.external_serialization()` produces, which
     * is narrower than the schedule's api resource.
     */
    dunning_schedule: Properties.DunningSchedule;

    /**
     * The schedule shape `DunningScheduleV2.external_serialization()` produces, which
     * is narrower than the schedule's api resource.
     */
    previous_schedule: Properties.PreviousSchedule;
  }

  export namespace Properties {
    /**
     * The schedule shape `DunningScheduleV2.external_serialization()` produces, which
     * is narrower than the schedule's api resource.
     */
    export interface DunningSchedule {
      completion_time: string | null;

      created_at: string | null;

      invoice_id: string;

      modified_at: string | null;

      start_time: string | null;

      status: string | null;
    }

    /**
     * The schedule shape `DunningScheduleV2.external_serialization()` produces, which
     * is narrower than the schedule's api resource.
     */
    export interface PreviousSchedule {
      completion_time: string | null;

      created_at: string | null;

      invoice_id: string;

      modified_at: string | null;

      start_time: string | null;

      status: string | null;
    }
  }
}

/**
 * Issued when a dunning schedule step is executed.
 */
export interface InvoiceDunningScheduleStepExecutedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: InvoiceDunningScheduleStepExecutedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.dunning_schedule_step_executed';
}

export namespace InvoiceDunningScheduleStepExecutedWebhookEvent {
  export interface Properties {
    dunning_step: Properties.DunningStep;
  }

  export namespace Properties {
    export interface DunningStep {
      actions: Array<string>;

      created_at: string | null;

      execution_time: string | null;

      manually_triggered_at: string | null;

      modified_at: string | null;

      status: string;

      step_number: number | null;

      timestamp: string | null;
    }
  }
}

/**
 * Issued when a draft invoice has been edited.
 */
export interface InvoiceEditedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: InvoiceEditedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.edited';
}

export namespace InvoiceEditedWebhookEvent {
  export interface Properties {
    /**
     * `due_date` is an ISO-8601 string rather than a datetime: the untyped message
     * called `.isoformat()` on it, so it keeps microseconds where the webhook JSON
     * provider would have truncated them.
     */
    previous_attributes: Properties.PreviousAttributes;
  }

  export namespace Properties {
    /**
     * `due_date` is an ISO-8601 string rather than a datetime: the untyped message
     * called `.isoformat()` on it, so it keeps microseconds where the webhook JSON
     * provider would have truncated them.
     */
    export interface PreviousAttributes {
      amount_due?: string | null;

      discounts?: Array<Shared.InvoiceLevelDiscount> | null;

      due_date?: string | null;

      line_items?: Array<PreviousAttributes.LineItem> | null;

      maximum?: Shared.Maximum | null;

      metadata?: { [key: string]: string } | null;

      minimum?: Shared.Minimum | null;

      net_terms?: number | null;

      subtotal?: string | null;

      total?: string | null;
    }

    export namespace PreviousAttributes {
      export interface LineItem {
        /**
         * A unique ID for this line item.
         */
        id: string;

        /**
         * The line amount after any adjustments and before overage conversion, credits and
         * partial invoicing.
         */
        adjusted_subtotal: string;

        /**
         * All adjustments applied to the line item in the order they were applied based on
         * invoice calculations (ie. usage discounts -> amount discounts -> percentage
         * discounts -> minimums -> maximums).
         */
        adjustments: Array<
          | Shared.MonetaryUsageDiscountAdjustment
          | Shared.MonetaryAmountDiscountAdjustment
          | Shared.MonetaryPercentageDiscountAdjustment
          | LineItem.MonetaryTieredPercentageDiscountAdjustment
          | Shared.MonetaryMinimumAdjustment
          | Shared.MonetaryMaximumAdjustment
        >;

        /**
         * The final amount for a line item after all adjustments and pre paid credits have
         * been applied.
         */
        amount: string;

        /**
         * The number of prepaid credits applied.
         */
        credits_applied: string;

        /**
         * The end date of the range of time applied for this line item's price.
         */
        end_date: string;

        /**
         * An additional filter that was used to calculate the usage for this line item.
         */
        filter: string | null;

        /**
         * [DEPRECATED] For configured prices that are split by a grouping key, this will
         * be populated with the key and a value. The `amount` and `subtotal` will be the
         * values for this particular grouping.
         */
        grouping: string | null;

        /**
         * The name of the price associated with this line item.
         */
        name: string;

        /**
         * Any amount applied from a partial invoice
         */
        partially_invoiced_amount: string;

        /**
         * The Price resource represents a price that can be billed on a subscription,
         * resulting in a charge on an invoice in the form of an invoice line item. Prices
         * take a quantity and determine an amount to bill.
         *
         * Orb supports a few different pricing models out of the box. Each of these models
         * is serialized differently in a given Price object. The model_type field
         * determines the key for the configuration object that is present.
         *
         * For more on the types of prices, see
         * [the core concepts documentation](/core-concepts#plan-and-price)
         */
        price: Shared.Price;

        /**
         * Either the fixed fee quantity or the usage during the service period.
         */
        quantity: number;

        /**
         * The start date of the range of time applied for this line item's price.
         */
        start_date: string;

        /**
         * For complex pricing structures, the line item can be broken down further in
         * `sub_line_items`.
         */
        sub_line_items: Array<Shared.MatrixSubLineItem | Shared.TierSubLineItem | Shared.OtherSubLineItem>;

        /**
         * The line amount before any adjustments.
         */
        subtotal: string;

        /**
         * An array of tax rates and their incurred tax amounts. Empty if no tax
         * integration is configured.
         */
        tax_amounts: Array<Shared.TaxAmount>;

        /**
         * A list of customer ids that were used to calculate the usage for this line item.
         */
        usage_customer_ids: Array<string> | null;
      }

      export namespace LineItem {
        export interface MonetaryTieredPercentageDiscountAdjustment {
          id: string;

          adjustment_type: 'tiered_percentage_discount';

          /**
           * The value applied by an adjustment.
           */
          amount: string;

          /**
           * @deprecated The price IDs that this adjustment applies to.
           */
          applies_to_price_ids: Array<string>;

          /**
           * The filters that determine which prices to apply this adjustment to.
           */
          filters: Array<MonetaryTieredPercentageDiscountAdjustment.Filter>;

          /**
           * True for adjustments that apply to an entire invoice, false for adjustments that
           * apply to only one price.
           */
          is_invoice_level: boolean;

          /**
           * The reason for the adjustment.
           */
          reason: string | null;

          /**
           * The adjustment id this adjustment replaces. This adjustment will take the place
           * of the replaced adjustment in plan version migrations.
           */
          replaces_adjustment_id: string | null;

          /**
           * The ordered, contiguous bands of cumulative eligible spend, each discounted at
           * its own percentage (progressive fill-a-tier), applied to the prices this
           * adjustment covers in a given billing period.
           */
          tiers: Array<MonetaryTieredPercentageDiscountAdjustment.Tier>;
        }

        export namespace MonetaryTieredPercentageDiscountAdjustment {
          export interface Filter {
            /**
             * The property of the price to filter on.
             */
            field: 'price_id' | 'item_id' | 'price_type' | 'currency' | 'pricing_unit_id';

            /**
             * Should prices that match the filter be included or excluded.
             */
            operator: 'includes' | 'excludes';

            /**
             * The IDs or values that match this filter.
             */
            values: Array<string>;
          }

          /**
           * One band of a tiered percentage discount. Bounds are denominated in the
           * discount's currency. `lower_bound` is the exclusive start of the band and
           * `upper_bound` is the inclusive end; `upper_bound` is null only for the
           * open-ended final tier.
           */
          export interface Tier {
            /**
             * Exclusive lower bound of cumulative spend for this tier.
             */
            lower_bound: number;

            /**
             * The percentage (between 0 and 1) discounted from spend that falls within this
             * tier.
             */
            percentage: number;

            /**
             * Inclusive upper bound of cumulative spend for this tier; null for the final
             * open-ended tier.
             */
            upper_bound?: number | null;
          }
        }
      }
    }
  }
}

/**
 * Issued when an invoice's invoice date has elapsed.
 */
export interface InvoiceInvoiceDateElapsedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  invoice: InvoiceInvoiceDateElapsedWebhookEvent.Invoice;

  properties: InvoiceInvoiceDateElapsedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.invoice_date_elapsed';
}

export namespace InvoiceInvoiceDateElapsedWebhookEvent {
  export interface Invoice {
    id: string;

    customer: Shared.CustomerMinified;

    invoice_number: string;

    status: 'issued' | 'paid' | 'synced' | 'void' | 'draft';

    subscription: Shared.SubscriptionMinified | null;
  }

  export interface Properties {
    invoice_date: string;
  }
}

/**
 * Issued when an invoice issue attempt fails.
 */
export interface InvoiceIssueFailedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: InvoiceIssueFailedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.issue_failed';
}

export namespace InvoiceIssueFailedWebhookEvent {
  export interface Properties {
    reason: string | null;
  }
}

/**
 * Issued when an invoice transitions to the "issued" state.
 */
export interface InvoiceIssuedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: InvoiceIssuedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.issued';
}

export namespace InvoiceIssuedWebhookEvent {
  export interface Properties {
    automatically_marked_as_paid: boolean;
  }
}

/**
 * A lightweight variant of invoice.issued for accounts configured to receive a
 * summarized invoice payload.
 */
export interface InvoiceIssuedSummaryWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * #InvoiceApiResourceWithoutLineItems
   */
  invoice: InvoiceIssuedSummaryWebhookEvent.Invoice;

  properties: InvoiceIssuedSummaryWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.issued_summary';
}

export namespace InvoiceIssuedSummaryWebhookEvent {
  /**
   * #InvoiceApiResourceWithoutLineItems
   */
  export interface Invoice {
    id: string;

    /**
     * This is the final amount required to be charged to the customer and reflects the
     * application of the customer balance to the `total` of the invoice.
     */
    amount_due: string;

    auto_collection: Invoice.AutoCollection;

    billing_address: Shared.Address | null;

    /**
     * The creation time of the resource in Orb.
     */
    created_at: string;

    /**
     * A list of credit notes associated with the invoice
     */
    credit_notes: Array<Invoice.CreditNote>;

    /**
     * An ISO 4217 currency string or `credits`
     */
    currency: string;

    customer: Shared.CustomerMinified;

    customer_balance_transactions: Array<Invoice.CustomerBalanceTransaction>;

    /**
     * Tax IDs are commonly required to be displayed on customer invoices, which are
     * added to the headers of invoices.
     *
     * ### Supported Tax ID Countries and Types
     *
     * | Country                | Type         | Description                                                                                             |
     * | ---------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
     * | Albania                | `al_tin`     | Albania Tax Identification Number                                                                       |
     * | Andorra                | `ad_nrt`     | Andorran NRT Number                                                                                     |
     * | Angola                 | `ao_tin`     | Angola Tax Identification Number                                                                        |
     * | Argentina              | `ar_cuit`    | Argentinian Tax ID Number                                                                               |
     * | Armenia                | `am_tin`     | Armenia Tax Identification Number                                                                       |
     * | Aruba                  | `aw_tin`     | Aruba Tax Identification Number                                                                         |
     * | Australia              | `au_abn`     | Australian Business Number (AU ABN)                                                                     |
     * | Australia              | `au_arn`     | Australian Taxation Office Reference Number                                                             |
     * | Austria                | `eu_vat`     | European VAT Number                                                                                     |
     * | Azerbaijan             | `az_tin`     | Azerbaijan Tax Identification Number                                                                    |
     * | Bahamas                | `bs_tin`     | Bahamas Tax Identification Number                                                                       |
     * | Bahrain                | `bh_vat`     | Bahraini VAT Number                                                                                     |
     * | Bangladesh             | `bd_bin`     | Bangladesh Business Identification Number                                                               |
     * | Barbados               | `bb_tin`     | Barbados Tax Identification Number                                                                      |
     * | Belarus                | `by_tin`     | Belarus TIN Number                                                                                      |
     * | Belgium                | `eu_vat`     | European VAT Number                                                                                     |
     * | Benin                  | `bj_ifu`     | Benin Tax Identification Number (Identifiant Fiscal Unique)                                             |
     * | Bolivia                | `bo_tin`     | Bolivian Tax ID                                                                                         |
     * | Bosnia and Herzegovina | `ba_tin`     | Bosnia and Herzegovina Tax Identification Number                                                        |
     * | Brazil                 | `br_cnpj`    | Brazilian CNPJ Number                                                                                   |
     * | Brazil                 | `br_cpf`     | Brazilian CPF Number                                                                                    |
     * | Bulgaria               | `bg_uic`     | Bulgaria Unified Identification Code                                                                    |
     * | Bulgaria               | `eu_vat`     | European VAT Number                                                                                     |
     * | Burkina Faso           | `bf_ifu`     | Burkina Faso Tax Identification Number (Numéro d'Identifiant Fiscal Unique)                             |
     * | Cambodia               | `kh_tin`     | Cambodia Tax Identification Number                                                                      |
     * | Cameroon               | `cm_niu`     | Cameroon Tax Identification Number (Numéro d'Identifiant fiscal Unique)                                 |
     * | Canada                 | `ca_bn`      | Canadian BN                                                                                             |
     * | Canada                 | `ca_gst_hst` | Canadian GST/HST Number                                                                                 |
     * | Canada                 | `ca_pst_bc`  | Canadian PST Number (British Columbia)                                                                  |
     * | Canada                 | `ca_pst_mb`  | Canadian PST Number (Manitoba)                                                                          |
     * | Canada                 | `ca_pst_sk`  | Canadian PST Number (Saskatchewan)                                                                      |
     * | Canada                 | `ca_qst`     | Canadian QST Number (Québec)                                                                            |
     * | Cape Verde             | `cv_nif`     | Cape Verde Tax Identification Number (Número de Identificação Fiscal)                                   |
     * | Chile                  | `cl_tin`     | Chilean TIN                                                                                             |
     * | China                  | `cn_tin`     | Chinese Tax ID                                                                                          |
     * | Colombia               | `co_nit`     | Colombian NIT Number                                                                                    |
     * | Congo-Kinshasa         | `cd_nif`     | Congo (DR) Tax Identification Number (Número de Identificação Fiscal)                                   |
     * | Costa Rica             | `cr_tin`     | Costa Rican Tax ID                                                                                      |
     * | Croatia                | `eu_vat`     | European VAT Number                                                                                     |
     * | Croatia                | `hr_oib`     | Croatian Personal Identification Number (OIB)                                                           |
     * | Cyprus                 | `eu_vat`     | European VAT Number                                                                                     |
     * | Czech Republic         | `eu_vat`     | European VAT Number                                                                                     |
     * | Denmark                | `eu_vat`     | European VAT Number                                                                                     |
     * | Dominican Republic     | `do_rcn`     | Dominican RCN Number                                                                                    |
     * | Ecuador                | `ec_ruc`     | Ecuadorian RUC Number                                                                                   |
     * | Egypt                  | `eg_tin`     | Egyptian Tax Identification Number                                                                      |
     * | El Salvador            | `sv_nit`     | El Salvadorian NIT Number                                                                               |
     * | Estonia                | `eu_vat`     | European VAT Number                                                                                     |
     * | Ethiopia               | `et_tin`     | Ethiopia Tax Identification Number                                                                      |
     * | European Union         | `eu_oss_vat` | European One Stop Shop VAT Number for non-Union scheme                                                  |
     * | Faroe Islands          | `fo_vat`     | Faroe Islands VAT Number                                                                                |
     * | Finland                | `eu_vat`     | European VAT Number                                                                                     |
     * | France                 | `eu_vat`     | European VAT Number                                                                                     |
     * | Georgia                | `ge_vat`     | Georgian VAT                                                                                            |
     * | Germany                | `de_stn`     | German Tax Number (Steuernummer)                                                                        |
     * | Germany                | `eu_vat`     | European VAT Number                                                                                     |
     * | Gibraltar              | `gi_tin`     | Gibraltar Tax Identification Number                                                                     |
     * | Greece                 | `eu_vat`     | European VAT Number                                                                                     |
     * | Guinea                 | `gn_nif`     | Guinea Tax Identification Number (Número de Identificação Fiscal)                                       |
     * | Hong Kong              | `hk_br`      | Hong Kong BR Number                                                                                     |
     * | Hungary                | `eu_vat`     | European VAT Number                                                                                     |
     * | Hungary                | `hu_tin`     | Hungary Tax Number (adószám)                                                                            |
     * | Iceland                | `is_vat`     | Icelandic VAT                                                                                           |
     * | India                  | `in_gst`     | Indian GST Number                                                                                       |
     * | Indonesia              | `id_npwp`    | Indonesian NPWP Number                                                                                  |
     * | Ireland                | `eu_vat`     | European VAT Number                                                                                     |
     * | Israel                 | `il_vat`     | Israel VAT                                                                                              |
     * | Italy                  | `eu_vat`     | European VAT Number                                                                                     |
     * | Italy                  | `it_cf`      | Italian Codice Fiscale Number                                                                           |
     * | Japan                  | `jp_cn`      | Japanese Corporate Number (_Hōjin Bangō_)                                                               |
     * | Japan                  | `jp_rn`      | Japanese Registered Foreign Businesses' Registration Number (_Tōroku Kokugai Jigyōsha no Tōroku Bangō_) |
     * | Japan                  | `jp_trn`     | Japanese Tax Registration Number (_Tōroku Bangō_)                                                       |
     * | Kazakhstan             | `kz_bin`     | Kazakhstani Business Identification Number                                                              |
     * | Kenya                  | `ke_pin`     | Kenya Revenue Authority Personal Identification Number                                                  |
     * | Kyrgyzstan             | `kg_tin`     | Kyrgyzstan Tax Identification Number                                                                    |
     * | Laos                   | `la_tin`     | Laos Tax Identification Number                                                                          |
     * | Latvia                 | `eu_vat`     | European VAT Number                                                                                     |
     * | Liechtenstein          | `li_uid`     | Liechtensteinian UID Number                                                                             |
     * | Liechtenstein          | `li_vat`     | Liechtenstein VAT Number                                                                                |
     * | Lithuania              | `eu_vat`     | European VAT Number                                                                                     |
     * | Luxembourg             | `eu_vat`     | European VAT Number                                                                                     |
     * | Malaysia               | `my_frp`     | Malaysian FRP Number                                                                                    |
     * | Malaysia               | `my_itn`     | Malaysian ITN                                                                                           |
     * | Malaysia               | `my_sst`     | Malaysian SST Number                                                                                    |
     * | Malta                  | `eu_vat`     | European VAT Number                                                                                     |
     * | Mauritania             | `mr_nif`     | Mauritania Tax Identification Number (Número de Identificação Fiscal)                                   |
     * | Mexico                 | `mx_rfc`     | Mexican RFC Number                                                                                      |
     * | Moldova                | `md_vat`     | Moldova VAT Number                                                                                      |
     * | Montenegro             | `me_pib`     | Montenegro PIB Number                                                                                   |
     * | Morocco                | `ma_vat`     | Morocco VAT Number                                                                                      |
     * | Nepal                  | `np_pan`     | Nepal PAN Number                                                                                        |
     * | Netherlands            | `eu_vat`     | European VAT Number                                                                                     |
     * | New Zealand            | `nz_gst`     | New Zealand GST Number                                                                                  |
     * | Nigeria                | `ng_tin`     | Nigerian Tax Identification Number                                                                      |
     * | North Macedonia        | `mk_vat`     | North Macedonia VAT Number                                                                              |
     * | Northern Ireland       | `eu_vat`     | Northern Ireland VAT Number                                                                             |
     * | Norway                 | `no_vat`     | Norwegian VAT Number                                                                                    |
     * | Norway                 | `no_voec`    | Norwegian VAT on e-commerce Number                                                                      |
     * | Oman                   | `om_vat`     | Omani VAT Number                                                                                        |
     * | Paraguay               | `py_ruc`     | Paraguayan RUC Number                                                                                   |
     * | Peru                   | `pe_ruc`     | Peruvian RUC Number                                                                                     |
     * | Philippines            | `ph_tin`     | Philippines Tax Identification Number                                                                   |
     * | Poland                 | `eu_vat`     | European VAT Number                                                                                     |
     * | Poland                 | `pl_nip`     | Polish Tax ID Number                                                                                    |
     * | Portugal               | `eu_vat`     | European VAT Number                                                                                     |
     * | Romania                | `eu_vat`     | European VAT Number                                                                                     |
     * | Romania                | `ro_tin`     | Romanian Tax ID Number                                                                                  |
     * | Russia                 | `ru_inn`     | Russian INN                                                                                             |
     * | Russia                 | `ru_kpp`     | Russian KPP                                                                                             |
     * | Saudi Arabia           | `sa_vat`     | Saudi Arabia VAT                                                                                        |
     * | Senegal                | `sn_ninea`   | Senegal NINEA Number                                                                                    |
     * | Serbia                 | `rs_pib`     | Serbian PIB Number                                                                                      |
     * | Singapore              | `sg_gst`     | Singaporean GST                                                                                         |
     * | Singapore              | `sg_uen`     | Singaporean UEN                                                                                         |
     * | Slovakia               | `eu_vat`     | European VAT Number                                                                                     |
     * | Slovenia               | `eu_vat`     | European VAT Number                                                                                     |
     * | Slovenia               | `si_tin`     | Slovenia Tax Number (davčna številka)                                                                   |
     * | South Africa           | `za_vat`     | South African VAT Number                                                                                |
     * | South Korea            | `kr_brn`     | Korean BRN                                                                                              |
     * | Spain                  | `es_cif`     | Spanish NIF Number (previously Spanish CIF Number)                                                      |
     * | Spain                  | `eu_vat`     | European VAT Number                                                                                     |
     * | Sri Lanka              | `lk_vat`     | Sri Lanka VAT Number                                                                                    |
     * | Suriname               | `sr_fin`     | Suriname FIN Number                                                                                     |
     * | Sweden                 | `eu_vat`     | European VAT Number                                                                                     |
     * | Switzerland            | `ch_uid`     | Switzerland UID Number                                                                                  |
     * | Switzerland            | `ch_vat`     | Switzerland VAT Number                                                                                  |
     * | Taiwan                 | `tw_vat`     | Taiwanese VAT                                                                                           |
     * | Tajikistan             | `tj_tin`     | Tajikistan Tax Identification Number                                                                    |
     * | Tanzania               | `tz_vat`     | Tanzania VAT Number                                                                                     |
     * | Thailand               | `th_vat`     | Thai VAT                                                                                                |
     * | Turkey                 | `tr_tin`     | Turkish Tax Identification Number                                                                       |
     * | Uganda                 | `ug_tin`     | Uganda Tax Identification Number                                                                        |
     * | Ukraine                | `ua_vat`     | Ukrainian VAT                                                                                           |
     * | United Arab Emirates   | `ae_trn`     | United Arab Emirates TRN                                                                                |
     * | United Kingdom         | `gb_vat`     | United Kingdom VAT Number                                                                               |
     * | United States          | `us_ein`     | United States EIN                                                                                       |
     * | Uruguay                | `uy_ruc`     | Uruguayan RUC Number                                                                                    |
     * | Uzbekistan             | `uz_tin`     | Uzbekistan TIN Number                                                                                   |
     * | Uzbekistan             | `uz_vat`     | Uzbekistan VAT Number                                                                                   |
     * | Venezuela              | `ve_rif`     | Venezuelan RIF Number                                                                                   |
     * | Vietnam                | `vn_tin`     | Vietnamese Tax ID Number                                                                                |
     * | Zambia                 | `zm_tin`     | Zambia Tax Identification Number                                                                        |
     * | Zimbabwe               | `zw_tin`     | Zimbabwe Tax Identification Number                                                                      |
     */
    customer_tax_id: Shared.CustomerTaxID | null;

    /**
     * When the invoice payment is due. The due date is null if the invoice is not yet
     * finalized.
     */
    due_date: string | null;

    /**
     * If the invoice has a status of `draft`, this will be the time that the invoice
     * will be eligible to be issued, otherwise it will be `null`. If `auto-issue` is
     * true, the invoice will automatically begin issuing at this time.
     */
    eligible_to_issue_at: string | null;

    /**
     * A URL for the customer-facing invoice portal. This URL expires 60 days after the
     * link is generated, or 30 days after the invoice's due date — whichever is later.
     */
    hosted_invoice_url: string | null;

    /**
     * The scheduled date of the invoice
     */
    invoice_date: string;

    /**
     * Automatically generated invoice number to help track and reconcile invoices.
     * Invoice numbers have a prefix such as `RFOBWG`. These can be sequential per
     * account or customer.
     */
    invoice_number: string;

    /**
     * The link to download the PDF representation of the `Invoice`.
     */
    invoice_pdf: string | null;

    invoice_source: 'subscription' | 'partial' | 'one_off';

    /**
     * If the invoice failed to issue, this will be the last time it failed to issue
     * (even if it is now in a different state.)
     */
    issue_failed_at: string | null;

    /**
     * If the invoice has been issued, this will be the time it transitioned to
     * `issued` (even if it is now in a different state.)
     */
    issued_at: string | null;

    /**
     * Free-form text which is available on the invoice PDF and the Orb invoice portal.
     */
    memo: string | null;

    /**
     * User specified key-value pairs for the resource. If not present, this defaults
     * to an empty dictionary. Individual keys can be removed by setting the value to
     * `null`, and the entire metadata mapping can be cleared by setting `metadata` to
     * `null`.
     */
    metadata: { [key: string]: string };

    /**
     * If the invoice has a status of `paid`, this gives a timestamp when the invoice
     * was paid.
     */
    paid_at: string | null;

    /**
     * A list of payment attempts associated with the invoice
     */
    payment_attempts: Array<Invoice.PaymentAttempt>;

    /**
     * If payment was attempted on this invoice but failed, this will be the time of
     * the most recent attempt.
     */
    payment_failed_at: string | null;

    /**
     * If payment was attempted on this invoice, this will be the start time of the
     * most recent attempt. This field is especially useful for delayed-notification
     * payment mechanisms (like bank transfers), where payment can take 3 days or more.
     */
    payment_started_at: string | null;

    /**
     * If the invoice is in draft, this timestamp will reflect when the invoice is
     * scheduled to be issued.
     */
    scheduled_issue_at: string | null;

    shipping_address: Shared.Address | null;

    status: 'issued' | 'paid' | 'synced' | 'void' | 'draft';

    subscription: Shared.SubscriptionMinified | null;

    /**
     * If the invoice failed to sync, this will be the last time an external invoicing
     * provider sync was attempted. This field will always be `null` for invoices using
     * Orb Invoicing.
     */
    sync_failed_at: string | null;

    /**
     * The total after any minimums and discounts have been applied.
     */
    total: string;

    /**
     * If the invoice has a status of `void`, this gives a timestamp when the invoice
     * was voided.
     */
    voided_at: string | null;

    /**
     * This is true if the invoice will be automatically issued in the future, and
     * false otherwise.
     */
    will_auto_issue: boolean;
  }

  export namespace Invoice {
    export interface AutoCollection {
      /**
       * True only if auto-collection is enabled for this invoice.
       */
      enabled: boolean | null;

      /**
       * If the invoice is scheduled for auto-collection, this field will reflect when
       * the next attempt will occur. If dunning has been exhausted, or auto-collection
       * is not enabled for this invoice, this field will be `null`.
       */
      next_attempt_at: string | null;

      /**
       * Number of auto-collection payment attempts.
       */
      num_attempts: number | null;

      /**
       * If Orb has ever attempted payment auto-collection for this invoice, this field
       * will reflect when that attempt occurred. In conjunction with `next_attempt_at`,
       * this can be used to tell whether the invoice is currently in dunning (that is,
       * `previously_attempted_at` is non-null, and `next_attempt_at` is non-null), or if
       * dunning has been exhausted (`previously_attempted_at` is non-null, but
       * `next_attempt_at` is null).
       */
      previously_attempted_at: string | null;
    }

    export interface CreditNote {
      id: string;

      credit_note_number: string;

      /**
       * An optional memo supplied on the credit note.
       */
      memo: string | null;

      reason: string;

      total: string;

      type: string;

      /**
       * If the credit note has a status of `void`, this gives a timestamp when the
       * credit note was voided.
       */
      voided_at: string | null;
    }

    export interface CustomerBalanceTransaction {
      /**
       * A unique id for this transaction.
       */
      id: string;

      action:
        | 'applied_to_invoice'
        | 'manual_adjustment'
        | 'prorated_refund'
        | 'revert_prorated_refund'
        | 'return_from_voiding'
        | 'credit_note_applied'
        | 'credit_note_voided'
        | 'overpayment_refund'
        | 'external_payment'
        | 'small_invoice_carryover'
        | 'prepaid_commit_cancel';

      /**
       * The value of the amount changed in the transaction.
       */
      amount: string;

      /**
       * The creation time of this transaction.
       */
      created_at: string;

      credit_note: Shared.CreditNoteTiny | null;

      /**
       * An optional description provided for manual customer balance adjustments.
       */
      description: string | null;

      /**
       * The new value of the customer's balance prior to the transaction, in the
       * customer's currency.
       */
      ending_balance: string;

      invoice: Shared.InvoiceTiny | null;

      /**
       * The original value of the customer's balance prior to the transaction, in the
       * customer's currency.
       */
      starting_balance: string;

      type: 'increment' | 'decrement';
    }

    export interface PaymentAttempt {
      /**
       * The ID of the payment attempt.
       */
      id: string;

      /**
       * The amount of the payment attempt.
       */
      amount: string;

      /**
       * The time at which the payment attempt was created.
       */
      created_at: string;

      /**
       * The payment provider that attempted to collect the payment.
       */
      payment_provider: 'stripe' | 'adyen' | null;

      /**
       * The ID of the payment attempt in the payment provider.
       */
      payment_provider_id: string | null;

      /**
       * URL to the downloadable PDF version of the receipt. This field will be `null`
       * for payment attempts that did not succeed.
       */
      receipt_pdf: string | null;

      /**
       * Whether the payment attempt succeeded.
       */
      succeeded: boolean;
    }
  }

  export interface Properties {
    automatically_marked_as_paid: boolean;
  }
}

/**
 * Issued when an invoice is manually marked as paid.
 */
export interface InvoiceManuallyMarkedAsPaidWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: InvoiceManuallyMarkedAsPaidWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.manually_marked_as_paid';
}

export namespace InvoiceManuallyMarkedAsPaidWebhookEvent {
  export interface Properties {
    external_id: string | null;

    notes: string | null;

    payment_received_date: string | null;
  }
}

/**
 * Issued when an invoice is marked as void.
 */
export interface InvoiceManuallyMarkedAsVoidWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: unknown;

  /**
   * The event this payload describes.
   */
  type: 'invoice.manually_marked_as_void';
}

/**
 * Issued when automated payment collection for an invoice fails for a configured
 * payment gateway.
 */
export interface InvoicePaymentFailedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: InvoicePaymentFailedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.payment_failed';
}

export namespace InvoicePaymentFailedWebhookEvent {
  export interface Properties {
    payment_provider: string | null;

    payment_provider_id: string | null;

    payment_provider_transaction_id: string | null;
  }
}

/**
 * Issued when an invoice payment is being processed.
 */
export interface InvoicePaymentProcessingWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: InvoicePaymentProcessingWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.payment_processing';
}

export namespace InvoicePaymentProcessingWebhookEvent {
  export interface Properties {
    payment_provider_id: string | null;

    payment_provider?: string;
  }
}

/**
 * Issued when automated payment collection for an invoice succeeds for a
 * configured payment gateway.
 */
export interface InvoicePaymentSucceededWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  /**
   * `shared_payment_token_id` is only on the wire when the payment used one.
   */
  properties: InvoicePaymentSucceededWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.payment_succeeded';
}

export namespace InvoicePaymentSucceededWebhookEvent {
  /**
   * `shared_payment_token_id` is only on the wire when the payment used one.
   */
  export interface Properties {
    payment_provider: string | null;

    payment_provider_id: string | null;

    payment_provider_transaction_id: string | null;

    shared_payment_token_id?: string | null;
  }
}

/**
 * Issued when an invoice sync fails.
 */
export interface InvoiceSyncFailedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: InvoiceSyncFailedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.sync_failed';
}

export namespace InvoiceSyncFailedWebhookEvent {
  export interface Properties {
    payment_provider: string | null;

    payment_provider_id: string | null;
  }
}

/**
 * Issued when an invoice sync succeeds.
 */
export interface InvoiceSyncSucceededWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: InvoiceSyncSucceededWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice.sync_succeeded';
}

export namespace InvoiceSyncSucceededWebhookEvent {
  export interface Properties {
    payment_provider: string | null;

    payment_provider_id: string | null;
  }
}

/**
 * Issued when an invoice is undone from marked as paid.
 */
export interface InvoiceUndoMarkAsPaidWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: unknown;

  /**
   * The event this payload describes.
   */
  type: 'invoice.undo_mark_as_paid';
}

/**
 * Issued when an invoice due date recalculation is canceled.
 */
export interface InvoiceDueDateRecalculationCanceledWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: InvoiceDueDateRecalculationCanceledWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice_due_date_recalculation.canceled';
}

export namespace InvoiceDueDateRecalculationCanceledWebhookEvent {
  export interface Properties {
    canceled_at: string;

    started_at: string;
  }
}

/**
 * Issued when an invoice due date recalculation is completed.
 */
export interface InvoiceDueDateRecalculationCompletedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: InvoiceDueDateRecalculationCompletedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice_due_date_recalculation.completed';
}

export namespace InvoiceDueDateRecalculationCompletedWebhookEvent {
  export interface Properties {
    completed_at: string;

    started_at: string;
  }
}

/**
 * Issued when an invoice due date recalculation is started.
 */
export interface InvoiceDueDateRecalculationStartedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: InvoiceDueDateRecalculationStartedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'invoice_due_date_recalculation.started';
}

export namespace InvoiceDueDateRecalculationStartedWebhookEvent {
  export interface Properties {
    started_at: string;
  }
}

/**
 * Issued when metric events are dropped by watermark threshold.
 */
export interface MetricEventsDroppedByWatermarkWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * `window_start` and `window_end` are ISO-8601 strings rather than datetimes: the
   * untyped message called `.isoformat()` on them, so they keep microseconds where
   * the webhook JSON provider would have truncated them.
   */
  properties: MetricEventsDroppedByWatermarkWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'metric.events_dropped_by_watermark';
}

export namespace MetricEventsDroppedByWatermarkWebhookEvent {
  /**
   * `window_start` and `window_end` are ISO-8601 strings rather than datetimes: the
   * untyped message called `.isoformat()` on them, so they keep microseconds where
   * the webhook JSON provider would have truncated them.
   */
  export interface Properties {
    dropped: number;

    event_name: string;

    total: number;

    window_end: string;

    window_start: string;
  }
}

/**
 * Issued when a payment method is created.
 */
export interface PaymentMethodCreatedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * A payment method represents a customer's stored payment instrument held with an
   * external payment provider (such as Adyen or Stripe).
   *
   * The serialization is intentionally minimal for now; provider-pulled details
   * (e.g. card display metadata) will be added over time.
   */
  payment_method: PaymentMethodCreatedWebhookEvent.PaymentMethod;

  properties: unknown;

  /**
   * The event this payload describes.
   */
  type: 'payment_method.created';
}

export namespace PaymentMethodCreatedWebhookEvent {
  /**
   * A payment method represents a customer's stored payment instrument held with an
   * external payment provider (such as Adyen or Stripe).
   *
   * The serialization is intentionally minimal for now; provider-pulled details
   * (e.g. card display metadata) will be added over time.
   */
  export interface PaymentMethod {
    /**
     * The Orb-assigned unique identifier for the payment method.
     */
    id: string;

    /**
     * The time at which the payment method was created.
     */
    created_at: string;

    /**
     * The ID of the Orb customer this payment method is attached to.
     */
    customer_id: string;

    /**
     * Whether this is the customer's default payment method.
     */
    default: boolean;

    /**
     * The identifier of this payment method in the external payment provider.
     */
    external_payment_method_id: string;

    /**
     * The type of the underlying payment instrument, e.g. `card` or `us_bank_account`.
     */
    payment_method_type: 'card' | 'us_bank_account' | 'link' | 'amazon_pay' | 'crypto';

    /**
     * The external payment provider this method belongs to, derived from the linked
     * payment gateway connection (e.g. `adyen` or `stripe`). Null if the connection
     * has been removed.
     */
    provider_type: string | null;
  }
}

/**
 * Issued when a payment method is deleted.
 */
export interface PaymentMethodDeletedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * A payment method represents a customer's stored payment instrument held with an
   * external payment provider (such as Adyen or Stripe).
   *
   * The serialization is intentionally minimal for now; provider-pulled details
   * (e.g. card display metadata) will be added over time.
   */
  payment_method: PaymentMethodDeletedWebhookEvent.PaymentMethod;

  properties: unknown;

  /**
   * The event this payload describes.
   */
  type: 'payment_method.deleted';
}

export namespace PaymentMethodDeletedWebhookEvent {
  /**
   * A payment method represents a customer's stored payment instrument held with an
   * external payment provider (such as Adyen or Stripe).
   *
   * The serialization is intentionally minimal for now; provider-pulled details
   * (e.g. card display metadata) will be added over time.
   */
  export interface PaymentMethod {
    /**
     * The Orb-assigned unique identifier for the payment method.
     */
    id: string;

    /**
     * The time at which the payment method was created.
     */
    created_at: string;

    /**
     * The ID of the Orb customer this payment method is attached to.
     */
    customer_id: string;

    /**
     * Whether this is the customer's default payment method.
     */
    default: boolean;

    /**
     * The identifier of this payment method in the external payment provider.
     */
    external_payment_method_id: string;

    /**
     * The type of the underlying payment instrument, e.g. `card` or `us_bank_account`.
     */
    payment_method_type: 'card' | 'us_bank_account' | 'link' | 'amazon_pay' | 'crypto';

    /**
     * The external payment provider this method belongs to, derived from the linked
     * payment gateway connection (e.g. `adyen` or `stripe`). Null if the connection
     * has been removed.
     */
    provider_type: string | null;
  }
}

/**
 * Issued when a plan's default version is set.
 */
export interface PlanDefaultVersionSetWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  plan: PlanDefaultVersionSetWebhookEvent.Plan;

  properties: PlanDefaultVersionSetWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'plan.default_version_set';
}

export namespace PlanDefaultVersionSetWebhookEvent {
  export interface Plan {
    id: string | null;

    /**
     * An optional user-defined ID for this plan resource, used throughout the system
     * as an alias for this Plan. Use this field to identify a plan by an existing
     * identifier in your system.
     */
    external_plan_id: string | null;

    name: string | null;
  }

  export interface Properties {
    new_default_version_number: number;

    previous_default_version_number: number;
  }
}

/**
 * Issued when a new plan version is created.
 */
export interface PlanVersionCreatedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  plan: PlanVersionCreatedWebhookEvent.Plan;

  properties: PlanVersionCreatedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'plan.version_created';
}

export namespace PlanVersionCreatedWebhookEvent {
  export interface Plan {
    id: string | null;

    /**
     * An optional user-defined ID for this plan resource, used throughout the system
     * as an alias for this Plan. Use this field to identify a plan by an existing
     * identifier in your system.
     */
    external_plan_id: string | null;

    name: string | null;
  }

  export interface Properties {
    plan_version_description: string | null;

    plan_version_number: number;
  }
}

/**
 * Issued when a price is edited.
 */
export interface PriceEditedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * The Price resource represents a price that can be billed on a subscription,
   * resulting in a charge on an invoice in the form of an invoice line item. Prices
   * take a quantity and determine an amount to bill.
   *
   * Orb supports a few different pricing models out of the box. Each of these models
   * is serialized differently in a given Price object. The model_type field
   * determines the key for the configuration object that is present.
   *
   * For more on the types of prices, see
   * [the core concepts documentation](/core-concepts#plan-and-price)
   */
  price: Shared.Price;

  properties: PriceEditedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'price.edited';
}

export namespace PriceEditedWebhookEvent {
  export interface Properties {
    /**
     * metadata values are non-null on the wire (deleting a key removes it from
     * storage); the Optional[str] values only exist on the new half of a metadata
     * FieldChange.
     */
    previous_attributes: Properties.PreviousAttributes;
  }

  export namespace Properties {
    /**
     * metadata values are non-null on the wire (deleting a key removes it from
     * storage); the Optional[str] values only exist on the new half of a metadata
     * FieldChange.
     */
    export interface PreviousAttributes {
      metadata?: { [key: string]: string } | null;
    }
  }
}

/**
 * Issued when a test webhook is sent.
 */
export interface ResourceEventTestWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: ResourceEventTestWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'resource_event.test';
}

export namespace ResourceEventTestWebhookEvent {
  export interface Properties {
    message?: string;
  }
}

/**
 * Issued when a sales order accounting sync fails.
 */
export interface SalesOrderAccountingSyncFailedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  accounting_sync_record: SalesOrderAccountingSyncFailedWebhookEvent.AccountingSyncRecord;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: SalesOrderAccountingSyncFailedWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'sales_order.accounting_sync_failed';
}

export namespace SalesOrderAccountingSyncFailedWebhookEvent {
  export interface AccountingSyncRecord {
    id: string;

    customer_id: string;

    record_type:
      | 'customer'
      | 'invoice'
      | 'transaction'
      | 'customer_balance_transaction'
      | 'credit_note'
      | 'subscription'
      | 'sales_order'
      | 'block';

    error_details?: { [key: string]: unknown } | null;

    invoice_id?: string | null;

    provider_customer_id?: string | null;

    status?: string | null;

    sync_action?: string | null;
  }

  export interface Properties {
    connection_type: string;

    failure_reason: string;
  }
}

/**
 * Issued when a sales order accounting sync succeeds.
 */
export interface SalesOrderAccountingSyncSucceededWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  accounting_sync_record: SalesOrderAccountingSyncSucceededWebhookEvent.AccountingSyncRecord;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * An [`Invoice`](/core-concepts#invoice) is a fundamental billing entity,
   * representing the request for payment for a single subscription. This includes a
   * set of line items, which correspond to prices in the subscription's plan and can
   * represent fixed recurring fees or usage-based fees. They are generated at the
   * end of a billing period, or as the result of an action, such as a cancellation.
   */
  invoice: Shared.Invoice;

  properties: SalesOrderAccountingSyncSucceededWebhookEvent.Properties;

  /**
   * The event this payload describes.
   */
  type: 'sales_order.accounting_sync_succeeded';
}

export namespace SalesOrderAccountingSyncSucceededWebhookEvent {
  export interface AccountingSyncRecord {
    id: string;

    customer_id: string;

    record_type:
      | 'customer'
      | 'invoice'
      | 'transaction'
      | 'customer_balance_transaction'
      | 'credit_note'
      | 'subscription'
      | 'sales_order'
      | 'block';

    error_details?: { [key: string]: unknown } | null;

    invoice_id?: string | null;

    provider_customer_id?: string | null;

    status?: string | null;

    sync_action?: string | null;
  }

  export interface Properties {
    connection_type: string;
  }
}

/**
 * Issued when a subscription accounting sync fails.
 */
export interface SubscriptionAccountingSyncFailedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  accounting_sync_record: SubscriptionAccountingSyncFailedWebhookEvent.AccountingSyncRecord;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: SubscriptionAccountingSyncFailedWebhookEvent.Properties;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.accounting_sync_failed';
}

export namespace SubscriptionAccountingSyncFailedWebhookEvent {
  export interface AccountingSyncRecord {
    id: string;

    customer_id: string;

    record_type:
      | 'customer'
      | 'invoice'
      | 'transaction'
      | 'customer_balance_transaction'
      | 'credit_note'
      | 'subscription'
      | 'sales_order'
      | 'block';

    error_details?: { [key: string]: unknown } | null;

    provider_customer_id?: string | null;

    status?: string | null;

    subscription_id?: string | null;

    sync_action?: string | null;
  }

  export interface Properties {
    connection_type: string;

    failure_reason: string;
  }
}

/**
 * Issued when a subscription accounting sync succeeds.
 */
export interface SubscriptionAccountingSyncSucceededWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  accounting_sync_record: SubscriptionAccountingSyncSucceededWebhookEvent.AccountingSyncRecord;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: SubscriptionAccountingSyncSucceededWebhookEvent.Properties;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.accounting_sync_succeeded';
}

export namespace SubscriptionAccountingSyncSucceededWebhookEvent {
  export interface AccountingSyncRecord {
    id: string;

    customer_id: string;

    record_type:
      | 'customer'
      | 'invoice'
      | 'transaction'
      | 'customer_balance_transaction'
      | 'credit_note'
      | 'subscription'
      | 'sales_order'
      | 'block';

    error_details?: { [key: string]: unknown } | null;

    provider_customer_id?: string | null;

    status?: string | null;

    subscription_id?: string | null;

    sync_action?: string | null;
  }

  export interface Properties {
    connection_type: string;
  }
}

/**
 * Issued when an alert is automatically disabled by the system.
 */
export interface SubscriptionAlertDisabledWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * Sent when the system disables an alert on its own, currently for
   * cardinality-limit enforcement on grouped cost alerts.
   */
  properties: SubscriptionAlertDisabledWebhookEvent.Properties;

  /**
   * A lightweight subscription representation for webhook payloads.
   *
   * This avoids the expensive to_subscription_params() call required for full
   * serialization.
   */
  subscription: SubscriptionAlertDisabledWebhookEvent.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.alert_disabled';
}

export namespace SubscriptionAlertDisabledWebhookEvent {
  /**
   * Sent when the system disables an alert on its own, currently for
   * cardinality-limit enforcement on grouped cost alerts.
   */
  export interface Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    alert_configuration: Properties.AlertConfiguration;

    cardinality: number | null;

    cardinality_limit: number | null;

    reason: 'user' | 'system_cardinality_limit';
  }

  export namespace Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    export interface AlertConfiguration {
      /**
       * Also referred to as alert_id in this documentation.
       */
      id: string;

      /**
       * The creation time of the resource in Orb.
       */
      created_at: string;

      /**
       * The name of the currency the credit balance or invoice cost is denominated in.
       */
      currency: string | null;

      /**
       * The customer the alert applies to.
       */
      customer: Shared.CustomerMinified | null;

      /**
       * Whether the alert is enabled or disabled.
       */
      enabled: boolean;

      /**
       * The metric the alert applies to.
       */
      metric: AlertConfiguration.Metric | null;

      /**
       * The plan the alert applies to.
       */
      plan: AlertConfiguration.Plan | null;

      /**
       * The subscription the alert applies to.
       */
      subscription: Shared.SubscriptionMinified | null;

      /**
       * The thresholds that define the conditions under which the alert will be
       * triggered.
       */
      thresholds: Array<AlertConfiguration.Threshold> | null;

      /**
       * The type of alert. This must be a valid alert type.
       */
      type:
        | 'credit_balance_depleted'
        | 'credit_balance_dropped'
        | 'credit_balance_recovered'
        | 'usage_exceeded'
        | 'cost_exceeded'
        | 'spend_exceeded'
        | 'license_balance_threshold_reached';

      /**
       * The current status of the alert. This field is only present for credit balance
       * alerts.
       */
      balance_alert_status?: Array<AlertConfiguration.BalanceAlertStatus> | null;

      /**
       * The property keys to group cost alerts by. Only present for cost alerts with
       * grouping enabled.
       */
      grouping_keys?: Array<string> | null;

      /**
       * Minified license type for alert serialization.
       */
      license_type?: AlertConfiguration.LicenseType | null;

      /**
       * Filters scoping which prices are included in spend and grouped cost alert
       * evaluation. Alerts use the price_id, item_id, and price_type fields only; the
       * alert's pricing unit is reported by currency.
       */
      price_filters?: Array<AlertConfiguration.PriceFilter> | null;

      /**
       * Per-group threshold overrides. Each override maps a specific combination of
       * grouping_keys values to a replacement threshold list. Only present for grouped
       * cost alerts that have at least one override.
       */
      threshold_overrides?: Array<AlertConfiguration.ThresholdOverride> | null;
    }

    export namespace AlertConfiguration {
      /**
       * The metric the alert applies to.
       */
      export interface Metric {
        id: string;
      }

      /**
       * The plan the alert applies to.
       */
      export interface Plan {
        id: string | null;

        /**
         * An optional user-defined ID for this plan resource, used throughout the system
         * as an alias for this Plan. Use this field to identify a plan by an existing
         * identifier in your system.
         */
        external_plan_id: string | null;

        name: string | null;

        plan_version: string;
      }

      /**
       * Thresholds are used to define the conditions under which an alert will be
       * triggered.
       */
      export interface Threshold {
        /**
         * The value at which an alert will fire. For credit balance alerts, the alert will
         * fire at or below this value. For usage and cost alerts, the alert will fire at
         * or above this value.
         */
        value: string;
      }

      /**
       * Alert status is used to determine if an alert is currently in-alert or not.
       */
      export interface BalanceAlertStatus {
        /**
         * Whether the alert is currently in-alert or not.
         */
        in_alert: boolean;

        /**
         * The value of the threshold that defines the alert status.
         */
        threshold_value: string;
      }

      /**
       * Minified license type for alert serialization.
       */
      export interface LicenseType {
        id: string;
      }

      export interface PriceFilter {
        /**
         * The property of the price to filter on.
         */
        field: 'price_id' | 'item_id' | 'price_type' | 'currency' | 'pricing_unit_id';

        /**
         * Should prices that match the filter be included or excluded.
         */
        operator: 'includes' | 'excludes';

        /**
         * The IDs or values that match this filter.
         */
        values: Array<string>;
      }

      /**
       * A per-group threshold override on a grouped cost alert.
       *
       * An empty `thresholds` list means the group is silenced (never fires). A
       * non-empty list fully replaces the default thresholds for that group.
       */
      export interface ThresholdOverride {
        /**
         * The values identifying this group, ordered to match group_keys when set and the
         * alert's grouping_keys otherwise.
         */
        group_values: Array<string>;

        /**
         * The thresholds applied to this group. An empty list means the group is silenced.
         */
        thresholds: Array<ThresholdOverride.Threshold>;

        /**
         * The subset of the alert's grouping_keys this override binds. Null when the
         * override targets one exact group across every grouping key.
         */
        group_keys?: Array<string> | null;
      }

      export namespace ThresholdOverride {
        /**
         * Thresholds are used to define the conditions under which an alert will be
         * triggered.
         */
        export interface Threshold {
          /**
           * The value at which an alert will fire. For credit balance alerts, the alert will
           * fire at or below this value. For usage and cost alerts, the alert will fire at
           * or above this value.
           */
          value: string;
        }
      }
    }
  }

  /**
   * A lightweight subscription representation for webhook payloads.
   *
   * This avoids the expensive to_subscription_params() call required for full
   * serialization.
   */
  export interface Subscription {
    id: string;

    customer: Shared.CustomerMinified;

    end_date: string | null;

    plan: Subscription.Plan | null;

    start_date: string;

    status: 'active' | 'ended' | 'upcoming';
  }

  export namespace Subscription {
    export interface Plan {
      id: string | null;

      /**
       * An optional user-defined ID for this plan resource, used throughout the system
       * as an alias for this Plan. Use this field to identify a plan by an existing
       * identifier in your system.
       */
      external_plan_id: string | null;

      name: string | null;
    }
  }
}

/**
 * Issued when a subscription cancellation is scheduled.
 */
export interface SubscriptionCancellationScheduledWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: SubscriptionCancellationScheduledWebhookEvent.Properties;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.cancellation_scheduled';
}

export namespace SubscriptionCancellationScheduledWebhookEvent {
  export interface Properties {
    cancellation_date: string;
  }
}

/**
 * Issued when a scheduled subscription cancellation is unscheduled.
 */
export interface SubscriptionCancellationUnscheduledWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: SubscriptionCancellationUnscheduledWebhookEvent.Properties;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.cancellation_unscheduled';
}

export namespace SubscriptionCancellationUnscheduledWebhookEvent {
  export interface Properties {
    original_cancellation_date: string;
  }
}

/**
 * Issued when a subscription's cost exceeds a pre-configured amount threshold.
 */
export interface SubscriptionCostExceededWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: SubscriptionCostExceededWebhookEvent.Properties;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.cost_exceeded';
}

export namespace SubscriptionCostExceededWebhookEvent {
  export interface Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    alert_configuration: Properties.AlertConfiguration;

    amount_threshold: string | null;

    evaluated_amount: string | null;

    timeframe_end: string;

    timeframe_start: string;
  }

  export namespace Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    export interface AlertConfiguration {
      /**
       * Also referred to as alert_id in this documentation.
       */
      id: string;

      /**
       * The creation time of the resource in Orb.
       */
      created_at: string;

      /**
       * The name of the currency the credit balance or invoice cost is denominated in.
       */
      currency: string | null;

      /**
       * The customer the alert applies to.
       */
      customer: Shared.CustomerMinified | null;

      /**
       * Whether the alert is enabled or disabled.
       */
      enabled: boolean;

      /**
       * The metric the alert applies to.
       */
      metric: AlertConfiguration.Metric | null;

      /**
       * The plan the alert applies to.
       */
      plan: AlertConfiguration.Plan | null;

      /**
       * The subscription the alert applies to.
       */
      subscription: Shared.SubscriptionMinified | null;

      /**
       * The thresholds that define the conditions under which the alert will be
       * triggered.
       */
      thresholds: Array<AlertConfiguration.Threshold> | null;

      /**
       * The type of alert. This must be a valid alert type.
       */
      type:
        | 'credit_balance_depleted'
        | 'credit_balance_dropped'
        | 'credit_balance_recovered'
        | 'usage_exceeded'
        | 'cost_exceeded'
        | 'spend_exceeded'
        | 'license_balance_threshold_reached';

      /**
       * The current status of the alert. This field is only present for credit balance
       * alerts.
       */
      balance_alert_status?: Array<AlertConfiguration.BalanceAlertStatus> | null;

      /**
       * The property keys to group cost alerts by. Only present for cost alerts with
       * grouping enabled.
       */
      grouping_keys?: Array<string> | null;

      /**
       * Minified license type for alert serialization.
       */
      license_type?: AlertConfiguration.LicenseType | null;

      /**
       * Filters scoping which prices are included in spend and grouped cost alert
       * evaluation. Alerts use the price_id, item_id, and price_type fields only; the
       * alert's pricing unit is reported by currency.
       */
      price_filters?: Array<AlertConfiguration.PriceFilter> | null;

      /**
       * Per-group threshold overrides. Each override maps a specific combination of
       * grouping_keys values to a replacement threshold list. Only present for grouped
       * cost alerts that have at least one override.
       */
      threshold_overrides?: Array<AlertConfiguration.ThresholdOverride> | null;
    }

    export namespace AlertConfiguration {
      /**
       * The metric the alert applies to.
       */
      export interface Metric {
        id: string;
      }

      /**
       * The plan the alert applies to.
       */
      export interface Plan {
        id: string | null;

        /**
         * An optional user-defined ID for this plan resource, used throughout the system
         * as an alias for this Plan. Use this field to identify a plan by an existing
         * identifier in your system.
         */
        external_plan_id: string | null;

        name: string | null;

        plan_version: string;
      }

      /**
       * Thresholds are used to define the conditions under which an alert will be
       * triggered.
       */
      export interface Threshold {
        /**
         * The value at which an alert will fire. For credit balance alerts, the alert will
         * fire at or below this value. For usage and cost alerts, the alert will fire at
         * or above this value.
         */
        value: string;
      }

      /**
       * Alert status is used to determine if an alert is currently in-alert or not.
       */
      export interface BalanceAlertStatus {
        /**
         * Whether the alert is currently in-alert or not.
         */
        in_alert: boolean;

        /**
         * The value of the threshold that defines the alert status.
         */
        threshold_value: string;
      }

      /**
       * Minified license type for alert serialization.
       */
      export interface LicenseType {
        id: string;
      }

      export interface PriceFilter {
        /**
         * The property of the price to filter on.
         */
        field: 'price_id' | 'item_id' | 'price_type' | 'currency' | 'pricing_unit_id';

        /**
         * Should prices that match the filter be included or excluded.
         */
        operator: 'includes' | 'excludes';

        /**
         * The IDs or values that match this filter.
         */
        values: Array<string>;
      }

      /**
       * A per-group threshold override on a grouped cost alert.
       *
       * An empty `thresholds` list means the group is silenced (never fires). A
       * non-empty list fully replaces the default thresholds for that group.
       */
      export interface ThresholdOverride {
        /**
         * The values identifying this group, ordered to match group_keys when set and the
         * alert's grouping_keys otherwise.
         */
        group_values: Array<string>;

        /**
         * The thresholds applied to this group. An empty list means the group is silenced.
         */
        thresholds: Array<ThresholdOverride.Threshold>;

        /**
         * The subset of the alert's grouping_keys this override binds. Null when the
         * override targets one exact group across every grouping key.
         */
        group_keys?: Array<string> | null;
      }

      export namespace ThresholdOverride {
        /**
         * Thresholds are used to define the conditions under which an alert will be
         * triggered.
         */
        export interface Threshold {
          /**
           * The value at which an alert will fire. For credit balance alerts, the alert will
           * fire at or below this value. For usage and cost alerts, the alert will fire at
           * or above this value.
           */
          value: string;
        }
      }
    }
  }
}

/**
 * Issued when a subscription resource is created.
 */
export interface SubscriptionCreatedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: unknown;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.created';
}

/**
 * Issued when a subscription is updated.
 */
export interface SubscriptionEditedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: SubscriptionEditedWebhookEvent.Properties;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.edited';
}

export namespace SubscriptionEditedWebhookEvent {
  export interface Properties {
    previous_attributes: Properties.PreviousAttributes;
  }

  export namespace Properties {
    export interface PreviousAttributes {
      auto_collection?: boolean | null;

      auto_issuance?: boolean | null;

      default_invoice_memo?: string | null;

      invoicing_threshold?: string | null;

      metadata?: { [key: string]: string } | null;

      net_terms?: number | null;
    }
  }
}

/**
 * Issued whenever a customer's subscription ends/lapses.
 */
export interface SubscriptionEndedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: unknown;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.ended';
}

/**
 * Issued when a subscription's fixed fee quantity is updated.
 */
export interface SubscriptionFixedFeeQuantityUpdatedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: SubscriptionFixedFeeQuantityUpdatedWebhookEvent.Properties;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.fixed_fee_quantity_updated';
}

export namespace SubscriptionFixedFeeQuantityUpdatedWebhookEvent {
  export interface Properties {
    effective_date: string;

    new_quantity: number;

    old_quantity: number;

    price_id: string;
  }
}

/**
 * Issued when grouped subscription costs exceed a pre-configured amount threshold.
 */
export interface SubscriptionGroupedCostExceededWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * Every group that crossed a threshold for one alert, batched into a single
   * message.
   */
  properties: SubscriptionGroupedCostExceededWebhookEvent.Properties;

  /**
   * A lightweight subscription representation for webhook payloads.
   *
   * This avoids the expensive to_subscription_params() call required for full
   * serialization.
   */
  subscription: SubscriptionGroupedCostExceededWebhookEvent.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.grouped_cost_exceeded';
}

export namespace SubscriptionGroupedCostExceededWebhookEvent {
  /**
   * Every group that crossed a threshold for one alert, batched into a single
   * message.
   */
  export interface Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    alert_configuration: Properties.AlertConfiguration;

    grouping_keys: Array<string>;

    groups: Array<Properties.Group>;

    timeframe_end: string;

    timeframe_start: string;
  }

  export namespace Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    export interface AlertConfiguration {
      /**
       * Also referred to as alert_id in this documentation.
       */
      id: string;

      /**
       * The creation time of the resource in Orb.
       */
      created_at: string;

      /**
       * The name of the currency the credit balance or invoice cost is denominated in.
       */
      currency: string | null;

      /**
       * The customer the alert applies to.
       */
      customer: Shared.CustomerMinified | null;

      /**
       * Whether the alert is enabled or disabled.
       */
      enabled: boolean;

      /**
       * The metric the alert applies to.
       */
      metric: AlertConfiguration.Metric | null;

      /**
       * The plan the alert applies to.
       */
      plan: AlertConfiguration.Plan | null;

      /**
       * The subscription the alert applies to.
       */
      subscription: Shared.SubscriptionMinified | null;

      /**
       * The thresholds that define the conditions under which the alert will be
       * triggered.
       */
      thresholds: Array<AlertConfiguration.Threshold> | null;

      /**
       * The type of alert. This must be a valid alert type.
       */
      type:
        | 'credit_balance_depleted'
        | 'credit_balance_dropped'
        | 'credit_balance_recovered'
        | 'usage_exceeded'
        | 'cost_exceeded'
        | 'spend_exceeded'
        | 'license_balance_threshold_reached';

      /**
       * The current status of the alert. This field is only present for credit balance
       * alerts.
       */
      balance_alert_status?: Array<AlertConfiguration.BalanceAlertStatus> | null;

      /**
       * The property keys to group cost alerts by. Only present for cost alerts with
       * grouping enabled.
       */
      grouping_keys?: Array<string> | null;

      /**
       * Minified license type for alert serialization.
       */
      license_type?: AlertConfiguration.LicenseType | null;

      /**
       * Filters scoping which prices are included in spend and grouped cost alert
       * evaluation. Alerts use the price_id, item_id, and price_type fields only; the
       * alert's pricing unit is reported by currency.
       */
      price_filters?: Array<AlertConfiguration.PriceFilter> | null;

      /**
       * Per-group threshold overrides. Each override maps a specific combination of
       * grouping_keys values to a replacement threshold list. Only present for grouped
       * cost alerts that have at least one override.
       */
      threshold_overrides?: Array<AlertConfiguration.ThresholdOverride> | null;
    }

    export namespace AlertConfiguration {
      /**
       * The metric the alert applies to.
       */
      export interface Metric {
        id: string;
      }

      /**
       * The plan the alert applies to.
       */
      export interface Plan {
        id: string | null;

        /**
         * An optional user-defined ID for this plan resource, used throughout the system
         * as an alias for this Plan. Use this field to identify a plan by an existing
         * identifier in your system.
         */
        external_plan_id: string | null;

        name: string | null;

        plan_version: string;
      }

      /**
       * Thresholds are used to define the conditions under which an alert will be
       * triggered.
       */
      export interface Threshold {
        /**
         * The value at which an alert will fire. For credit balance alerts, the alert will
         * fire at or below this value. For usage and cost alerts, the alert will fire at
         * or above this value.
         */
        value: string;
      }

      /**
       * Alert status is used to determine if an alert is currently in-alert or not.
       */
      export interface BalanceAlertStatus {
        /**
         * Whether the alert is currently in-alert or not.
         */
        in_alert: boolean;

        /**
         * The value of the threshold that defines the alert status.
         */
        threshold_value: string;
      }

      /**
       * Minified license type for alert serialization.
       */
      export interface LicenseType {
        id: string;
      }

      export interface PriceFilter {
        /**
         * The property of the price to filter on.
         */
        field: 'price_id' | 'item_id' | 'price_type' | 'currency' | 'pricing_unit_id';

        /**
         * Should prices that match the filter be included or excluded.
         */
        operator: 'includes' | 'excludes';

        /**
         * The IDs or values that match this filter.
         */
        values: Array<string>;
      }

      /**
       * A per-group threshold override on a grouped cost alert.
       *
       * An empty `thresholds` list means the group is silenced (never fires). A
       * non-empty list fully replaces the default thresholds for that group.
       */
      export interface ThresholdOverride {
        /**
         * The values identifying this group, ordered to match group_keys when set and the
         * alert's grouping_keys otherwise.
         */
        group_values: Array<string>;

        /**
         * The thresholds applied to this group. An empty list means the group is silenced.
         */
        thresholds: Array<ThresholdOverride.Threshold>;

        /**
         * The subset of the alert's grouping_keys this override binds. Null when the
         * override targets one exact group across every grouping key.
         */
        group_keys?: Array<string> | null;
      }

      export namespace ThresholdOverride {
        /**
         * Thresholds are used to define the conditions under which an alert will be
         * triggered.
         */
        export interface Threshold {
          /**
           * The value at which an alert will fire. For credit balance alerts, the alert will
           * fire at or below this value. For usage and cost alerts, the alert will fire at
           * or above this value.
           */
          value: string;
        }
      }
    }

    export interface Group {
      amount_threshold: string | null;

      evaluated_amount: string | null;

      group_values: Array<string>;
    }
  }

  /**
   * A lightweight subscription representation for webhook payloads.
   *
   * This avoids the expensive to_subscription_params() call required for full
   * serialization.
   */
  export interface Subscription {
    id: string;

    customer: Shared.CustomerMinified;

    end_date: string | null;

    plan: Subscription.Plan | null;

    start_date: string;

    status: 'active' | 'ended' | 'upcoming';
  }

  export namespace Subscription {
    export interface Plan {
      id: string | null;

      /**
       * An optional user-defined ID for this plan resource, used throughout the system
       * as an alias for this Plan. Use this field to identify a plan by an existing
       * identifier in your system.
       */
      external_plan_id: string | null;

      name: string | null;
    }
  }
}

/**
 * Issued when a subscription's invoicing threshold is exceeded and an evaluation
 * is performed.
 */
export interface SubscriptionInvoicingThresholdExceededWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: SubscriptionInvoicingThresholdExceededWebhookEvent.Properties;

  /**
   * A lightweight subscription representation for webhook payloads.
   *
   * This avoids the expensive to_subscription_params() call required for full
   * serialization.
   */
  subscription: SubscriptionInvoicingThresholdExceededWebhookEvent.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.invoicing_threshold_exceeded';
}

export namespace SubscriptionInvoicingThresholdExceededWebhookEvent {
  export interface Properties {
    evaluated_amount: string;

    invoice_id: string;

    invoicing_threshold: string;

    threshold_invoice_created: boolean;
  }

  /**
   * A lightweight subscription representation for webhook payloads.
   *
   * This avoids the expensive to_subscription_params() call required for full
   * serialization.
   */
  export interface Subscription {
    id: string;

    customer: Shared.CustomerMinified;

    end_date: string | null;

    plan: Subscription.Plan | null;

    start_date: string;

    status: 'active' | 'ended' | 'upcoming';
  }

  export namespace Subscription {
    export interface Plan {
      id: string | null;

      /**
       * An optional user-defined ID for this plan resource, used throughout the system
       * as an alias for this Plan. Use this field to identify a plan by an existing
       * identifier in your system.
       */
      external_plan_id: string | null;

      name: string | null;
    }
  }
}

/**
 * Issued when a license allocation is reset.
 */
export interface SubscriptionLicenseAllocationResetWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * Fires at the start of a billing period when license allocations are replenished.
   * Allocations sharing a billing period are batched into one message.
   */
  properties: SubscriptionLicenseAllocationResetWebhookEvent.Properties;

  /**
   * A lightweight subscription representation for webhook payloads.
   *
   * This avoids the expensive to_subscription_params() call required for full
   * serialization.
   */
  subscription: SubscriptionLicenseAllocationResetWebhookEvent.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.license_allocation_reset';
}

export namespace SubscriptionLicenseAllocationResetWebhookEvent {
  /**
   * Fires at the start of a billing period when license allocations are replenished.
   * Allocations sharing a billing period are batched into one message.
   */
  export interface Properties {
    reset_allocations: Array<Properties.ResetAllocation>;

    timeframe_end: string;

    timeframe_start: string;
  }

  export namespace Properties {
    /**
     * A license allocation replenished at the start of a billing period.
     */
    export interface ResetAllocation {
      allocation_amount: string;

      license_type_id: string;

      pricing_unit_id: string;
    }
  }

  /**
   * A lightweight subscription representation for webhook payloads.
   *
   * This avoids the expensive to_subscription_params() call required for full
   * serialization.
   */
  export interface Subscription {
    id: string;

    customer: Shared.CustomerMinified;

    end_date: string | null;

    plan: Subscription.Plan | null;

    start_date: string;

    status: 'active' | 'ended' | 'upcoming';
  }

  export namespace Subscription {
    export interface Plan {
      id: string | null;

      /**
       * An optional user-defined ID for this plan resource, used throughout the system
       * as an alias for this Plan. Use this field to identify a plan by an existing
       * identifier in your system.
       */
      external_plan_id: string | null;

      name: string | null;
    }
  }
}

/**
 * Issued when a license balance threshold is reached.
 */
export interface SubscriptionLicenseBalanceThresholdReachedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  /**
   * Every license that crossed a threshold for one alert, batched into a single
   * message. For account-wide alerts the licenses may span several license types.
   */
  properties: SubscriptionLicenseBalanceThresholdReachedWebhookEvent.Properties;

  /**
   * A lightweight subscription representation for webhook payloads.
   *
   * This avoids the expensive to_subscription_params() call required for full
   * serialization.
   */
  subscription: SubscriptionLicenseBalanceThresholdReachedWebhookEvent.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.license_balance_threshold_reached';
}

export namespace SubscriptionLicenseBalanceThresholdReachedWebhookEvent {
  /**
   * Every license that crossed a threshold for one alert, batched into a single
   * message. For account-wide alerts the licenses may span several license types.
   */
  export interface Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    alert_configuration: Properties.AlertConfiguration;

    licenses: Array<Properties.License>;

    timeframe_end: string;

    timeframe_start: string;
  }

  export namespace Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    export interface AlertConfiguration {
      /**
       * Also referred to as alert_id in this documentation.
       */
      id: string;

      /**
       * The creation time of the resource in Orb.
       */
      created_at: string;

      /**
       * The name of the currency the credit balance or invoice cost is denominated in.
       */
      currency: string | null;

      /**
       * The customer the alert applies to.
       */
      customer: Shared.CustomerMinified | null;

      /**
       * Whether the alert is enabled or disabled.
       */
      enabled: boolean;

      /**
       * The metric the alert applies to.
       */
      metric: AlertConfiguration.Metric | null;

      /**
       * The plan the alert applies to.
       */
      plan: AlertConfiguration.Plan | null;

      /**
       * The subscription the alert applies to.
       */
      subscription: Shared.SubscriptionMinified | null;

      /**
       * The thresholds that define the conditions under which the alert will be
       * triggered.
       */
      thresholds: Array<AlertConfiguration.Threshold> | null;

      /**
       * The type of alert. This must be a valid alert type.
       */
      type:
        | 'credit_balance_depleted'
        | 'credit_balance_dropped'
        | 'credit_balance_recovered'
        | 'usage_exceeded'
        | 'cost_exceeded'
        | 'spend_exceeded'
        | 'license_balance_threshold_reached';

      /**
       * The current status of the alert. This field is only present for credit balance
       * alerts.
       */
      balance_alert_status?: Array<AlertConfiguration.BalanceAlertStatus> | null;

      /**
       * The property keys to group cost alerts by. Only present for cost alerts with
       * grouping enabled.
       */
      grouping_keys?: Array<string> | null;

      /**
       * Minified license type for alert serialization.
       */
      license_type?: AlertConfiguration.LicenseType | null;

      /**
       * Filters scoping which prices are included in spend and grouped cost alert
       * evaluation. Alerts use the price_id, item_id, and price_type fields only; the
       * alert's pricing unit is reported by currency.
       */
      price_filters?: Array<AlertConfiguration.PriceFilter> | null;

      /**
       * Per-group threshold overrides. Each override maps a specific combination of
       * grouping_keys values to a replacement threshold list. Only present for grouped
       * cost alerts that have at least one override.
       */
      threshold_overrides?: Array<AlertConfiguration.ThresholdOverride> | null;
    }

    export namespace AlertConfiguration {
      /**
       * The metric the alert applies to.
       */
      export interface Metric {
        id: string;
      }

      /**
       * The plan the alert applies to.
       */
      export interface Plan {
        id: string | null;

        /**
         * An optional user-defined ID for this plan resource, used throughout the system
         * as an alias for this Plan. Use this field to identify a plan by an existing
         * identifier in your system.
         */
        external_plan_id: string | null;

        name: string | null;

        plan_version: string;
      }

      /**
       * Thresholds are used to define the conditions under which an alert will be
       * triggered.
       */
      export interface Threshold {
        /**
         * The value at which an alert will fire. For credit balance alerts, the alert will
         * fire at or below this value. For usage and cost alerts, the alert will fire at
         * or above this value.
         */
        value: string;
      }

      /**
       * Alert status is used to determine if an alert is currently in-alert or not.
       */
      export interface BalanceAlertStatus {
        /**
         * Whether the alert is currently in-alert or not.
         */
        in_alert: boolean;

        /**
         * The value of the threshold that defines the alert status.
         */
        threshold_value: string;
      }

      /**
       * Minified license type for alert serialization.
       */
      export interface LicenseType {
        id: string;
      }

      export interface PriceFilter {
        /**
         * The property of the price to filter on.
         */
        field: 'price_id' | 'item_id' | 'price_type' | 'currency' | 'pricing_unit_id';

        /**
         * Should prices that match the filter be included or excluded.
         */
        operator: 'includes' | 'excludes';

        /**
         * The IDs or values that match this filter.
         */
        values: Array<string>;
      }

      /**
       * A per-group threshold override on a grouped cost alert.
       *
       * An empty `thresholds` list means the group is silenced (never fires). A
       * non-empty list fully replaces the default thresholds for that group.
       */
      export interface ThresholdOverride {
        /**
         * The values identifying this group, ordered to match group_keys when set and the
         * alert's grouping_keys otherwise.
         */
        group_values: Array<string>;

        /**
         * The thresholds applied to this group. An empty list means the group is silenced.
         */
        thresholds: Array<ThresholdOverride.Threshold>;

        /**
         * The subset of the alert's grouping_keys this override binds. Null when the
         * override targets one exact group across every grouping key.
         */
        group_keys?: Array<string> | null;
      }

      export namespace ThresholdOverride {
        /**
         * Thresholds are used to define the conditions under which an alert will be
         * triggered.
         */
        export interface Threshold {
          /**
           * The value at which an alert will fire. For credit balance alerts, the alert will
           * fire at or below this value. For usage and cost alerts, the alert will fire at
           * or above this value.
           */
          value: string;
        }
      }
    }

    export interface License {
      external_license_id: string;

      license_type_id: string;

      threshold_percentage: string;
    }
  }

  /**
   * A lightweight subscription representation for webhook payloads.
   *
   * This avoids the expensive to_subscription_params() call required for full
   * serialization.
   */
  export interface Subscription {
    id: string;

    customer: Shared.CustomerMinified;

    end_date: string | null;

    plan: Subscription.Plan | null;

    start_date: string;

    status: 'active' | 'ended' | 'upcoming';
  }

  export namespace Subscription {
    export interface Plan {
      id: string | null;

      /**
       * An optional user-defined ID for this plan resource, used throughout the system
       * as an alias for this Plan. Use this field to identify a plan by an existing
       * identifier in your system.
       */
      external_plan_id: string | null;

      name: string | null;
    }
  }
}

/**
 * Issued when a subscription plan change is scheduled.
 */
export interface SubscriptionPlanChangeScheduledWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: SubscriptionPlanChangeScheduledWebhookEvent.Properties;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.plan_change_scheduled';
}

export namespace SubscriptionPlanChangeScheduledWebhookEvent {
  export interface Properties {
    change_date: string;

    new_plan_id: string;

    previous_plan_id: string;
  }
}

/**
 * Issued when a subscription transitions from one plan to a different plan.
 */
export interface SubscriptionPlanChangedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: SubscriptionPlanChangedWebhookEvent.Properties;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.plan_changed';
}

export namespace SubscriptionPlanChangedWebhookEvent {
  export interface Properties {
    previous_plan_id: string;
  }
}

/**
 * Issued when a subscription plan version change is scheduled.
 */
export interface SubscriptionPlanVersionChangeScheduledWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: SubscriptionPlanVersionChangeScheduledWebhookEvent.Properties;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.plan_version_change_scheduled';
}

export namespace SubscriptionPlanVersionChangeScheduledWebhookEvent {
  export interface Properties {
    effective_date: string;

    new_plan_version_number: number;

    previous_plan_version_number: number;
  }
}

/**
 * Issued when a subscription plan version has changed.
 */
export interface SubscriptionPlanVersionChangedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: SubscriptionPlanVersionChangedWebhookEvent.Properties;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.plan_version_changed';
}

export namespace SubscriptionPlanVersionChangedWebhookEvent {
  export interface Properties {
    effective_date: string;

    new_plan_version_number: number;

    previous_plan_version_number: number;
  }
}

/**
 * Issued when a subscription's rated spend, before credits and adjustments,
 * exceeds a pre-configured amount threshold.
 */
export interface SubscriptionSpendExceededWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: SubscriptionSpendExceededWebhookEvent.Properties;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.spend_exceeded';
}

export namespace SubscriptionSpendExceededWebhookEvent {
  export interface Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    alert_configuration: Properties.AlertConfiguration;

    amount_threshold: string | null;

    evaluated_amount: string | null;

    timeframe_end: string;

    timeframe_start: string;
  }

  export namespace Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    export interface AlertConfiguration {
      /**
       * Also referred to as alert_id in this documentation.
       */
      id: string;

      /**
       * The creation time of the resource in Orb.
       */
      created_at: string;

      /**
       * The name of the currency the credit balance or invoice cost is denominated in.
       */
      currency: string | null;

      /**
       * The customer the alert applies to.
       */
      customer: Shared.CustomerMinified | null;

      /**
       * Whether the alert is enabled or disabled.
       */
      enabled: boolean;

      /**
       * The metric the alert applies to.
       */
      metric: AlertConfiguration.Metric | null;

      /**
       * The plan the alert applies to.
       */
      plan: AlertConfiguration.Plan | null;

      /**
       * The subscription the alert applies to.
       */
      subscription: Shared.SubscriptionMinified | null;

      /**
       * The thresholds that define the conditions under which the alert will be
       * triggered.
       */
      thresholds: Array<AlertConfiguration.Threshold> | null;

      /**
       * The type of alert. This must be a valid alert type.
       */
      type:
        | 'credit_balance_depleted'
        | 'credit_balance_dropped'
        | 'credit_balance_recovered'
        | 'usage_exceeded'
        | 'cost_exceeded'
        | 'spend_exceeded'
        | 'license_balance_threshold_reached';

      /**
       * The current status of the alert. This field is only present for credit balance
       * alerts.
       */
      balance_alert_status?: Array<AlertConfiguration.BalanceAlertStatus> | null;

      /**
       * The property keys to group cost alerts by. Only present for cost alerts with
       * grouping enabled.
       */
      grouping_keys?: Array<string> | null;

      /**
       * Minified license type for alert serialization.
       */
      license_type?: AlertConfiguration.LicenseType | null;

      /**
       * Filters scoping which prices are included in spend and grouped cost alert
       * evaluation. Alerts use the price_id, item_id, and price_type fields only; the
       * alert's pricing unit is reported by currency.
       */
      price_filters?: Array<AlertConfiguration.PriceFilter> | null;

      /**
       * Per-group threshold overrides. Each override maps a specific combination of
       * grouping_keys values to a replacement threshold list. Only present for grouped
       * cost alerts that have at least one override.
       */
      threshold_overrides?: Array<AlertConfiguration.ThresholdOverride> | null;
    }

    export namespace AlertConfiguration {
      /**
       * The metric the alert applies to.
       */
      export interface Metric {
        id: string;
      }

      /**
       * The plan the alert applies to.
       */
      export interface Plan {
        id: string | null;

        /**
         * An optional user-defined ID for this plan resource, used throughout the system
         * as an alias for this Plan. Use this field to identify a plan by an existing
         * identifier in your system.
         */
        external_plan_id: string | null;

        name: string | null;

        plan_version: string;
      }

      /**
       * Thresholds are used to define the conditions under which an alert will be
       * triggered.
       */
      export interface Threshold {
        /**
         * The value at which an alert will fire. For credit balance alerts, the alert will
         * fire at or below this value. For usage and cost alerts, the alert will fire at
         * or above this value.
         */
        value: string;
      }

      /**
       * Alert status is used to determine if an alert is currently in-alert or not.
       */
      export interface BalanceAlertStatus {
        /**
         * Whether the alert is currently in-alert or not.
         */
        in_alert: boolean;

        /**
         * The value of the threshold that defines the alert status.
         */
        threshold_value: string;
      }

      /**
       * Minified license type for alert serialization.
       */
      export interface LicenseType {
        id: string;
      }

      export interface PriceFilter {
        /**
         * The property of the price to filter on.
         */
        field: 'price_id' | 'item_id' | 'price_type' | 'currency' | 'pricing_unit_id';

        /**
         * Should prices that match the filter be included or excluded.
         */
        operator: 'includes' | 'excludes';

        /**
         * The IDs or values that match this filter.
         */
        values: Array<string>;
      }

      /**
       * A per-group threshold override on a grouped cost alert.
       *
       * An empty `thresholds` list means the group is silenced (never fires). A
       * non-empty list fully replaces the default thresholds for that group.
       */
      export interface ThresholdOverride {
        /**
         * The values identifying this group, ordered to match group_keys when set and the
         * alert's grouping_keys otherwise.
         */
        group_values: Array<string>;

        /**
         * The thresholds applied to this group. An empty list means the group is silenced.
         */
        thresholds: Array<ThresholdOverride.Threshold>;

        /**
         * The subset of the alert's grouping_keys this override binds. Null when the
         * override targets one exact group across every grouping key.
         */
        group_keys?: Array<string> | null;
      }

      export namespace ThresholdOverride {
        /**
         * Thresholds are used to define the conditions under which an alert will be
         * triggered.
         */
        export interface Threshold {
          /**
           * The value at which an alert will fire. For credit balance alerts, the alert will
           * fire at or below this value. For usage and cost alerts, the alert will fire at
           * or above this value.
           */
          value: string;
        }
      }
    }
  }
}

/**
 * Issued when a subscription begins.
 */
export interface SubscriptionStartedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: unknown;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.started';
}

/**
 * Issued when a subscription trial ends.
 */
export interface SubscriptionTrialEndedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: unknown;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.trial_ended';
}

/**
 * Issued when a billable metric in a subscription exceeds a pre-configured
 * quantity threshold.
 */
export interface SubscriptionUsageExceededWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: SubscriptionUsageExceededWebhookEvent.Properties;

  /**
   * A [subscription](/core-concepts#subscription) represents the purchase of a plan
   * by a customer.
   *
   * By default, subscriptions begin on the day that they're created and renew
   * automatically for each billing cycle at the cadence that's configured in the
   * plan definition.
   *
   * Subscriptions also default to **beginning of month alignment**, which means the
   * first invoice issued for the subscription will have pro-rated charges between
   * the `start_date` and the first of the following month. Subsequent billing
   * periods will always start and end on a month boundary (e.g. subsequent month
   * starts for monthly billing).
   *
   * Depending on the plan configuration, any _flat_ recurring fees will be billed
   * either at the beginning (in-advance) or end (in-arrears) of each billing cycle.
   * Plans default to **in-advance billing**. Usage-based fees are billed in arrears
   * as usage is accumulated. In the normal course of events, you can expect an
   * invoice to contain usage-based charges for the previous period, and a recurring
   * fee for the following period.
   */
  subscription: SubscriptionsAPI.Subscription;

  /**
   * The event this payload describes.
   */
  type: 'subscription.usage_exceeded';
}

export namespace SubscriptionUsageExceededWebhookEvent {
  export interface Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    alert_configuration: Properties.AlertConfiguration;

    billable_metric_id: string;

    evaluated_quantity: number | null;

    quantity_threshold: number | null;

    timeframe_end: string;

    timeframe_start: string;
  }

  export namespace Properties {
    /**
     * [Alerts within Orb](/product-catalog/configuring-alerts) monitor spending,
     * usage, or credit balance and trigger webhooks when a threshold is exceeded.
     *
     * Alerts created through the API can be scoped to either customers or
     * subscriptions.
     */
    export interface AlertConfiguration {
      /**
       * Also referred to as alert_id in this documentation.
       */
      id: string;

      /**
       * The creation time of the resource in Orb.
       */
      created_at: string;

      /**
       * The name of the currency the credit balance or invoice cost is denominated in.
       */
      currency: string | null;

      /**
       * The customer the alert applies to.
       */
      customer: Shared.CustomerMinified | null;

      /**
       * Whether the alert is enabled or disabled.
       */
      enabled: boolean;

      /**
       * The metric the alert applies to.
       */
      metric: AlertConfiguration.Metric | null;

      /**
       * The plan the alert applies to.
       */
      plan: AlertConfiguration.Plan | null;

      /**
       * The subscription the alert applies to.
       */
      subscription: Shared.SubscriptionMinified | null;

      /**
       * The thresholds that define the conditions under which the alert will be
       * triggered.
       */
      thresholds: Array<AlertConfiguration.Threshold> | null;

      /**
       * The type of alert. This must be a valid alert type.
       */
      type:
        | 'credit_balance_depleted'
        | 'credit_balance_dropped'
        | 'credit_balance_recovered'
        | 'usage_exceeded'
        | 'cost_exceeded'
        | 'spend_exceeded'
        | 'license_balance_threshold_reached';

      /**
       * The current status of the alert. This field is only present for credit balance
       * alerts.
       */
      balance_alert_status?: Array<AlertConfiguration.BalanceAlertStatus> | null;

      /**
       * The property keys to group cost alerts by. Only present for cost alerts with
       * grouping enabled.
       */
      grouping_keys?: Array<string> | null;

      /**
       * Minified license type for alert serialization.
       */
      license_type?: AlertConfiguration.LicenseType | null;

      /**
       * Filters scoping which prices are included in spend and grouped cost alert
       * evaluation. Alerts use the price_id, item_id, and price_type fields only; the
       * alert's pricing unit is reported by currency.
       */
      price_filters?: Array<AlertConfiguration.PriceFilter> | null;

      /**
       * Per-group threshold overrides. Each override maps a specific combination of
       * grouping_keys values to a replacement threshold list. Only present for grouped
       * cost alerts that have at least one override.
       */
      threshold_overrides?: Array<AlertConfiguration.ThresholdOverride> | null;
    }

    export namespace AlertConfiguration {
      /**
       * The metric the alert applies to.
       */
      export interface Metric {
        id: string;
      }

      /**
       * The plan the alert applies to.
       */
      export interface Plan {
        id: string | null;

        /**
         * An optional user-defined ID for this plan resource, used throughout the system
         * as an alias for this Plan. Use this field to identify a plan by an existing
         * identifier in your system.
         */
        external_plan_id: string | null;

        name: string | null;

        plan_version: string;
      }

      /**
       * Thresholds are used to define the conditions under which an alert will be
       * triggered.
       */
      export interface Threshold {
        /**
         * The value at which an alert will fire. For credit balance alerts, the alert will
         * fire at or below this value. For usage and cost alerts, the alert will fire at
         * or above this value.
         */
        value: string;
      }

      /**
       * Alert status is used to determine if an alert is currently in-alert or not.
       */
      export interface BalanceAlertStatus {
        /**
         * Whether the alert is currently in-alert or not.
         */
        in_alert: boolean;

        /**
         * The value of the threshold that defines the alert status.
         */
        threshold_value: string;
      }

      /**
       * Minified license type for alert serialization.
       */
      export interface LicenseType {
        id: string;
      }

      export interface PriceFilter {
        /**
         * The property of the price to filter on.
         */
        field: 'price_id' | 'item_id' | 'price_type' | 'currency' | 'pricing_unit_id';

        /**
         * Should prices that match the filter be included or excluded.
         */
        operator: 'includes' | 'excludes';

        /**
         * The IDs or values that match this filter.
         */
        values: Array<string>;
      }

      /**
       * A per-group threshold override on a grouped cost alert.
       *
       * An empty `thresholds` list means the group is silenced (never fires). A
       * non-empty list fully replaces the default thresholds for that group.
       */
      export interface ThresholdOverride {
        /**
         * The values identifying this group, ordered to match group_keys when set and the
         * alert's grouping_keys otherwise.
         */
        group_values: Array<string>;

        /**
         * The thresholds applied to this group. An empty list means the group is silenced.
         */
        thresholds: Array<ThresholdOverride.Threshold>;

        /**
         * The subset of the alert's grouping_keys this override binds. Null when the
         * override targets one exact group across every grouping key.
         */
        group_keys?: Array<string> | null;
      }

      export namespace ThresholdOverride {
        /**
         * Thresholds are used to define the conditions under which an alert will be
         * triggered.
         */
        export interface Threshold {
          /**
           * The value at which an alert will fire. For credit balance alerts, the alert will
           * fire at or below this value. For usage and cost alerts, the alert will fire at
           * or above this value.
           */
          value: string;
        }
      }
    }
  }
}

/**
 * Issued when a transaction accounting sync fails.
 */
export interface TransactionAccountingSyncFailedWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  accounting_sync_record: TransactionAccountingSyncFailedWebhookEvent.AccountingSyncRecord;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: TransactionAccountingSyncFailedWebhookEvent.Properties;

  transaction: TransactionAccountingSyncFailedWebhookEvent.Transaction;

  /**
   * The event this payload describes.
   */
  type: 'transaction.accounting_sync_failed';
}

export namespace TransactionAccountingSyncFailedWebhookEvent {
  export interface AccountingSyncRecord {
    id: string;

    customer_id: string;

    record_type:
      | 'customer'
      | 'invoice'
      | 'transaction'
      | 'customer_balance_transaction'
      | 'credit_note'
      | 'subscription'
      | 'sales_order'
      | 'block';

    error_details?: { [key: string]: unknown } | null;

    provider_customer_id?: string | null;

    status?: string | null;

    sync_action?: string | null;

    transaction_record_id?: string | null;
  }

  export interface Properties {
    connection_type: string;

    failure_reason: string;
  }

  export interface Transaction {
    /**
     * The ID of the payment attempt.
     */
    id: string;

    /**
     * The amount of the payment attempt.
     */
    amount: string;

    /**
     * The time at which the payment attempt was created.
     */
    created_at: string;

    /**
     * The payment provider that attempted to collect the payment.
     */
    payment_provider: 'stripe' | 'adyen' | null;

    /**
     * The ID of the payment attempt in the payment provider.
     */
    payment_provider_id: string | null;

    /**
     * URL to the downloadable PDF version of the receipt. This field will be `null`
     * for payment attempts that did not succeed.
     */
    receipt_pdf: string | null;

    /**
     * Whether the payment attempt succeeded.
     */
    succeeded: boolean;
  }
}

/**
 * Issued when a transaction accounting sync succeeds.
 */
export interface TransactionAccountingSyncSucceededWebhookEvent {
  /**
   * The ID of this webhook event.
   */
  id: string;

  accounting_sync_record: TransactionAccountingSyncSucceededWebhookEvent.AccountingSyncRecord;

  /**
   * The time at which this event was created, to the second.
   */
  created_at: string;

  properties: TransactionAccountingSyncSucceededWebhookEvent.Properties;

  transaction: TransactionAccountingSyncSucceededWebhookEvent.Transaction;

  /**
   * The event this payload describes.
   */
  type: 'transaction.accounting_sync_succeeded';
}

export namespace TransactionAccountingSyncSucceededWebhookEvent {
  export interface AccountingSyncRecord {
    id: string;

    customer_id: string;

    record_type:
      | 'customer'
      | 'invoice'
      | 'transaction'
      | 'customer_balance_transaction'
      | 'credit_note'
      | 'subscription'
      | 'sales_order'
      | 'block';

    error_details?: { [key: string]: unknown } | null;

    provider_customer_id?: string | null;

    status?: string | null;

    sync_action?: string | null;

    transaction_record_id?: string | null;
  }

  export interface Properties {
    connection_type: string;
  }

  export interface Transaction {
    /**
     * The ID of the payment attempt.
     */
    id: string;

    /**
     * The amount of the payment attempt.
     */
    amount: string;

    /**
     * The time at which the payment attempt was created.
     */
    created_at: string;

    /**
     * The payment provider that attempted to collect the payment.
     */
    payment_provider: 'stripe' | 'adyen' | null;

    /**
     * The ID of the payment attempt in the payment provider.
     */
    payment_provider_id: string | null;

    /**
     * URL to the downloadable PDF version of the receipt. This field will be `null`
     * for payment attempts that did not succeed.
     */
    receipt_pdf: string | null;

    /**
     * Whether the payment attempt succeeded.
     */
    succeeded: boolean;
  }
}

/**
 * Issued when a backfill is closed and its events are reflected into usage.
 */
export type UnwrapWebhookEvent =
  | BackfillReflectedWebhookEvent
  | BackfillRevertedWebhookEvent
  | BillableMetricEditedWebhookEvent
  | CreditBlockAccountingSyncFailedWebhookEvent
  | CreditBlockAccountingSyncSucceededWebhookEvent
  | CreditNoteAccountingSyncFailedWebhookEvent
  | CreditNoteAccountingSyncSucceededWebhookEvent
  | CreditNoteIssuedWebhookEvent
  | CreditNoteMarkedAsVoidWebhookEvent
  | CustomerAccountingSyncFailedWebhookEvent
  | CustomerAccountingSyncSucceededWebhookEvent
  | CustomerBalanceTransactionCreatedWebhookEvent
  | CustomerCreatedWebhookEvent
  | CustomerCreditBalanceDepletedWebhookEvent
  | CustomerCreditBalanceDroppedWebhookEvent
  | CustomerCreditBalanceRecoveredWebhookEvent
  | CustomerCreditLedgerIncrementedWebhookEvent
  | CustomerEditedWebhookEvent
  | DataExportsTransferErrorWebhookEvent
  | DataExportsTransferSuccessWebhookEvent
  | EventUnmatchedEventWebhookEvent
  | IngestionUnmatchedCustomerIDsWebhookEvent
  | InvoiceAccountingSyncFailedWebhookEvent
  | InvoiceAccountingSyncSucceededWebhookEvent
  | InvoiceAutomationScheduleStepExecutedWebhookEvent
  | InvoiceCostDataExportedWebhookEvent
  | InvoiceDunningScheduleCreatedWebhookEvent
  | InvoiceDunningScheduleEndedWebhookEvent
  | InvoiceDunningScheduleResetWebhookEvent
  | InvoiceDunningScheduleStepExecutedWebhookEvent
  | InvoiceEditedWebhookEvent
  | InvoiceInvoiceDateElapsedWebhookEvent
  | InvoiceIssueFailedWebhookEvent
  | InvoiceIssuedWebhookEvent
  | InvoiceIssuedSummaryWebhookEvent
  | InvoiceManuallyMarkedAsPaidWebhookEvent
  | InvoiceManuallyMarkedAsVoidWebhookEvent
  | InvoicePaymentFailedWebhookEvent
  | InvoicePaymentProcessingWebhookEvent
  | InvoicePaymentSucceededWebhookEvent
  | InvoiceSyncFailedWebhookEvent
  | InvoiceSyncSucceededWebhookEvent
  | InvoiceUndoMarkAsPaidWebhookEvent
  | InvoiceDueDateRecalculationCanceledWebhookEvent
  | InvoiceDueDateRecalculationCompletedWebhookEvent
  | InvoiceDueDateRecalculationStartedWebhookEvent
  | MetricEventsDroppedByWatermarkWebhookEvent
  | PaymentMethodCreatedWebhookEvent
  | PaymentMethodDeletedWebhookEvent
  | PlanDefaultVersionSetWebhookEvent
  | PlanVersionCreatedWebhookEvent
  | PriceEditedWebhookEvent
  | ResourceEventTestWebhookEvent
  | SalesOrderAccountingSyncFailedWebhookEvent
  | SalesOrderAccountingSyncSucceededWebhookEvent
  | SubscriptionAccountingSyncFailedWebhookEvent
  | SubscriptionAccountingSyncSucceededWebhookEvent
  | SubscriptionAlertDisabledWebhookEvent
  | SubscriptionCancellationScheduledWebhookEvent
  | SubscriptionCancellationUnscheduledWebhookEvent
  | SubscriptionCostExceededWebhookEvent
  | SubscriptionCreatedWebhookEvent
  | SubscriptionEditedWebhookEvent
  | SubscriptionEndedWebhookEvent
  | SubscriptionFixedFeeQuantityUpdatedWebhookEvent
  | SubscriptionGroupedCostExceededWebhookEvent
  | SubscriptionInvoicingThresholdExceededWebhookEvent
  | SubscriptionLicenseAllocationResetWebhookEvent
  | SubscriptionLicenseBalanceThresholdReachedWebhookEvent
  | SubscriptionPlanChangeScheduledWebhookEvent
  | SubscriptionPlanChangedWebhookEvent
  | SubscriptionPlanVersionChangeScheduledWebhookEvent
  | SubscriptionPlanVersionChangedWebhookEvent
  | SubscriptionSpendExceededWebhookEvent
  | SubscriptionStartedWebhookEvent
  | SubscriptionTrialEndedWebhookEvent
  | SubscriptionUsageExceededWebhookEvent
  | TransactionAccountingSyncFailedWebhookEvent
  | TransactionAccountingSyncSucceededWebhookEvent;

export declare namespace Webhooks {
  export {
    type BackfillReflectedWebhookEvent as BackfillReflectedWebhookEvent,
    type BackfillRevertedWebhookEvent as BackfillRevertedWebhookEvent,
    type BillableMetricEditedWebhookEvent as BillableMetricEditedWebhookEvent,
    type CreditBlockAccountingSyncFailedWebhookEvent as CreditBlockAccountingSyncFailedWebhookEvent,
    type CreditBlockAccountingSyncSucceededWebhookEvent as CreditBlockAccountingSyncSucceededWebhookEvent,
    type CreditNoteAccountingSyncFailedWebhookEvent as CreditNoteAccountingSyncFailedWebhookEvent,
    type CreditNoteAccountingSyncSucceededWebhookEvent as CreditNoteAccountingSyncSucceededWebhookEvent,
    type CreditNoteIssuedWebhookEvent as CreditNoteIssuedWebhookEvent,
    type CreditNoteMarkedAsVoidWebhookEvent as CreditNoteMarkedAsVoidWebhookEvent,
    type CustomerAccountingSyncFailedWebhookEvent as CustomerAccountingSyncFailedWebhookEvent,
    type CustomerAccountingSyncSucceededWebhookEvent as CustomerAccountingSyncSucceededWebhookEvent,
    type CustomerBalanceTransactionCreatedWebhookEvent as CustomerBalanceTransactionCreatedWebhookEvent,
    type CustomerCreatedWebhookEvent as CustomerCreatedWebhookEvent,
    type CustomerCreditBalanceDepletedWebhookEvent as CustomerCreditBalanceDepletedWebhookEvent,
    type CustomerCreditBalanceDroppedWebhookEvent as CustomerCreditBalanceDroppedWebhookEvent,
    type CustomerCreditBalanceRecoveredWebhookEvent as CustomerCreditBalanceRecoveredWebhookEvent,
    type CustomerCreditLedgerIncrementedWebhookEvent as CustomerCreditLedgerIncrementedWebhookEvent,
    type CustomerEditedWebhookEvent as CustomerEditedWebhookEvent,
    type DataExportsTransferErrorWebhookEvent as DataExportsTransferErrorWebhookEvent,
    type DataExportsTransferSuccessWebhookEvent as DataExportsTransferSuccessWebhookEvent,
    type EventUnmatchedEventWebhookEvent as EventUnmatchedEventWebhookEvent,
    type IngestionUnmatchedCustomerIDsWebhookEvent as IngestionUnmatchedCustomerIDsWebhookEvent,
    type InvoiceAccountingSyncFailedWebhookEvent as InvoiceAccountingSyncFailedWebhookEvent,
    type InvoiceAccountingSyncSucceededWebhookEvent as InvoiceAccountingSyncSucceededWebhookEvent,
    type InvoiceAutomationScheduleStepExecutedWebhookEvent as InvoiceAutomationScheduleStepExecutedWebhookEvent,
    type InvoiceCostDataExportedWebhookEvent as InvoiceCostDataExportedWebhookEvent,
    type InvoiceDunningScheduleCreatedWebhookEvent as InvoiceDunningScheduleCreatedWebhookEvent,
    type InvoiceDunningScheduleEndedWebhookEvent as InvoiceDunningScheduleEndedWebhookEvent,
    type InvoiceDunningScheduleResetWebhookEvent as InvoiceDunningScheduleResetWebhookEvent,
    type InvoiceDunningScheduleStepExecutedWebhookEvent as InvoiceDunningScheduleStepExecutedWebhookEvent,
    type InvoiceEditedWebhookEvent as InvoiceEditedWebhookEvent,
    type InvoiceInvoiceDateElapsedWebhookEvent as InvoiceInvoiceDateElapsedWebhookEvent,
    type InvoiceIssueFailedWebhookEvent as InvoiceIssueFailedWebhookEvent,
    type InvoiceIssuedWebhookEvent as InvoiceIssuedWebhookEvent,
    type InvoiceIssuedSummaryWebhookEvent as InvoiceIssuedSummaryWebhookEvent,
    type InvoiceManuallyMarkedAsPaidWebhookEvent as InvoiceManuallyMarkedAsPaidWebhookEvent,
    type InvoiceManuallyMarkedAsVoidWebhookEvent as InvoiceManuallyMarkedAsVoidWebhookEvent,
    type InvoicePaymentFailedWebhookEvent as InvoicePaymentFailedWebhookEvent,
    type InvoicePaymentProcessingWebhookEvent as InvoicePaymentProcessingWebhookEvent,
    type InvoicePaymentSucceededWebhookEvent as InvoicePaymentSucceededWebhookEvent,
    type InvoiceSyncFailedWebhookEvent as InvoiceSyncFailedWebhookEvent,
    type InvoiceSyncSucceededWebhookEvent as InvoiceSyncSucceededWebhookEvent,
    type InvoiceUndoMarkAsPaidWebhookEvent as InvoiceUndoMarkAsPaidWebhookEvent,
    type InvoiceDueDateRecalculationCanceledWebhookEvent as InvoiceDueDateRecalculationCanceledWebhookEvent,
    type InvoiceDueDateRecalculationCompletedWebhookEvent as InvoiceDueDateRecalculationCompletedWebhookEvent,
    type InvoiceDueDateRecalculationStartedWebhookEvent as InvoiceDueDateRecalculationStartedWebhookEvent,
    type MetricEventsDroppedByWatermarkWebhookEvent as MetricEventsDroppedByWatermarkWebhookEvent,
    type PaymentMethodCreatedWebhookEvent as PaymentMethodCreatedWebhookEvent,
    type PaymentMethodDeletedWebhookEvent as PaymentMethodDeletedWebhookEvent,
    type PlanDefaultVersionSetWebhookEvent as PlanDefaultVersionSetWebhookEvent,
    type PlanVersionCreatedWebhookEvent as PlanVersionCreatedWebhookEvent,
    type PriceEditedWebhookEvent as PriceEditedWebhookEvent,
    type ResourceEventTestWebhookEvent as ResourceEventTestWebhookEvent,
    type SalesOrderAccountingSyncFailedWebhookEvent as SalesOrderAccountingSyncFailedWebhookEvent,
    type SalesOrderAccountingSyncSucceededWebhookEvent as SalesOrderAccountingSyncSucceededWebhookEvent,
    type SubscriptionAccountingSyncFailedWebhookEvent as SubscriptionAccountingSyncFailedWebhookEvent,
    type SubscriptionAccountingSyncSucceededWebhookEvent as SubscriptionAccountingSyncSucceededWebhookEvent,
    type SubscriptionAlertDisabledWebhookEvent as SubscriptionAlertDisabledWebhookEvent,
    type SubscriptionCancellationScheduledWebhookEvent as SubscriptionCancellationScheduledWebhookEvent,
    type SubscriptionCancellationUnscheduledWebhookEvent as SubscriptionCancellationUnscheduledWebhookEvent,
    type SubscriptionCostExceededWebhookEvent as SubscriptionCostExceededWebhookEvent,
    type SubscriptionCreatedWebhookEvent as SubscriptionCreatedWebhookEvent,
    type SubscriptionEditedWebhookEvent as SubscriptionEditedWebhookEvent,
    type SubscriptionEndedWebhookEvent as SubscriptionEndedWebhookEvent,
    type SubscriptionFixedFeeQuantityUpdatedWebhookEvent as SubscriptionFixedFeeQuantityUpdatedWebhookEvent,
    type SubscriptionGroupedCostExceededWebhookEvent as SubscriptionGroupedCostExceededWebhookEvent,
    type SubscriptionInvoicingThresholdExceededWebhookEvent as SubscriptionInvoicingThresholdExceededWebhookEvent,
    type SubscriptionLicenseAllocationResetWebhookEvent as SubscriptionLicenseAllocationResetWebhookEvent,
    type SubscriptionLicenseBalanceThresholdReachedWebhookEvent as SubscriptionLicenseBalanceThresholdReachedWebhookEvent,
    type SubscriptionPlanChangeScheduledWebhookEvent as SubscriptionPlanChangeScheduledWebhookEvent,
    type SubscriptionPlanChangedWebhookEvent as SubscriptionPlanChangedWebhookEvent,
    type SubscriptionPlanVersionChangeScheduledWebhookEvent as SubscriptionPlanVersionChangeScheduledWebhookEvent,
    type SubscriptionPlanVersionChangedWebhookEvent as SubscriptionPlanVersionChangedWebhookEvent,
    type SubscriptionSpendExceededWebhookEvent as SubscriptionSpendExceededWebhookEvent,
    type SubscriptionStartedWebhookEvent as SubscriptionStartedWebhookEvent,
    type SubscriptionTrialEndedWebhookEvent as SubscriptionTrialEndedWebhookEvent,
    type SubscriptionUsageExceededWebhookEvent as SubscriptionUsageExceededWebhookEvent,
    type TransactionAccountingSyncFailedWebhookEvent as TransactionAccountingSyncFailedWebhookEvent,
    type TransactionAccountingSyncSucceededWebhookEvent as TransactionAccountingSyncSucceededWebhookEvent,
    type UnwrapWebhookEvent as UnwrapWebhookEvent,
  };
}
