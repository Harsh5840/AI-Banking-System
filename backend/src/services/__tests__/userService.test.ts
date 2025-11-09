import { describe, it, expect, beforeEach } from 'vitest';
import { createUser, getUserById, updateUser, deleteUser } from '../userService';

describe('User Service', () => {
  let testUserId: string;

  it('should create a new user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User',
    };
    
    const result = await createUser(userData);
    
    expect(result).toHaveProperty('id');
    expect(result.email).toBe(userData.email);
    expect(result.name).toBe(userData.name);
    expect(result.password).not.toBe(userData.password); // Should be hashed
    
    testUserId = result.id;
  });

  it('should retrieve user by ID', async () => {
    const result = await getUserById(testUserId);
    
    expect(result).toHaveProperty('id');
    expect(result.id).toBe(testUserId);
  });

  it('should update user information', async () => {
    const updateData = { name: 'Updated Name' };
    const result = await updateUser(testUserId, updateData);
    
    expect(result.name).toBe(updateData.name);
  });

  it('should delete user successfully', async () => {
    const result = await deleteUser(testUserId);
    
    expect(result).toBe(true);
  });

  it('should return null for non-existent user', async () => {
    const result = await getUserById('non-existent-id');
    
    expect(result).toBeNull();
  });
});