import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../utils/prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { uploadToGCS, isGCSConfigured } from '../lib/gcs';
import { randomUUID } from 'crypto';

const router = Router();

// Configure multer for PDF uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'company');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage if GCS is configured, otherwise use disk storage
const storage = isGCSConfigured()
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `company-${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for PDF files
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

/**
 * GET /api/v1/company/profile
 * Get company profile (FOUNDER only)
 */
router.get('/profile', authenticateToken, requireRole(['FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    // Get company profile (should be single record)
    const companyProfile = await prisma.company_profile.findFirst({
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!companyProfile) {
      // Return default values if no profile exists
      return res.json({
        success: true,
        data: {
          companyName: 'Banda Chao FZ-LLC',
          tradeLicenseNumber: null,
          taxRegistrationNumber: null,
          licenseExpiryDate: null,
          licenseFileUrl: null,
          taxCertFileUrl: null,
        },
      });
    }

    res.json({
      success: true,
      data: {
        companyName: companyProfile.company_name,
        tradeLicenseNumber: companyProfile.trade_license_number,
        taxRegistrationNumber: companyProfile.tax_registration_number,
        licenseExpiryDate: companyProfile.license_expiry_date,
        licenseFileUrl: companyProfile.license_file_url,
        taxCertFileUrl: companyProfile.tax_cert_file_url,
      },
    });
  } catch (error: any) {
    console.error('[Company API] Error fetching company profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company profile',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/v1/company/profile
 * Create or update company profile (FOUNDER only)
 * Supports multipart/form-data with PDF file uploads
 */
router.post(
  '/profile',
  authenticateToken,
  requireRole(['FOUNDER']),
  upload.fields([
    { name: 'licenseFile', maxCount: 1 },
    { name: 'taxCertFile', maxCount: 1 },
  ]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { companyName, tradeLicenseNumber, taxRegistrationNumber, licenseExpiryDate } = req.body;

      // Validate required fields
      if (!companyName || !companyName.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Company name is required',
        });
      }

      // Handle file uploads
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      let licenseFileUrl: string | null = null;
      let taxCertFileUrl: string | null = null;

      // Upload license file if provided
      if (files?.licenseFile && files.licenseFile[0]) {
        const file = files.licenseFile[0];
        if (isGCSConfigured() && file.buffer) {
          licenseFileUrl = await uploadToGCS(file.buffer, file.originalname, 'company');
        } else if (file.path) {
          licenseFileUrl = `/uploads/company/${path.basename(file.path)}`;
        }
      }

      // Upload tax certificate file if provided
      if (files?.taxCertFile && files.taxCertFile[0]) {
        const file = files.taxCertFile[0];
        if (isGCSConfigured() && file.buffer) {
          taxCertFileUrl = await uploadToGCS(file.buffer, file.originalname, 'company');
        } else if (file.path) {
          taxCertFileUrl = `/uploads/company/${path.basename(file.path)}`;
        }
      }

      // Parse license expiry date
      const licenseExpiryDateValue = licenseExpiryDate ? new Date(licenseExpiryDate) : null;

      // Check if company profile exists
      const existingProfile = await prisma.company_profile.findFirst({
        orderBy: {
          created_at: 'desc',
        },
      });

      let companyProfile;

      if (existingProfile) {
        // Update existing profile
        companyProfile = await prisma.company_profile.update({
          where: { id: existingProfile.id },
          data: {
            company_name: companyName.trim(),
            trade_license_number: tradeLicenseNumber?.trim() || null,
            tax_registration_number: taxRegistrationNumber?.trim() || null,
            license_expiry_date: licenseExpiryDateValue,
            license_file_url: licenseFileUrl || existingProfile.license_file_url, // Keep existing if not updated
            tax_cert_file_url: taxCertFileUrl || existingProfile.tax_cert_file_url, // Keep existing if not updated
            updated_at: new Date(),
          },
        });
      } else {
        // Create new profile
        companyProfile = await prisma.company_profile.create({
          data: {
            id: randomUUID(),
            company_name: companyName.trim(),
            trade_license_number: tradeLicenseNumber?.trim() || null,
            tax_registration_number: taxRegistrationNumber?.trim() || null,
            license_expiry_date: licenseExpiryDateValue,
            license_file_url: licenseFileUrl,
            tax_cert_file_url: taxCertFileUrl,
          },
        });
      }

      res.json({
        success: true,
        data: {
          companyName: companyProfile.company_name,
          tradeLicenseNumber: companyProfile.trade_license_number,
          taxRegistrationNumber: companyProfile.tax_registration_number,
          licenseExpiryDate: companyProfile.license_expiry_date,
          licenseFileUrl: companyProfile.license_file_url,
          taxCertFileUrl: companyProfile.tax_cert_file_url,
        },
        message: 'Company profile saved successfully',
      });
    } catch (error: any) {
      console.error('[Company API] Error saving company profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save company profile',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

export default router;
