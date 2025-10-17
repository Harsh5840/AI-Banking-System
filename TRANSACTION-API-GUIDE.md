# 💰 Transaction API Documentation

## Overview
This document explains how to create transactions with the system accounts.

## System Accounts
The system has three special accounts for handling income/expense transactions:
- **External Income**: Receives money from external sources (salaries, gifts, etc.)
- **External Expense**: Sends money to external destinations (bills, purchases, etc.)
- **External Transfer**: For other external transactions

## Transaction Types

### 1. 💸 Expense Transaction
**Money flows FROM user account TO system expense account**

```json
POST /api/transactions/create
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "type": "expense",
  "from": "<USER_ACCOUNT_ID>",
  "amount": 100,
  "description": "Coffee at Starbucks"
}
```

**Notes:**
- `to` field is NOT required (automatically uses system expense account)
- User must own the `from` account
- Amount is deducted from user's account

---

### 2. 💰 Income Transaction
**Money flows FROM system income account TO user account**

```json
POST /api/transactions/create
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "type": "income",
  "to": "<USER_ACCOUNT_ID>",
  "amount": 5000,
  "description": "Monthly salary"
}
```

**Notes:**
- `from` field is NOT required (automatically uses system income account)
- User must own the `to` account
- Amount is added to user's account

---

### 3. 🔄 Transfer Transaction
**Money flows FROM user account TO another user account**

```json
POST /api/transactions/create
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "type": "transfer",
  "from": "<USER_ACCOUNT_ID_1>",
  "to": "<USER_ACCOUNT_ID_2>",
  "amount": 200,
  "description": "Transfer to savings"
}
```

**Notes:**
- Both `from` and `to` are required
- User must own at least one of the accounts (typically both)
- Amount is moved between accounts

---

## How to Get Your Account IDs

### Get Your Accounts
```http
GET /api/accounts/me
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
[
  {
    "id": "814a34ca-cfe8-4b8a-9102-62d3d613fd91",
    "name": "Main Wallet",
    "type": "WALLET",
    "userId": "d7bd979c-e263-4186-9a4d-06cd45e0e929",
    "createdAt": "2025-10-17T10:00:00.000Z"
  },
  {
    "id": "18f3de2c-2d23-4213-8f70-a33de0863cba",
    "name": "Savings Account",
    "type": "SAVINGS",
    "userId": "d7bd979c-e263-4186-9a4d-06cd45e0e929",
    "createdAt": "2025-10-17T10:01:00.000Z"
  }
]
```

---

## Frontend Integration Example

### React/Next.js Component

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionForm = () => {
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    type: 'expense',
    from: '',
    to: '',
    amount: '',
    description: ''
  });

  // Fetch user's accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/accounts/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAccounts(response.data);
        
        // Auto-select first account for convenience
        if (response.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            from: response.data[0].id,
            to: response.data[0].id
          }));
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      }
    };
    fetchAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description
      };

      // Only include from/to based on transaction type
      if (formData.type === 'expense') {
        payload.from = formData.from;
      } else if (formData.type === 'income') {
        payload.to = formData.to;
      } else if (formData.type === 'transfer') {
        payload.from = formData.from;
        payload.to = formData.to;
      }

      const response = await axios.post(
        'http://localhost:5000/api/transactions/create',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Transaction created:', response.data);
      alert('Transaction created successfully!');
      
      // Reset form
      setFormData(prev => ({ ...prev, amount: '', description: '' }));
      
    } catch (error) {
      console.error('Transaction creation error:', error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Transaction Type:</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>

      {/* Show FROM account for expense and transfer */}
      {(formData.type === 'expense' || formData.type === 'transfer') && (
        <div>
          <label>From Account:</label>
          <select
            value={formData.from}
            onChange={(e) => setFormData({ ...formData, from: e.target.value })}
            required
          >
            <option value="">Select account</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.type})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Show TO account for income and transfer */}
      {(formData.type === 'income' || formData.type === 'transfer') && (
        <div>
          <label>To Account:</label>
          <select
            value={formData.to}
            onChange={(e) => setFormData({ ...formData, to: e.target.value })}
            required
          >
            <option value="">Select account</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.type})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label>Amount:</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label>Description:</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What is this transaction for?"
        />
      </div>

      <button type="submit">Create Transaction</button>
    </form>
  );
};

export default TransactionForm;
```

---

## Testing with cURL

### Create Expense
```bash
curl -X POST http://localhost:5000/api/transactions/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "from": "814a34ca-cfe8-4b8a-9102-62d3d613fd91",
    "amount": 100,
    "description": "Coffee"
  }'
```

### Create Income
```bash
curl -X POST http://localhost:5000/api/transactions/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "to": "814a34ca-cfe8-4b8a-9102-62d3d613fd91",
    "amount": 5000,
    "description": "Salary"
  }'
```

### Create Transfer
```bash
curl -X POST http://localhost:5000/api/transactions/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "transfer",
    "from": "814a34ca-cfe8-4b8a-9102-62d3d613fd91",
    "to": "18f3de2c-2d23-4213-8f70-a33de0863cba",
    "amount": 200,
    "description": "Transfer to savings"
  }'
```

---

## Error Handling

### Common Errors

#### 1. Account Not Found (404)
```json
{
  "error": "Account not found",
  "details": "Credit account not found: <ACCOUNT_ID>",
  "hint": "Please ensure both \"from\" and \"to\" accounts exist before creating a transaction"
}
```
**Solution:** Verify account IDs exist by calling GET /api/accounts/me

#### 2. Missing Required Fields (400)
```json
{
  "error": "Missing required field: from (user account)"
}
```
**Solution:** Check the transaction type and provide the required fields

#### 3. Unauthorized (401)
```json
{
  "error": "Unauthorized: User ID missing"
}
```
**Solution:** Ensure you're sending a valid JWT token in the Authorization header

---

## System Account IDs

Your current system account IDs (from .env):
```
SYSTEM_INCOME_ACCOUNT_ID=26debfab-5b6a-42f0-8aeb-02f5c1266dab
SYSTEM_EXPENSE_ACCOUNT_ID=cd5dab77-0a88-4426-b206-764c2790076e
```

These are automatically used by the backend, you don't need to specify them in your requests!

---

## Summary

✅ **Expense**: Only need `from` + `amount` + `description`
✅ **Income**: Only need `to` + `amount` + `description`
✅ **Transfer**: Need both `from` + `to` + `amount` + `description`

The backend automatically handles system accounts for income/expense! 🎉
