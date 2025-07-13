const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');
const csv = require('csv-parser');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { authenticateToken, checkDeviceApproval, logAction } = require('../middleware/auth');
const { aesEncrypt, aesDecrypt } = require('../utils/crypto');
const DatabaseService = require('../services/database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/json'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV, Excel, and JSON files are allowed'), false);
        }
    }
});

// Apply authentication and device approval middleware to all routes
router.use(authenticateToken);
router.use(checkDeviceApproval);
router.use(logAction);

// Export passwords as CSV
router.get('/export/csv', async (req, res) => {
    try {
        const passwords = await DatabaseService.getPasswords(req.user.id);

        // Decrypt passwords
        const decryptedPasswords = passwords.map(password => {
            const decryptedPassword = aesDecrypt(req.user.aes_key, password.encrypted_password);
            return {
                _id: password.id,
                website: password.website,
                username: password.username,
                password: decryptedPassword,
                date_created: password.date_created
            };
        });

        // Create CSV content
        const csvHeader = 'Website,Username,Password,Date Created\n';
        const csvRows = decryptedPasswords.map(pwd =>
            `"${pwd.website}","${pwd.username}","${pwd.password}","${pwd.date_created}"`
        ).join('\n');
        const csvContent = csvHeader + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="vaultify_passwords.csv"');
        res.send(csvContent);

    } catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({ error: 'Failed to export passwords' });
    }
});

// Export passwords as Excel
router.get('/export/excel', async (req, res) => {
    try {
        const passwords = await DatabaseService.getPasswords(req.user.id);

        // Decrypt passwords
        const decryptedPasswords = passwords.map(password => {
            const decryptedPassword = aesDecrypt(req.user.aes_key, password.encrypted_password);
            return {
                _id: password.id,
                Website: password.website,
                Username: password.username,
                Password: decryptedPassword,
                'Date Created': password.date_created
            };
        });

        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Passwords');

        // Add headers
        worksheet.columns = [
            { header: 'Website', key: 'website', width: 30 },
            { header: 'Username', key: 'username', width: 25 },
            { header: 'Password', key: 'password', width: 25 },
            { header: 'Date Created', key: 'dateCreated', width: 20 }
        ];

        // Add data rows
        decryptedPasswords.forEach(pwd => {
            worksheet.addRow({
                website: pwd.Website,
                username: pwd.Username,
                password: pwd.Password,
                dateCreated: pwd['Date Created']
            });
        });

        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="vaultify_passwords.xlsx"');
        res.send(buffer);

    } catch (error) {
        console.error('Export Excel error:', error);
        res.status(500).json({ error: 'Failed to export passwords' });
    }
});

// Export passwords as JSON
router.get('/export/json', async (req, res) => {
    try {
        const passwords = await DatabaseService.getPasswords(req.user.id);

        // Decrypt passwords
        const decryptedPasswords = passwords.map(password => {
            const decryptedPassword = aesDecrypt(req.user.aes_key, password.encrypted_password);
            return {
                _id: password.id,
                website: password.website,
                username: password.username,
                password: decryptedPassword,
                date_created: password.date_created
            };
        });

        const exportData = {
            export_date: new Date().toISOString(),
            total_passwords: decryptedPasswords.length,
            passwords: decryptedPasswords
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="vaultify_passwords.json"');
        res.json(exportData);

    } catch (error) {
        console.error('Export JSON error:', error);
        res.status(500).json({ error: 'Failed to export passwords' });
    }
});

// Export passwords as PDF
router.get('/export/pdf', async (req, res) => {
    try {
        const passwords = await DatabaseService.getPasswords(req.user.id);

        // Decrypt passwords
        const decryptedPasswords = passwords.map(password => {
            const decryptedPassword = aesDecrypt(req.user.aes_key, password.encrypted_password);
            return {
                _id: password.id,
                website: password.website,
                username: password.username,
                password: decryptedPassword,
                date_created: password.date_created
            };
        });

        // Create PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="vaultify_passwords.pdf"');

        // Pipe PDF to response
        doc.pipe(res);

        // Add title
        doc.fontSize(24)
            .font('Helvetica-Bold')
            .text('Vaultify Password Manager', { align: 'center' })
            .moveDown();

        doc.fontSize(14)
            .font('Helvetica')
            .text(`Password Export - ${new Date().toLocaleDateString()}`, { align: 'center' })
            .moveDown(2);

        // Add summary
        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text(`Total Passwords: ${decryptedPasswords.length}`)
            .moveDown();

        if (decryptedPasswords.length === 0) {
            doc.fontSize(12)
                .font('Helvetica')
                .text('No passwords to export.')
                .moveDown();
        } else {
            // Add table headers
            const tableTop = doc.y;
            const tableLeft = 50;
            const colWidth = 150;
            const rowHeight = 25;

            // Draw table headers
            doc.fontSize(10)
                .font('Helvetica-Bold')
                .text('Website', tableLeft, tableTop)
                .text('Username', tableLeft + colWidth, tableTop)
                .text('Password', tableLeft + colWidth * 2, tableTop)
                .text('Date Created', tableLeft + colWidth * 3, tableTop);

            // Draw header underline
            doc.moveTo(tableLeft, tableTop + 15)
                .lineTo(tableLeft + colWidth * 4, tableTop + 15)
                .stroke();

            // Add password entries
            let currentY = tableTop + 25;
            doc.fontSize(9)
                .font('Helvetica');

            decryptedPasswords.forEach((password, index) => {
                // Check if we need a new page
                if (currentY > 700) {
                    doc.addPage();
                    currentY = 50;
                }

                // Add password entry
                doc.text(password.website || 'N/A', tableLeft, currentY)
                    .text(password.username || 'N/A', tableLeft + colWidth, currentY)
                    .text(password.password || 'N/A', tableLeft + colWidth * 2, currentY)
                    .text(new Date(password.date_created).toLocaleDateString(), tableLeft + colWidth * 3, currentY);

                currentY += rowHeight;
            });
        }

        // Add footer
        doc.fontSize(8)
            .font('Helvetica')
            .text('Generated by Vaultify Password Manager', { align: 'center' })
            .moveDown()
            .text('Keep this document secure and do not share it with others.', { align: 'center' });

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error('Export PDF error:', error);
        res.status(500).json({ error: 'Failed to export passwords' });
    }
});

// Import passwords from CSV
router.post('/import/csv', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const csvContent = req.file.buffer.toString();
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

        // Validate headers
        const requiredHeaders = ['website', 'username', 'password'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            return res.status(400).json({
                error: `Missing required headers: ${missingHeaders.join(', ')}`
            });
        }

        const importedPasswords = [];
        const errors = [];

        // Process each line (skip header)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            try {
                // Parse CSV line (handle quoted values)
                const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
                const row = values.map(v => v.replace(/"/g, '').trim());

                if (row.length >= 3) {
                    const website = row[headers.indexOf('website')];
                    const username = row[headers.indexOf('username')];
                    const password = row[headers.indexOf('password')];

                    if (website && username && password) {
                        // Encrypt password
                        const encryptedPassword = aesEncrypt(req.user.aes_key, password);

                        // Check if password already exists
                        const existingPasswords = await DatabaseService.getPasswords(req.user.id);
                        const existingPassword = existingPasswords.find(p =>
                            p.website === website && p.username === username
                        );

                        if (!existingPassword) {
                            const passwordData = {
                                website,
                                username,
                                encrypted_password: encryptedPassword,
                                user_id: req.user.id
                            };
                            await DatabaseService.createPassword(passwordData);
                            importedPasswords.push({ website, username });
                        } else {
                            errors.push(`Duplicate entry: ${website} - ${username}`);
                        }
                    }
                }
            } catch (error) {
                errors.push(`Error processing line ${i + 1}: ${error.message}`);
            }
        }

        res.json({
            message: `Import completed. ${importedPasswords.length} passwords imported.`,
            imported: importedPasswords.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Import CSV error:', error);
        res.status(500).json({ error: 'Failed to import passwords' });
    }
});

// Import passwords from Excel
router.post('/import/excel', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read Excel file
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);

        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
            return res.status(400).json({ error: 'No worksheet found in Excel file' });
        }

        const importedPasswords = [];
        const errors = [];

        // Get headers from first row
        const headerRow = worksheet.getRow(1);
        const headers = headerRow.values.slice(1); // Remove first empty value

        // Validate headers
        const requiredHeaders = ['website', 'username', 'password'];
        const missingHeaders = requiredHeaders.filter(h =>
            !headers.some(header => header && header.toLowerCase().includes(h))
        );

        if (missingHeaders.length > 0) {
            return res.status(400).json({
                error: `Missing required headers: ${missingHeaders.join(', ')}`
            });
        }

        // Process each row (skip header)
        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            try {
                const values = row.values.slice(1); // Remove first empty value

                // Find website, username, password columns
                const websiteIndex = headers.findIndex(h => h && h.toLowerCase().includes('website'));
                const usernameIndex = headers.findIndex(h => h && h.toLowerCase().includes('username'));
                const passwordIndex = headers.findIndex(h => h && h.toLowerCase().includes('password'));

                const website = values[websiteIndex];
                const username = values[usernameIndex];
                const password = values[passwordIndex];

                if (website && username && password) {
                    // Encrypt password
                    const encryptedPassword = aesEncrypt(req.user.aes_key, password);

                    // Check if password already exists
                    const existingPasswords = await DatabaseService.getPasswords(req.user.id);
                    const existingPassword = existingPasswords.find(p =>
                        p.website === website && p.username === username
                    );

                    if (!existingPassword) {
                        const passwordData = {
                            website,
                            username,
                            encrypted_password: encryptedPassword,
                            user_id: req.user.id
                        };
                        await DatabaseService.createPassword(passwordData);
                        importedPasswords.push({ website, username });
                    } else {
                        errors.push(`Duplicate entry: ${website} - ${username}`);
                    }
                }
            } catch (error) {
                errors.push(`Error processing row ${rowNumber}: ${error.message}`);
            }
        }

        res.json({
            message: `Import completed. ${importedPasswords.length} passwords imported.`,
            imported: importedPasswords.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Import Excel error:', error);
        res.status(500).json({ error: 'Failed to import passwords' });
    }
});

// Import passwords from JSON
router.post('/import/json', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const jsonContent = req.file.buffer.toString();
        const data = JSON.parse(jsonContent);

        if (!data.passwords || !Array.isArray(data.passwords)) {
            return res.status(400).json({ error: 'Invalid JSON format. Expected "passwords" array.' });
        }

        const importedPasswords = [];
        const errors = [];

        for (const passwordData of data.passwords) {
            try {
                const { website, username, password } = passwordData;

                if (website && username && password) {
                    // Encrypt password
                    const encryptedPassword = aesEncrypt(req.user.aes_key, password);

                    // Check if password already exists
                    const existingPasswords = await DatabaseService.getPasswords(req.user.id);
                    const existingPassword = existingPasswords.find(p =>
                        p.website === website && p.username === username
                    );

                    if (!existingPassword) {
                        const newPasswordData = {
                            website,
                            username,
                            encrypted_password: encryptedPassword,
                            user_id: req.user.id
                        };
                        await DatabaseService.createPassword(newPasswordData);
                        importedPasswords.push({ website, username });
                    } else {
                        errors.push(`Duplicate entry: ${website} - ${username}`);
                    }
                }
            } catch (error) {
                errors.push(`Error processing password: ${error.message}`);
            }
        }

        res.json({
            message: `Import completed. ${importedPasswords.length} passwords imported.`,
            imported: importedPasswords.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Import JSON error:', error);
        res.status(500).json({ error: 'Failed to import passwords' });
    }
});

// Get import/export statistics
router.get('/stats', async (req, res) => {
    try {
        const passwords = await DatabaseService.getPasswords(req.user.id);
        const totalPasswords = passwords.length;

        // This would require additional logging for import/export activities
        // For now, return basic stats
        res.json({
            totalPasswords,
            exportFormats: ['CSV', 'Excel', 'JSON'],
            importFormats: ['CSV', 'Excel', 'JSON']
        });
    } catch (error) {
        console.error('Get import/export stats error:', error);
        res.status(500).json({ error: 'Failed to get import/export statistics' });
    }
});

module.exports = router; 