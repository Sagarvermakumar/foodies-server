// middlewares/validators/authValidator.js

import { body } from 'express-validator'

export const registerValidator = [
  body('name')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('referralCode').optional().isString().trim(),
]

export const loginValidator = [
  body('emailOrPhone').notEmpty().withMessage('Valid email/phone is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role')
    .isIn(['SUPER_ADMIN', 'MANAGER', 'STAFF', 'DELIVERY', 'CUSTOMER'])
    .withMessage('Invalid role'),
]

export const adminLoginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('secretKey').notEmpty().withMessage('Secret key is required'),
]

export const updateProfileValidator = [
  body('name')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
]

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
]

export const emailValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
]

export const emailOrPhoneValidator = [
  body('emailOrPhone')
    .notEmpty()
    .withMessage('Email or phone is required')
    .bail()
    .custom((value) => {
      // Check if it's email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      // Check if it's Indian phone number
      const phoneRegex = /^(\+91[\-\s]?|0)?[6-9]\d{9}$/

      if (emailRegex.test(value)) return true // valid email
      if (phoneRegex.test(value)) return true // valid Indian phone
      throw new Error('Enter a valid email or Indian phone number')
    }),
]

export const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
]

export const verifyEmailValidator = [
  body('token').notEmpty().withMessage('Verification token is required'),
]
