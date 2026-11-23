// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Orb from 'orb-billing';

const client = new Orb({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource paymentGatewayConnections', () => {
  test('create: only required params', async () => {
    const responsePromise = client.customers.paymentGatewayConnections.create('customer_id', {
      payment_gateway_connection_id: 'payment_gateway_connection_id',
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
    const response = await client.customers.paymentGatewayConnections.create('customer_id', {
      payment_gateway_connection_id: 'payment_gateway_connection_id',
      is_default: true,
      provider_customer_id: 'x',
    });
  });

  test('update: only required params', async () => {
    const responsePromise = client.customers.paymentGatewayConnections.update(
      'payment_gateway_connection_id',
      { customer_id: 'customer_id' },
    );
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('update: required and optional params', async () => {
    const response = await client.customers.paymentGatewayConnections.update(
      'payment_gateway_connection_id',
      {
        customer_id: 'customer_id',
        is_default: true,
        provider_customer_id: 'x',
      },
    );
  });

  test('list', async () => {
    const responsePromise = client.customers.paymentGatewayConnections.list('customer_id');
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
      client.customers.paymentGatewayConnections.list(
        'customer_id',
        {
          billing_entity_id: 'billing_entity_id',
          payment_gateway_connection_id: 'payment_gateway_connection_id',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Orb.NotFoundError);
  });

  test('delete: only required params', async () => {
    const responsePromise = client.customers.paymentGatewayConnections.delete(
      'payment_gateway_connection_id',
      { customer_id: 'customer_id' },
    );
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('delete: required and optional params', async () => {
    const response = await client.customers.paymentGatewayConnections.delete(
      'payment_gateway_connection_id',
      { customer_id: 'customer_id' },
    );
  });

  test('createByExternalID: only required params', async () => {
    const responsePromise = client.customers.paymentGatewayConnections.createByExternalID(
      'external_customer_id',
      { payment_gateway_connection_id: 'payment_gateway_connection_id' },
    );
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('createByExternalID: required and optional params', async () => {
    const response = await client.customers.paymentGatewayConnections.createByExternalID(
      'external_customer_id',
      {
        payment_gateway_connection_id: 'payment_gateway_connection_id',
        is_default: true,
        provider_customer_id: 'x',
      },
    );
  });

  test('deleteByExternalID: only required params', async () => {
    const responsePromise = client.customers.paymentGatewayConnections.deleteByExternalID(
      'payment_gateway_connection_id',
      { external_customer_id: 'external_customer_id' },
    );
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('deleteByExternalID: required and optional params', async () => {
    const response = await client.customers.paymentGatewayConnections.deleteByExternalID(
      'payment_gateway_connection_id',
      { external_customer_id: 'external_customer_id' },
    );
  });

  test('listByExternalID', async () => {
    const responsePromise =
      client.customers.paymentGatewayConnections.listByExternalID('external_customer_id');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('listByExternalID: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.customers.paymentGatewayConnections.listByExternalID(
        'external_customer_id',
        {
          billing_entity_id: 'billing_entity_id',
          payment_gateway_connection_id: 'payment_gateway_connection_id',
        },
        { path: '/_stainless_unknown_path' },
      ),
    ).rejects.toThrow(Orb.NotFoundError);
  });

  test('updateByExternalID: only required params', async () => {
    const responsePromise = client.customers.paymentGatewayConnections.updateByExternalID(
      'payment_gateway_connection_id',
      { external_customer_id: 'external_customer_id' },
    );
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  test('updateByExternalID: required and optional params', async () => {
    const response = await client.customers.paymentGatewayConnections.updateByExternalID(
      'payment_gateway_connection_id',
      {
        external_customer_id: 'external_customer_id',
        is_default: true,
        provider_customer_id: 'x',
      },
    );
  });
});
