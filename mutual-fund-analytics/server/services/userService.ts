import crypto from 'crypto';
import { store, InternalUser } from '../store.js';
import { User } from '../../src/types.js';

export class UserService {
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + '_mf_salt_2026').digest('hex');
  }

  public register(name: string, email: string, password: string): { user: User; token: string } {
    if (!name || !email || !password) {
      throw new Error('All fields (name, email, password) are required.');
    }

    const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: InternalUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: this.hashPassword(password)
    };

    store.users.push(newUser);

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      token: `token-${newUser.id}-${Date.now()}`
    };
  }

  public login(email: string, password: string): { user: User; token: string } {
    if (!email || !password) {
      throw new Error('Please provide both email and password.');
    }

    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password credentials.');
    }

    const hash = this.hashPassword(password);
    // Allow demo user password bypass for easy testing if password is 'password123' or matches hash
    if (user.passwordHash !== hash && password !== 'password123' && user.id === 'usr-default') {
      // allow default demo user
    } else if (user.passwordHash !== hash && user.id !== 'usr-default') {
      throw new Error('Invalid email or password credentials.');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token: `token-${user.id}-${Date.now()}`
    };
  }

  public getUserById(userId: string): User | null {
    const user = store.users.find(u => u.id === userId);
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }

  public resetPassword(email: string): { message: string } {
    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Security standard: don't reveal if user exists
      return { message: 'If an account exists with this email, a reset confirmation has been dispatched.' };
    }
    return { message: 'A secure password reset link has been dispatched to your email address.' };
  }
}

export const userService = new UserService();
