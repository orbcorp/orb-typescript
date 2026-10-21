// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

/**
 * Throws when a payload was rendered in a style the calling method doesn't parse,
 * rather than letting it parse into a type whose fields it doesn't carry. Payloads
 * from before payload styles existed carry no `payload_style` and are expanded.
 */
export function checkPayloadStyle(event: unknown, expected: 'expanded' | 'standard'): void {
  const style =
    event !== null && typeof event === 'object' ?
      (event as { payload_style?: unknown }).payload_style ?? 'expanded'
    : undefined;
  if (style === expected) {
    return;
  }
  const method = style === 'standard' ? 'webhooks.standard.unwrapStandard' : 'webhooks.unwrap';
  throw new Error(
    `This webhook payload has payload_style ${JSON.stringify(style)}, but this method parses ${JSON.stringify(
      expected,
    )} payloads. Use \`${method}\` for an endpoint configured for ${JSON.stringify(style)} payloads.`,
  );
}
