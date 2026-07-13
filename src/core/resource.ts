// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { BaseOrb } from '../client';

export abstract class APIResource {
  protected _client: BaseOrb;

  constructor(client: BaseOrb) {
    this._client = client;
  }
}
