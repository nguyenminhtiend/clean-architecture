# Postman Collection for Product CRUD E2E Testing

This folder contains a Postman collection for automated end-to-end testing of the Clean Architecture API.

## File

### Product-CRUD-E2E.postman_collection.json

**An automated workflow collection that executes Product CRUD operations in sequence using Postman Collection Runner.**

This collection is designed to run as a complete workflow using Postman's Collection Runner, which automatically:
- Executes all requests in the defined order
- Passes data between requests (like product ID)
- Validates responses with automated tests
- Shows a complete test report

**Workflow Sequence (8 Steps):**
1. **Create Product** - POST request creates a test product, saves ID to collection variable
2. **Get Product by ID** - GET request retrieves the created product using saved ID
3. **List All Products** - GET request lists all products, verifies created product exists
4. **List Products with Pagination** - GET request with query params (skip=0, take=10)
5. **Update Product** - PATCH request updates the product using saved ID
6. **Verify Product Update** - GET request confirms updates were persisted
7. **Delete Product** - DELETE request removes the product using saved ID
8. **Verify Product Deletion** - GET request confirms deletion (expects 404)

**Features:**
- ✅ Automated test assertions for each request
- ✅ Collection variables automatically pass data between requests
- ✅ Status code validation (201, 200, 204, 404)
- ✅ Response structure and data integrity checks
- ✅ Complete test report with pass/fail statistics

## How to Import

### Using Postman Desktop App:
1. Open Postman
2. Click "Import" button in the top-left corner
3. Click "Choose Files" or drag and drop
4. Select `Product-CRUD-E2E.postman_collection.json`
5. Click "Import"
6. The collection will appear in your "Collections" sidebar

### Using Postman Web:
1. Open Postman in your browser
2. Click "Import" button
3. Drag and drop `Product-CRUD-E2E.postman_collection.json`
4. Click "Import"
5. Access from "Collections" tab

## Configuration

The collection uses the following variables:

- `baseUrl`: The base URL of the API (default: `http://localhost:3000`)
- `productId`: Automatically set during the flow to track the created product

### Changing the Base URL:

**Option 1: Edit Collection Variables**
1. Click on the collection
2. Go to the "Variables" tab
3. Update the `baseUrl` value
4. Save the collection

**Option 2: Use Environment Variables**
1. Create a new environment in Postman
2. Add a variable named `baseUrl` with your API URL
3. Select the environment before running the collection

## How to Run the Workflow

### ⭐ Recommended: Run Complete E2E Workflow with Collection Runner

**This is the main way to use this collection - it runs all requests in sequence automatically:**

1. **Open Postman** and locate the imported collection in the sidebar
2. **Hover over the collection name** "Product CRUD E2E Workflow"
3. **Click the "Run" button** (▶️ icon) that appears
   - Or right-click the collection and select "Run collection"
4. **Collection Runner will open** showing all 8 requests
5. **Verify settings:**
   - All requests should be checked ✅
   - Order should be 1→2→3→4→5→6→7→8
6. **Click "Run Product CRUD E2E Workflow"** button at the bottom
7. **Watch the execution:**
   - Requests execute automatically in sequence
   - Product ID is automatically captured and reused
   - Tests run and show pass/fail status
   - Progress updates in real-time
8. **View Results:**
   - See overall pass/fail statistics
   - Review each request's response
   - Check test assertions
   - Export results if needed

**Expected Results:**
- ✅ 8/8 requests successful
- ✅ All test assertions passed
- ✅ Complete CRUD workflow validated

### Alternative: Run Individual Requests (Not Recommended for Workflow)

If you want to test a single endpoint (not the full workflow):

1. Expand the collection in the sidebar
2. Click on any individual request
3. Click "Send" button
4. View the response

⚠️ **Note**: Running individual requests won't work for the full workflow because later requests depend on the product ID from the first request.

## Prerequisites

- The API server must be running (default: `http://localhost:3000`)
- Database must be accessible and properly configured
- No authentication required (add auth if your API requires it)

## Visual Guide

### What Collection Runner Looks Like:

```
Product CRUD E2E Workflow
├── ✅ 1. Create Product (201 Created)
├── ✅ 2. Get Product by ID (200 OK)
├── ✅ 3. List All Products (200 OK)
├── ✅ 4. List Products with Pagination (200 OK)
├── ✅ 5. Update Product (200 OK)
├── ✅ 6. Verify Product Update (200 OK)
├── ✅ 7. Delete Product (204 No Content)
└── ✅ 8. Verify Product Deletion (404 Not Found)

Summary: 8/8 requests | All tests passed ✅
```

### How Data Flows:

```
Step 1: Create Product
   └─> Response: { "id": "abc123", "name": "Test Product", ... }
        └─> Save to variable: productId = "abc123"

Step 2-7: Use {{productId}} in URLs
   └─> Example: GET /products/abc123
                PATCH /products/abc123
                DELETE /products/abc123
```

## Troubleshooting

**404 Errors on All Requests:**
- Verify the API server is running
- Check the `baseUrl` variable matches your server URL
- Ensure the `/products` endpoint is available

**Test Failures:**
- Check the response body in the test results
- Verify the database is properly configured
- Ensure there are no validation errors in the request bodies

**Connection Errors:**
- Verify the server is running on the specified port
- Check firewall settings
- Ensure no proxy settings are interfering

## Customization

You can customize the test data by editing the request bodies:
- Update product names, descriptions, prices, and stock values
- Modify pagination parameters (skip/take)
- Add additional test cases as needed
