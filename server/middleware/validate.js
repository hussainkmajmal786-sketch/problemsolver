import { body, param, query, validationResult } from 'express-validator';

// Run validation and return errors
export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth Validators ──────────────────────────────
export const registerRules = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['poster', 'engineer', 'student', 'both']).withMessage('Invalid role'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Problem Validators ──────────────────────────
export const createProblemRules = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('description').trim().isLength({ min: 20, max: 10000 }).withMessage('Description must be 20-10000 characters'),
  body('category').isIn(['mechanical', 'electrical', 'civil', 'software', 'environmental', 'biomedical', 'chemical', 'aerospace']).withMessage('Invalid category'),
  body('urgency').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid urgency'),
  body('location').optional().trim().isLength({ max: 100 }),
  body('tags').optional().isArray({ max: 10 }).withMessage('Max 10 tags'),
];

// ─── Solution Validators ─────────────────────────
export const createSolutionRules = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('description').trim().isLength({ min: 20, max: 5000 }).withMessage('Description must be 20-5000 characters'),
];

// ─── Comment Validators ──────────────────────────
export const createCommentRules = [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be 1-2000 characters'),
  body('parentId').optional({ values: 'null' }).isUUID().withMessage('Invalid parent comment ID'),
];

// ─── Param Validators ────────────────────────────
export const uuidParam = (paramName = 'id') => [
  param(paramName).isUUID().withMessage(`Invalid ${paramName}`),
];
