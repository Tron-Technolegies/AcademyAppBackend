// =========================================
// 1. User Model - Update Schema to store face embeddings
// =========================================
// models/user.model.js

import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    default: null,
  },
  lastName: {
    type: String,
    default: null,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    enum: ['admin', 'instructor', 'student'],
    default: 'student',
  },
  // Face data field - stores serialized facial embeddings
  faceEmbeddings: {
    type: String,  // Will store the JSON string of face data
    default: null
  },
  // Face verification history for audit/security purposes
  faceVerificationHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    success: {
      type: Boolean,
      required: true
    },
    ipAddress: {
      type: String,
      default: null
    },
    deviceInfo: {
      type: String,
      default: null
    }
  }],
  otp: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// Update modified timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);
export default User;


// =========================================
// 2. Face Detection Controller - Handle registration and verification
// =========================================
// controllers/face.controller.js

import User from '../models/user.model.js';
import FaceCompare from '../utils/faceCompare.js';
import logger from '../utils/logger.js';

export const registerFace = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.id;
    
    // Get face embeddings from request body
    const { faceEmbeddings } = req.body;
    
    if (!faceEmbeddings) {
      return res.status(400).json({
        success: false,
        message: 'Face data is required'
      });
    }
    
    // Validate the face embeddings format
    try {
      const faceData = JSON.parse(faceEmbeddings);
      
      // Basic validation to ensure we have required data
      if (!faceData.landmarks || Object.keys(faceData.landmarks).length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Invalid face data: insufficient facial landmarks'
        });
      }
      
      // Check if we have essential face points
      const requiredLandmarks = ['leftEye', 'rightEye', 'noseBase'];
      const missingLandmarks = requiredLandmarks.filter(landmark => 
        !faceData.landmarks[landmark]
      );
      
      if (missingLandmarks.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid face data: missing required landmarks: ${missingLandmarks.join(', ')}`
        });
      }
    } catch (e) {
      logger.error(`Face registration parse error: ${e.message}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid face data format'
      });
    }
    
    // Update user with face embeddings
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        faceEmbeddings,
        // Add an entry to verification history
        $push: {
          faceVerificationHistory: {
            timestamp: new Date(),
            success: true,
            ipAddress: req.ip || null,
            deviceInfo: req.headers['user-agent'] || null
          }
        }
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    logger.info(`Face registered for user: ${userId}`);
    
    return res.status(200).json({
      success: true,
      message: 'Face registered successfully'
    });
  } catch (error) {
    logger.error(`Face registration error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to register face',
      error: error.message
    });
  }
};

export const verifyFace = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.id;
    
    // Get face embeddings from request body
    const { faceEmbeddings } = req.body;
    
    if (!faceEmbeddings) {
      return res.status(400).json({
        success: false,
        message: 'Face data is required'
      });
    }
    
    // Get user with stored face embeddings
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.faceEmbeddings) {
      return res.status(400).json({
        success: false,
        message: 'No face data registered for this user'
      });
    }
    
    // Compare face embeddings
    const faceCompare = new FaceCompare();
    const { matched, similarity, threshold } = await faceCompare.compareEmbeddings(
      faceEmbeddings,
      user.faceEmbeddings
    );
    
    // Record verification attempt regardless of result
    await User.findByIdAndUpdate(
      userId,
      { 
        $push: {
          faceVerificationHistory: {
            timestamp: new Date(),
            success: matched,
            ipAddress: req.ip || null,
            deviceInfo: req.headers['user-agent'] || null
          }
        }
      }
    );
    
    logger.info(`Face verification for user ${userId}: ${matched ? 'SUCCESS' : 'FAILED'} (Similarity: ${similarity.toFixed(4)}, Threshold: ${threshold})`);
    
    return res.status(200).json({
      success: true,
      matched,
      similarity: similarity.toFixed(4),
      threshold
    });
  } catch (error) {
    logger.error(`Face verification error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify face',
      error: error.message
    });
  }
};

export const deleteFaceData = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.id;
    
    // Update user to remove face embeddings
    const user = await User.findByIdAndUpdate(
      userId,
      { faceEmbeddings: null },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    logger.info(`Face data deleted for user: ${userId}`);
    
    return res.status(200).json({
      success: true,
      message: 'Face data deleted successfully'
    });
  } catch (error) {
    logger.error(`Face data deletion error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete face data',
      error: error.message
    });
  }
};


// =========================================
// 3. Face Comparison Utility - Core logic for face matching
// =========================================
// utils/faceCompare.js

class FaceCompare {
  constructor(options = {}) {
    // Default threshold for considering faces a match
    this.threshold = options.threshold || 0.75;
    
    // Weights for different feature comparisons
    this.weights = {
      landmarks: options.landmarkWeight || 0.5,  // Weight for landmark positions
      metrics: options.metricsWeight || 0.3,     // Weight for face metrics/ratios
      angles: options.angleWeight || 0.1,        // Weight for head angles
      expressions: options.expressionWeight || 0.1, // Weight for facial expressions
    };
  }
  
  async compareEmbeddings(newEmbeddings, storedEmbeddings) {
    try {
      // Parse the embeddings JSON
      const newData = JSON.parse(newEmbeddings);
      const storedData = JSON.parse(storedEmbeddings);
      
      // Calculate similarity scores for different aspects of the face
      const landmarkSimilarity = this._compareLandmarks(newData, storedData);
      const metricsSimilarity = this._compareMetrics(newData, storedData);
      const angleSimilarity = this._compareAngles(newData, storedData);
      const expressionSimilarity = this._compareExpressions(newData, storedData);
      
      // Calculate weighted similarity score
      const weightedSimilarity = 
        (landmarkSimilarity * this.weights.landmarks) +
        (metricsSimilarity * this.weights.metrics) +
        (angleSimilarity * this.weights.angles) +
        (expressionSimilarity * this.weights.expressions);
      
      // Determine if it's a match
      const matched = weightedSimilarity >= this.threshold;
      
      return {
        matched,
        similarity: weightedSimilarity,
        threshold: this.threshold,
        details: {
          landmarkSimilarity,
          metricsSimilarity,
          angleSimilarity,
          expressionSimilarity
        }
      };
    } catch (error) {
      console.error('Error comparing embeddings:', error);
      throw new Error(`Face comparison failed: ${error.message}`);
    }
  }
  
  _compareLandmarks(newData, storedData) {
    try {
      if (!newData.landmarks || !storedData.landmarks) {
        return 0;
      }
      
      // Get common landmarks between the two face data objects
      const newLandmarks = newData.landmarks;
      const storedLandmarks = storedData.landmarks;
      
      const commonKeys = Object.keys(newLandmarks).filter(key => 
        storedLandmarks.hasOwnProperty(key)
      );
      
      if (commonKeys.length < 3) {
        return 0; // Not enough common landmarks
      }
      
      // Calculate eye distance for normalization in both faces
      const newEyeDistance = this._calculateDistance(
        newLandmarks['leftEye'].x, newLandmarks['leftEye'].y,
        newLandmarks['rightEye'].x, newLandmarks['rightEye'].y
      );
      
      const storedEyeDistance = this._calculateDistance(
        storedLandmarks['leftEye'].x, storedLandmarks['leftEye'].y,
        storedLandmarks['rightEye'].x, storedLandmarks['rightEye'].y
      );
      
      // Calculate normalized distances for each landmark
      let totalSimilarity = 0;
      
      for (const key of commonKeys) {
        // Skip the eyes since we used them for normalization
        if (key === 'leftEye' || key === 'rightEye') continue;
        
        const newPoint = newLandmarks[key];
        const storedPoint = storedLandmarks[key];
        
        // Calculate distance between corresponding points, normalized by eye distance
        const newToLeftEye = this._calculateDistance(
          newPoint.x, newPoint.y,
          newLandmarks['leftEye'].x, newLandmarks['leftEye'].y
        ) / newEyeDistance;
        
        const storedToLeftEye = this._calculateDistance(
          storedPoint.x, storedPoint.y,
          storedLandmarks['leftEye'].x, storedLandmarks['leftEye'].y
        ) / storedEyeDistance;
        
        const newToRightEye = this._calculateDistance(
          newPoint.x, newPoint.y,
          newLandmarks['rightEye'].x, newLandmarks['rightEye'].y
        ) / newEyeDistance;
        
        const storedToRightEye = this._calculateDistance(
          storedPoint.x, storedPoint.y,
          storedLandmarks['rightEye'].x, storedLandmarks['rightEye'].y
        ) / storedEyeDistance;
        
        // Calculate similarity for this landmark (1 = identical, 0 = completely different)
        const leftEyeSimilarity = 1 - Math.min(Math.abs(newToLeftEye - storedToLeftEye), 1);
        const rightEyeSimilarity = 1 - Math.min(Math.abs(newToRightEye - storedToRightEye), 1);
        
        // Average the similarities
        const landmarkSimilarity = (leftEyeSimilarity + rightEyeSimilarity) / 2;
        totalSimilarity += landmarkSimilarity;
      }
      
      // Average similarity across all landmarks
      return totalSimilarity / (commonKeys.length - 2); // -2 because we skipped the eyes
    } catch (error) {
      console.error('Error comparing landmarks:', error);
      return 0;
    }
  }
  
  _compareMetrics(newData, storedData) {
    try {
      if (!newData.metrics || !storedData.metrics) {
        return 0.5; // Neutral if metrics aren't available
      }
      
      const newMetrics = newData.metrics;
      const storedMetrics = storedData.metrics;
      
      const commonKeys = Object.keys(newMetrics).filter(key => 
        storedMetrics.hasOwnProperty(key)
      );
      
      if (commonKeys.length < 2) {
        return 0.5; // Not enough common metrics
      }
      
      // Calculate similarity for each metric
      let totalSimilarity = 0;
      
      for (const key of commonKeys) {
        const newValue = newMetrics[key];
        const storedValue = storedMetrics[key];
        
        // Calculate similarity (1 = identical, 0 = completely different)
        // We cap the difference at 0.3 to avoid extreme penalties for slight variations
        const similarity = 1 - Math.min(Math.abs(newValue - storedValue) / Math.max(newValue, storedValue, 0.001), 0.3);
        totalSimilarity += similarity;
      }
      
      // Average similarity across all metrics
      return totalSimilarity / commonKeys.length;
    } catch (error) {
      console.error('Error comparing metrics:', error);
      return 0.5;
    }
  }
  
  _compareAngles(newData, storedData) {
    try {
      // Compare head orientation angles
      const angles = ['headEulerAngleX', 'headEulerAngleY', 'headEulerAngleZ'];
      
      let totalSimilarity = 0;
      let validAngles = 0;
      
      for (const angle of angles) {
        if (newData[angle] != null && storedData[angle] != null) {
          // Normalize angle differences (angles can be from -180 to 180)
          let diff = Math.abs(newData[angle] - storedData[angle]);
          diff = Math.min(diff, 360 - diff); // Handle wraparound
          
          // Convert to similarity (max difference is capped at 30 degrees)
          const similarity = 1 - Math.min(diff / 30, 1);
          totalSimilarity += similarity;
          validAngles++;
        }
      }
      
      // If no valid angles were found, return neutral value
      if (validAngles === 0) return 0.5;
      
      return totalSimilarity / validAngles;
    } catch (error) {
      console.error('Error comparing angles:', error);
      return 0.5;
    }
  }
  
  _compareExpressions(newData, storedData) {
    try {
      // Compare facial expressions (smiling, eye openness)
      const expressions = [
        'smilingProbability',
        'leftEyeOpenProbability',
        'rightEyeOpenProbability'
      ];
      
      let totalSimilarity = 0;
      let validExpressions = 0;
      
      for (const expr of expressions) {
        if (newData[expr] != null && storedData[expr] != null) {
          // Calculate difference in probability (0-1 range)
          const diff = Math.abs(newData[expr] - storedData[expr]);
          
          // We're more tolerant of expression differences
          // Even a 0.5 difference only reduces similarity to 0.5
          const similarity = 1 - diff;
          totalSimilarity += similarity;
          validExpressions++;
        }
      }
      
      // If no valid expressions were found, return neutral value
      if (validExpressions === 0) return 0.5;
      
      return totalSimilarity / validExpressions;
    } catch (error) {
      console.error('Error comparing expressions:', error);
      return 0.5;
    }
  }
  
  _calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
}

export default FaceCompare;


// =========================================
// 4. Routes Configuration - User and face authentication routes
// =========================================
// routes/user.routes.js

import express from 'express';
import * as userController from '../controllers/user.controller.js';
import * as faceController from '../controllers/face.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// User routes
router.get('/me', authMiddleware, userController.getCurrentUser);
router.patch('/update', authMiddleware, userController.updateUser);
router.patch('/updatePassword', authMiddleware, userController.updatePassword);

// Face recognition routes
router.post('/register-face', authMiddleware, faceController.registerFace);
router.post('/verify-face', authMiddleware, faceController.verifyFace);
router.delete('/delete-face', authMiddleware, faceController.deleteFaceData);

export default router;


// =========================================
// 5. Authentication Middleware - Verify JWT tokens
// =========================================
// middleware/auth.js

import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import config from '../config/config.js';

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token missing or invalid format'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token missing'
      });
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Find user by ID
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Add user info to request object
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role
      };
      
      next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

export default authMiddleware;


// =========================================
// 6. Logger Utility - Logging service for the backend
// =========================================
// utils/logger.js

import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'tron-academy-api' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error' 
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log')
    }),
    // Special file for face recognition logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'face-recognition.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
      )
    })
  ]
});

export default logger;


// =========================================
// 7. App Configuration - App entry point and configuration
// =========================================
// app.js

import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/config.js';
import logger from './utils/logger.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';

// Create Express app
const app = express();

// Connect to MongoDB
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('Connected to MongoDB');
})
.catch(err => {
  logger.error('MongoDB connection error:', err);
  process.exit(1);
});

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' })); // Increased limit for face data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;


// =========================================
// 8. Configuration - Environment-based configuration
// =========================================
// config/config.js

import dotenv from 'dotenv';
dotenv.config();

const config = {
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/tron_academy',
  jwtSecret: process.env.JWT_SECRET || 'your_default_jwt_secret_key',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  faceVerification: {
    threshold: process.env.FACE_SIMILARITY_THRESHOLD || 0.75,
    weights: {
      landmarks: process.env.FACE_LANDMARKS_WEIGHT || 0.5,
      metrics: process.env.FACE_METRICS_WEIGHT || 0.3,
      angles: process.env.FACE_ANGLES_WEIGHT || 0.1,
      expressions: process.env.FACE_EXPRESSIONS_WEIGHT || 0.1
    }
  }
};

export default config;


// =========================================
// 9. Package.json Update - Add type: module
// =========================================
/*
{
  "name": "tron-academy-api",
  "version": "1.0.0",
  "description": "Backend API for Tron Academy App",
  "main": "app.js",
  "type": "module",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.0.0",
    "jsonwebtoken": "^9.0.1",
    "mongoose": "^7.4.3",
    "morgan": "^1.10.0",
    "winston": "^3.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
*/
