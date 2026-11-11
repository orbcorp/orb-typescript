// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as SubscriptionsAPI from './subscriptions';
import { Subscriptions } from './subscriptions';

export class Migrations extends APIResource {
  subscriptions: SubscriptionsAPI.Subscriptions = new SubscriptionsAPI.Subscriptions(this._client);
}

Migrations.Subscriptions = Subscriptions;

export declare namespace Migrations {
  export { Subscriptions as Subscriptions };
}
