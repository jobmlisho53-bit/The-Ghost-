const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// Mock user data
const mockUserData = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
};

describe('User Model', () => {
  describe('Password hashing', () => {
    it('should hash password before saving', async () => {
      const user = new User(mockUserData);
      await user.save();

      // Password should be hashed, not plain text
      expect(user.password).not.toBe(mockUserData.password);
      expect(user.password).toHaveLength(60); // bcrypt hash length
      
      // Verify password matches
      const isMatch = await bcrypt.compare(mockUserData.password, user.password);
      expect(isMatch).toBe(true);
    });
  });

  describe('matchPassword method', () => {
    it('should return true for correct password', async () => {
      const user = new User(mockUserData);
      await user.save();

      const isMatch = await user.matchPassword(mockUserData.password);
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = new User(mockUserData);
      await user.save();

      const isMatch = await user.matchPassword('wrongpassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should require username', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.username).toBeDefined();
    });

    it('should require valid email', async () => {
      const user = new User({
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should require minimum password length', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: '123', // Too short
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });
  });
});
