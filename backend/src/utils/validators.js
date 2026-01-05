const Joi = require('joi');

// User validation schemas
const registerValidation = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required',
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),
});

const loginValidation = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string()
    .required(),
});

// Content request validation
const contentRequestValidation = Joi.object({
  topic: Joi.string()
    .max(200)
    .required()
    .messages({
      'string.max': 'Topic cannot exceed 200 characters',
      'any.required': 'Topic is required',
    }),
  duration: Joi.number()
    .integer()
    .min(10)
    .max(3600)
    .default(300)
    .messages({
      'number.min': 'Duration must be at least 10 seconds',
      'number.max': 'Duration cannot exceed 3600 seconds (1 hour)',
    }),
  style: Joi.string()
    .valid('educational', 'entertainment', 'documentary', 'tutorial', 'explainer')
    .default('educational'),
  language: Joi.string()
    .length(2)
    .default('en')
    .messages({
      'string.length': 'Language must be a 2-letter code (e.g., en, es, fr)',
    }),
});

// Subscription validation
const subscriptionValidation = Joi.object({
  plan: Joi.string()
    .valid('free', 'premium', 'enterprise')
    .required(),
  billingCycle: Joi.string()
    .valid('monthly', 'yearly')
    .default('monthly'),
});

// Validation utility function
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }
    
    next();
  };
};

module.exports = {
  registerValidation,
  loginValidation,
  contentRequestValidation,
  subscriptionValidation,
  validateRequest,
};
