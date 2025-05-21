# Comprehensive API Guide for LMS Billing System Frontend Development

## Base Configuration
- **Base URL**: `http://localhost:<port>/api`
- **Authorization**: Bearer token required for all endpoints (except where marked as public)
- **Content-Type**: `application/json`
- **Error Response Format**: Consistent across all endpoints

## 1. Subject Pricing Management APIs

### 1.1 Get All Subject Pricing Configurations
```
GET /pricing/subjects
Authorization: Bearer <token>
Query Parameters (optional):
  - classId: string (MongoDB ObjectId)
  - subjectId: string (MongoDB ObjectId)
  - isActive: boolean
  - isFree: boolean
```

**Request Example:**
```
GET /pricing/subjects?classId=642a1c35f4d33e8f650a5678&isActive=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 Success):**
```json
[
  {
    "_id": "642a1c35f4d33e8f650a1234",
    "subjectId": "642a1c35f4d33e8f650a9876",
    "classId": "642a1c35f4d33e8f650a5678",
    "basePrice": 1500,
    "isFree": false,
    "currency": "INR",
    "validFrom": "2025-01-01T00:00:00.000Z",
    "validTo": "2025-12-31T23:59:59.000Z",
    "isActive": true,
    "description": "Regular pricing for Math subject",
    "createdBy": "642a1c35f4d33e8f650a3456",
    "createdAt": "2025-01-01T10:30:00.000Z",
    "updatedAt": "2025-01-01T10:30:00.000Z"
  }
]
```

### 1.2 Create Subject Pricing Configuration
```
POST /pricing/subjects
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "subjectId": "642a1c35f4d33e8f650a9876",
  "classId": "642a1c35f4d33e8f650a5678",
  "basePrice": 1500,
  "isFree": false,
  "currency": "INR",
  "validFrom": "2025-01-01T00:00:00Z",
  "validTo": "2025-12-31T23:59:59Z",
  "description": "Regular pricing for Math subject"
}
```

**Response (201 Created):**
```json
{
  "_id": "642a1c35f4d33e8f650a1234",
  "subjectId": "642a1c35f4d33e8f650a9876",
  "classId": "642a1c35f4d33e8f650a5678",
  "basePrice": 1500,
  "isFree": false,
  "currency": "INR",
  "validFrom": "2025-01-01T00:00:00.000Z",
  "validTo": "2025-12-31T23:59:59.000Z",
  "isActive": true,
  "description": "Regular pricing for Math subject",
  "createdBy": "642a1c35f4d33e8f650a3456",
  "createdAt": "2025-01-01T10:30:00.000Z",
  "updatedAt": "2025-01-01T10:30:00.000Z"
}
```

### 1.3 Update Subject Pricing Configuration
```
PUT /pricing/subjects/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (partial updates allowed):**
```json
{
  "basePrice": 1800,
  "description": "Updated pricing for Math subject"
}
```

**Response (200 Success):**
```json
{
  "_id": "642a1c35f4d33e8f650a1234",
  "subjectId": "642a1c35f4d33e8f650a9876",
  "classId": "642a1c35f4d33e8f650a5678",
  "basePrice": 1800,
  "isFree": false,
  "currency": "INR",
  "validFrom": "2025-01-01T00:00:00.000Z",
  "validTo": "2025-12-31T23:59:59.000Z",
  "isActive": true,
  "description": "Updated pricing for Math subject",
  "updatedBy": "642a1c35f4d33e8f650a3456",
  "createdAt": "2025-01-01T10:30:00.000Z",
  "updatedAt": "2025-01-15T14:22:00.000Z"
}
```

---

## 2. Discount Rules Management APIs

### 2.1 Get All Discount Rules
```
GET /pricing/discounts
Authorization: Bearer <token>
Query Parameters (optional):
  - type: string (volume|sibling|early_bird|seasonal|custom)
  - isActive: boolean
  - classId: string (MongoDB ObjectId)
```

**Request Example:**
```
GET /pricing/discounts?type=sibling&isActive=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 Success):**
```json
[
  {
    "_id": "642a1c35f4d33e8f650a4567",
    "name": "Sibling Discount",
    "type": "sibling",
    "application": "percentage",
    "rules": [
      {
        "condition": { "siblingCount": 1 },
        "discountValue": 10,
        "description": "10% off for 1 sibling"
      },
      {
        "condition": { "siblingCount": 2 },
        "discountValue": 15,
        "description": "15% off for 2 siblings"
      }
    ],
    "maxDiscount": 5000,
    "currency": "INR",
    "validFrom": "2025-01-01T00:00:00.000Z",
    "isActive": true,
    "priority": 2,
    "isStackable": true,
    "description": "Discount for siblings enrolled in the platform",
    "createdBy": "642a1c35f4d33e8f650a3456",
    "createdAt": "2025-01-01T10:30:00.000Z",
    "updatedAt": "2025-01-01T10:30:00.000Z"
  }
]
```

### 2.2 Create Discount Rule
```
POST /pricing/discounts
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Volume Discount",
  "type": "volume",
  "application": "percentage",
  "rules": [
    {
      "condition": { "subjectCount": 3 },
      "discountValue": 5,
      "description": "5% off for 3 subjects"
    },
    {
      "condition": { "subjectCount": 5 },
      "discountValue": 10,
      "description": "10% off for 5 or more subjects"
    }
  ],
  "maxDiscount": 3000,
  "validFrom": "2025-01-01T00:00:00Z",
  "validTo": "2025-12-31T23:59:59Z",
  "priority": 1,
  "isStackable": false,
  "description": "Volume discount for multiple subject enrollment"
}
```

**Response (201 Created):**
```json
{
  "_id": "642a1c35f4d33e8f650a7890",
  "name": "Volume Discount",
  "type": "volume",
  "application": "percentage",
  "rules": [
    {
      "condition": { "subjectCount": 3 },
      "discountValue": 5,
      "description": "5% off for 3 subjects"
    },
    {
      "condition": { "subjectCount": 5 },
      "discountValue": 10,
      "description": "10% off for 5 or more subjects"
    }
  ],
  "maxDiscount": 3000,
  "currency": "INR",
  "validFrom": "2025-01-01T00:00:00.000Z",
  "validTo": "2025-12-31T23:59:59.000Z",
  "isActive": true,
  "priority": 1,
  "isStackable": false,
  "description": "Volume discount for multiple subject enrollment",
  "createdBy": "642a1c35f4d33e8f650a3456",
  "createdAt": "2025-01-15T11:45:00.000Z",
  "updatedAt": "2025-01-15T11:45:00.000Z"
}
```

---

## 3. Tax Configuration Management APIs

### 3.1 Get All Tax Configurations
```
GET /pricing/taxes
Authorization: Bearer <token>
Query Parameters (optional):
  - type: string (gst|service_tax|vat|income_tax|custom)
  - isActive: boolean
  - classId: string (MongoDB ObjectId)
  - subjectId: string (MongoDB ObjectId)
```

**Response (200 Success):**
```json
[
  {
    "_id": "642a1c35f4d33e8f650a2345",
    "name": "GST 18%",
    "type": "gst",
    "rate": 18.0,
    "code": "GST18",
    "validFrom": "2025-01-01T00:00:00.000Z",
    "isActive": true,
    "order": 1,
    "isInclusive": false,
    "description": "Standard GST rate for educational services",
    "createdBy": "642a1c35f4d33e8f650a3456",
    "createdAt": "2025-01-01T10:30:00.000Z",
    "updatedAt": "2025-01-01T10:30:00.000Z"
  }
]
```

### 3.2 Create Tax Configuration
```
POST /pricing/taxes
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Service Tax 15%",
  "type": "service_tax",
  "rate": 15.0,
  "code": "ST15",
  "validFrom": "2025-01-01T00:00:00Z",
  "order": 2,
  "isInclusive": false,
  "description": "Service tax for premium courses"
}
```

**Response (201 Created):**
```json
{
  "_id": "642a1c35f4d33e8f650a6789",
  "name": "Service Tax 15%",
  "type": "service_tax",
  "rate": 15.0,
  "code": "ST15",
  "validFrom": "2025-01-01T00:00:00.000Z",
  "isActive": true,
  "order": 2,
  "isInclusive": false,
  "description": "Service tax for premium courses",
  "createdBy": "642a1c35f4d33e8f650a3456",
  "createdAt": "2025-01-15T12:20:00.000Z",
  "updatedAt": "2025-01-15T12:20:00.000Z"
}
```

---

## 4. Pricing Calculation Tool APIs

### 4.1 Calculate Pricing for Selected Subjects
```
POST /pricing/calculate
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "studentId": "642a1c35f4d33e8f650a9012",
  "classId": "642a1c35f4d33e8f650a5678",
  "subjectIds": [
    "642a1c35f4d33e8f650a1234",
    "642a1c35f4d33e8f650a5432",
    "642a1c35f4d33e8f650a8765"
  ],
  "siblingIds": ["642a1c35f4d33e8f650a7890"]
}
```

**Response (200 Success):**
```json
{
  "pricingBreakdown": {
    "subjectPricing": [
      {
        "subjectId": "642a1c35f4d33e8f650a1234",
        "basePrice": 1500,
        "isFree": false
      },
      {
        "subjectId": "642a1c35f4d33e8f650a5432",
        "basePrice": 1200,
        "isFree": false
      },
      {
        "subjectId": "642a1c35f4d33e8f650a8765",
        "basePrice": 1000,
        "isFree": false
      }
    ],
    "totalBasePrice": 3700,
    "appliedDiscounts": [
      {
        "discountRuleId": "642a1c35f4d33e8f650a4567",
        "discountType": "sibling",
        "discountValue": 10,
        "discountAmount": 370,
        "description": "10% off for 1 sibling"
      },
      {
        "discountRuleId": "642a1c35f4d33e8f650a7890",
        "discountType": "volume",
        "discountValue": 5,
        "discountAmount": 185,
        "description": "5% off for 3 subjects"
      }
    ],
    "totalDiscountAmount": 555,
    "priceAfterDiscount": 3145,
    "appliedTaxes": [
      {
        "taxConfigurationId": "642a1c35f4d33e8f650a2345",
        "taxType": "gst",
        "taxRate": 18,
        "taxAmount": 566.1,
        "isInclusive": false
      }
    ],
    "totalTaxAmount": 566.1,
    "finalAmount": 3711.1,
    "currency": "INR"
  },
  "siblingInfo": {
    "siblingCount": 1,
    "siblingIds": ["642a1c35f4d33e8f650a7890"],
    "totalSiblingsPrice": 2500
  },
  "calculatedAt": "2025-01-15T15:30:00.000Z",
  "snapshotId": "642a1c35f4d33e8f650a1111"
}
```

### 4.2 Get Pricing Snapshot by ID
```
GET /pricing/calculate/snapshot/:id
Authorization: Bearer <token>
```

**Response (200 Success):**
```json
{
  "_id": "642a1c35f4d33e8f650a1111",
  "studentId": "642a1c35f4d33e8f650a9012",
  "classId": "642a1c35f4d33e8f650a5678",
  "subjectIds": ["642a1c35f4d33e8f650a1234", "642a1c35f4d33e8f650a5432"],
  "pricingBreakdown": {
    "totalBasePrice": 3700,
    "totalDiscountAmount": 555,
    "totalTaxAmount": 566.1,
    "finalAmount": 3711.1,
    "currency": "INR"
  },
  "calculatedAt": "2025-01-15T15:30:00.000Z",
  "createdBy": "642a1c35f4d33e8f650a3456"
}
```

---

## 5. Invoice Management APIs

### 5.1 Get All Invoices with Filters
```
GET /invoices
Authorization: Bearer <token>
Query Parameters (optional):
  - studentId: string (MongoDB ObjectId)
  - parentId: string (MongoDB ObjectId)
  - status: string (draft|sent|paid|overdue|cancelled|refunded|partially_paid)
  - invoiceType: string (enrollment|renewal|additional_subjects|adjustment|late_fee)
  - fromDate: string (ISO date)
  - toDate: string (ISO date)
  - page: number (default: 1)
  - limit: number (default: 10)
```

**Response (200 Success):**
```json
{
  "invoices": [
    {
      "_id": "642a1c35f4d33e8f650a3333",
      "invoiceNumber": "INV-2025-01-000001",
      "studentId": "642a1c35f4d33e8f650a9012",
      "parentId": "642a1c35f4d33e8f650a3456",
      "enrollmentIds": ["642a1c35f4d33e8f650a7890"],
      "pricingSnapshotId": "642a1c35f4d33e8f650a1111",
      "invoiceType": "enrollment",
      "status": "sent",
      "invoiceDate": "2025-01-15T00:00:00.000Z",
      "dueDate": "2025-01-30T23:59:59.000Z",
      "totals": {
        "subtotal": 3700,
        "totalDiscount": 555,
        "totalTax": 566.1,
        "finalAmount": 3711.1,
        "currency": "INR"
      },
      "paymentTracking": {
        "amountPaid": 0
      },
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

### 5.2 Create Invoice from Enrollment
```
POST /invoices/from-enrollment
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "studentId": "642a1c35f4d33e8f650a9012",
  "parentId": "642a1c35f4d33e8f650a3456",
  "enrollmentIds": ["642a1c35f4d33e8f650a7890"],
  "invoiceType": "enrollment",
  "dueDate": "2025-01-30T23:59:59Z",
  "paymentTerms": "Payment due within 15 days",
  "notes": "Welcome to our learning platform!"
}
```

**Response (201 Created):**
```json
{
  "_id": "642a1c35f4d33e8f650a4444",
  "invoiceNumber": "INV-2025-01-000002",
  "studentId": "642a1c35f4d33e8f650a9012",
  "parentId": "642a1c35f4d33e8f650a3456",
  "enrollmentIds": ["642a1c35f4d33e8f650a7890"],
  "pricingSnapshotId": "642a1c35f4d33e8f650a1111",
  "invoiceType": "enrollment",
  "status": "draft",
  "invoiceDate": "2025-01-16T00:00:00.000Z",
  "dueDate": "2025-01-30T23:59:59.000Z",
  "lineItems": [
    {
      "description": "Mathematics - Class 8",
      "subjectId": "642a1c35f4d33e8f650a1234",
      "quantity": 1,
      "unitPrice": 1500,
      "totalPrice": 1500,
      "discountAmount": 150,
      "taxAmount": 243,
      "finalAmount": 1593
    }
  ],
  "totals": {
    "subtotal": 1500,
    "totalDiscount": 150,
    "taxBreakdown": [
      {
        "taxName": "GST 18%",
        "taxRate": 18,
        "taxAmount": 243
      }
    ],
    "totalTax": 243,
    "finalAmount": 1593,
    "currency": "INR"
  },
  "paymentTerms": "Payment due within 15 days",
  "notes": "Welcome to our learning platform!",
  "billingAddress": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "paymentTracking": {
    "amountPaid": 0
  },
  "emailTracking": {
    "emailSent": false
  },
  "createdBy": "642a1c35f4d33e8f650a3456",
  "createdAt": "2025-01-16T11:20:00.000Z",
  "updatedAt": "2025-01-16T11:20:00.000Z"
}
```

### 5.3 Update Invoice Status
```
PUT /invoices/:id/status
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "paid",
  "amountPaid": 1593,
  "paymentMethod": "credit_card",
  "transactionReference": "TRANS-12345",
  "notes": "Payment received via credit card"
}
```

**Response (200 Success):**
```json
{
  "_id": "642a1c35f4d33e8f650a4444",
  "invoiceNumber": "INV-2025-01-000002",
  "status": "paid",
  "paymentTracking": {
    "amountPaid": 1593,
    "lastPaymentDate": "2025-01-16T15:30:00.000Z",
    "paymentMethod": "credit_card",
    "transactionReference": "TRANS-12345"
  },
  "updatedBy": "642a1c35f4d33e8f650a3456",
  "updatedAt": "2025-01-16T15:30:00.000Z"
}
```

### 5.4 Send Invoice to Parent
```
PUT /invoices/:id/send
Authorization: Bearer <token>
```

**Response (200 Success):**
```json
{
  "message": "Invoice sent successfully",
  "invoice": {
    "_id": "642a1c35f4d33e8f650a4444",
    "invoiceNumber": "INV-2025-01-000002",
    "status": "sent",
    "emailTracking": {
      "emailSent": true,
      "emailSentDate": "2025-01-16T16:00:00.000Z"
    },
    "pdfPath": "/uploads/invoices/INV-2025-01-000002.pdf",
    "updatedAt": "2025-01-16T16:00:00.000Z"
  }
}
```

### 5.5 Get Invoice Statistics
```
GET /invoices/statistics/overview
Authorization: Bearer <token>
Query Parameters (optional):
  - fromDate: string (ISO date)
  - toDate: string (ISO date)
```

**Response (200 Success):**
```json
{
  "totalInvoices": 150,
  "totalAmount": 450000,
  "paidAmount": 360000,
  "pendingAmount": 60000,
  "overdueAmount": 30000,
  "statusBreakdown": {
    "draft": 5,
    "sent": 25,
    "paid": 100,
    "overdue": 15,
    "cancelled": 3,
    "refunded": 2
  }
}
```

---

## Error Handling

### Standard Error Response Format
All endpoints return errors in the following format:

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "property": "basePrice",
      "value": -100,
      "constraints": {
        "min": "basePrice must not be less than 0"
      }
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Subject pricing not found",
  "error": "Not Found"
}
```

**500 Internal Server Error:**
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

### Error Status Codes
- **200**: Success
- **201**: Created
- **204**: No Content (for delete operations)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (missing or invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate data)
- **500**: Internal Server Error

## Authentication
Include the JWT token in the Authorization header for all requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NDJhMWMzNWY0ZDMzZThmNjUwYTM0NTYiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Use these comprehensive API specifications to build robust frontend CRUD pages with proper error handling and user feedback.