// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Orb from 'orb-billing';

const client = new Orb({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource prices', () => {
  test('create: only required params', async () => {
    const responsePromise = client.dimensionalPriceGroups.prices.create('dimensional_price_group_id', {
      cadence: 'one_time',
      currency: 'USD',
      item_id: 'item_id',
      model_type: 'unit',
      prices: [{ amounts: [0], dimension_values: ['string'] }],
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('create: required and optional params', async () => {
    const response = await client.dimensionalPriceGroups.prices.create('dimensional_price_group_id', {
      cadence: 'one_time',
      currency: 'USD',
      item_id: 'item_id',
      model_type: 'unit',
      prices: [
        {
          amounts: [0],
          dimension_values: ['string'],
          name: 'name',
        },
      ],
      tiers: [{ first_unit: 0, last_unit: 0 }],
    });
  });

  test('list', async () => {
    const responsePromise = client.dimensionalPriceGroups.prices.list('dimensional_price_group_id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('list: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.dimensionalPriceGroups.prices.list(
        'dimensional_price_group_id',
        {
          cursor: 'cursor',
          limit: 1,
          status: 'active',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Orb.NotFoundError);
  });
});
