// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as BillingEntitiesAPI from './billing-entities';
import {
  BillingEntities,
  BillingEntitiesPage,
  BillingEntity,
  BillingEntityCreateParams,
  BillingEntityListParams,
  BillingEntityUpdateByExternalIDParams,
  BillingEntityUpdateParams,
} from './billing-entities';
import * as PaymentGatewayConnectionsAPI from './payment-gateway-connections';
import {
  PaymentGatewayConnection,
  PaymentGatewayConnectionListParams,
  PaymentGatewayConnections,
  PaymentGatewayConnectionsPage,
} from './payment-gateway-connections';

export class Account extends APIResource {
  billingEntities: BillingEntitiesAPI.BillingEntities = new BillingEntitiesAPI.BillingEntities(this._client);
  paymentGatewayConnections: PaymentGatewayConnectionsAPI.PaymentGatewayConnections =
    new PaymentGatewayConnectionsAPI.PaymentGatewayConnections(this._client);
}

Account.BillingEntities = BillingEntities;
Account.PaymentGatewayConnections = PaymentGatewayConnections;

export declare namespace Account {
  export {
    BillingEntities as BillingEntities,
    type BillingEntity as BillingEntity,
    type BillingEntitiesPage as BillingEntitiesPage,
    type BillingEntityCreateParams as BillingEntityCreateParams,
    type BillingEntityUpdateParams as BillingEntityUpdateParams,
    type BillingEntityListParams as BillingEntityListParams,
    type BillingEntityUpdateByExternalIDParams as BillingEntityUpdateByExternalIDParams,
  };

  export {
    PaymentGatewayConnections as PaymentGatewayConnections,
    type PaymentGatewayConnection as PaymentGatewayConnection,
    type PaymentGatewayConnectionsPage as PaymentGatewayConnectionsPage,
    type PaymentGatewayConnectionListParams as PaymentGatewayConnectionListParams,
  };
}
