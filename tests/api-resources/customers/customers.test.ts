// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Orb from 'orb-billing';

const client = new Orb({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource customers', () => {
  test('create: only required params', async () => {
    const responsePromise = client.customers.create({ email: 'dev@stainless.com', name: 'x' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('create: required and optional params', async () => {
    const response = await client.customers.create({
      email: 'dev@stainless.com',
      name: 'x',
      accounting_sync_configuration: {
        accounting_providers: [{ external_provider_id: 'external_provider_id', provider_type: 'quickbooks' }],
        excluded: true,
      },
      additional_emails: ['dev@stainless.com'],
      auto_collection: true,
      auto_issuance: true,
      billing_address: {
        city: 'city',
        country: 'country',
        line1: 'line1',
        line2: 'line2',
        postal_code: 'postal_code',
        state: 'state',
      },
      currency: 'currency',
      email_delivery: true,
      external_customer_id: 'external_customer_id',
      hierarchy: { child_customer_ids: ['string'], parent_customer_id: 'parent_customer_id' },
      metadata: { foo: 'string' },
      payment_configuration: {
        payment_providers: [
          {
            provider_type: 'stripe',
            default_shared_payment_token: 'default_shared_payment_token',
            excluded_payment_method_types: ['string'],
          },
        ],
      },
      payment_provider: 'quickbooks',
      payment_provider_id: 'payment_provider_id',
      reporting_configuration: { exempt: true },
      shipping_address: {
        city: 'city',
        country: 'country',
        line1: 'line1',
        line2: 'line2',
        postal_code: 'postal_code',
        state: 'state',
      },
      tax_configuration: {
        tax_exempt: true,
        tax_provider: 'avalara',
        automatic_tax_enabled: true,
        tax_exemption_code: 'tax_exemption_code',
      },
      tax_id: {
        country: 'AD',
        type: 'ad_nrt',
        value: 'value',
      },
      timezone: 'timezone',
    });
  });

  test('update', async () => {
    const responsePromise = client.customers.update('customer_id', {});
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('list', async () => {
    const responsePromise = client.customers.list();
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
      client.customers.list(
        {
          'created_at[gt]': '2019-12-27T18:11:19.117Z',
          'created_at[gte]': '2019-12-27T18:11:19.117Z',
          'created_at[lt]': '2019-12-27T18:11:19.117Z',
          'created_at[lte]': '2019-12-27T18:11:19.117Z',
          cursor: 'cursor',
          limit: 1,
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Orb.NotFoundError);
  });

  test('delete', async () => {
    const responsePromise = client.customers.delete('customer_id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('createPortalSession', async () => {
    const responsePromise = client.customers.createPortalSession('customer_id', {});
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('createPortalSessionByExternalID', async () => {
    const responsePromise = client.customers.createPortalSessionByExternalID('external_customer_id', {});
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('fetch', async () => {
    const responsePromise = client.customers.fetch('customer_id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('fetchByExternalID', async () => {
    const responsePromise = client.customers.fetchByExternalID('external_customer_id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('syncPaymentMethodsFromGateway', async () => {
    const responsePromise = client.customers.syncPaymentMethodsFromGateway('customer_id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('syncPaymentMethodsFromGatewayByExternalCustomerID', async () => {
    const responsePromise =
      client.customers.syncPaymentMethodsFromGatewayByExternalCustomerID('external_customer_id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('updateByExternalID', async () => {
    const responsePromise = client.customers.updateByExternalID('external_customer_id', {});
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });
});
