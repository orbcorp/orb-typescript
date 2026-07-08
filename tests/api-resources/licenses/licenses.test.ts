// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Orb from 'orb-billing';

const client = new Orb({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource licenses', () => {
  test('create: only required params', async () => {
    const responsePromise = client.licenses.create({
      external_license_id: 'external_license_id',
      license_type_id: 'license_type_id',
      subscription_id: 'subscription_id',
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
    const response = await client.licenses.create({
      external_license_id: 'external_license_id',
      license_type_id: 'license_type_id',
      subscription_id: 'subscription_id',
      end_date: '2026-01-27',
      start_date: '2026-01-27',
    });
  });

  test('retrieve', async () => {
    const responsePromise = client.licenses.retrieve('license_id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('list: only required params', async () => {
    const responsePromise = client.licenses.list({ subscription_id: 'subscription_id' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('list: required and optional params', async () => {
    const response = await client.licenses.list({
      subscription_id: 'subscription_id',
      cursor: 'cursor',
      external_license_id: 'external_license_id',
      license_type_id: 'license_type_id',
      limit: 1,
      status: 'active',
    });
  });

  test('deactivate', async () => {
    const responsePromise = client.licenses.deactivate('license_id', {});
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('retrieveByExternalID: only required params', async () => {
    const responsePromise = client.licenses.retrieveByExternalID('external_license_id', {
      license_type_id: 'license_type_id',
      subscription_id: 'subscription_id',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('retrieveByExternalID: required and optional params', async () => {
    const response = await client.licenses.retrieveByExternalID('external_license_id', {
      license_type_id: 'license_type_id',
      subscription_id: 'subscription_id',
    });
  });
});
