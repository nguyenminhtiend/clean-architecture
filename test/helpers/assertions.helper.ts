import { Response } from 'supertest';

/**
 * Common assertion helpers for tests
 */

export function expectValidId(id: any): void {
  expect(id).toBeDefined();
  expect(typeof id).toBe('string');
  expect(id.length).toBeGreaterThan(0);
}

export function expectTimestamps(obj: any): void {
  expect(obj.createdAt).toBeDefined();
  expect(obj.updatedAt).toBeDefined();
}

export function expectProductShape(product: any): void {
  expect(product).toHaveProperty('id');
  expect(product).toHaveProperty('name');
  expect(product).toHaveProperty('price');
  expect(product).toHaveProperty('stock');
  expectTimestamps(product);
}

export function expectOrderShape(order: any): void {
  expect(order).toHaveProperty('id');
  expect(order).toHaveProperty('customerName');
  expect(order).toHaveProperty('totalAmount');
  expect(order).toHaveProperty('status');
  expect(order).toHaveProperty('items');
  expectTimestamps(order);
}

export function expectArrayResponse(response: Response, minLength = 0): void {
  expect(Array.isArray(response.body)).toBe(true);
  if (minLength > 0) {
    expect(response.body.length).toBeGreaterThanOrEqual(minLength);
  }
}

export function expectNotFoundError(response: Response): void {
  expect(response.status).toBe(404);
}

export function expectValidationError(response: Response): void {
  expect(response.status).toBe(400);
}

export function expectCreatedResponse(response: Response): void {
  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
}
