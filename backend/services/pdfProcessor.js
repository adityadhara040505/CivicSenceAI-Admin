const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const Policy = require('../models/Policy');

/**
 * Processes a PDF file: sends it to extraction API and updates/creates Policy record
 * @param {string} filePath - Local path to the PDF file
 * @param {string} title - Title of the policy
 * @param {string} category - Category of the policy
 * @param {Object} extraData - Additional data to save (e.g. uploadedBy)
 */
async function processPdfFile(filePath, title, category, extraData = {}) {
    console.log(`📄 Processing PDF file: ${title}`);

    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        // 1. Call Extraction API
        const form = new FormData();
        const fileName = path.basename(filePath);
        form.append('pdf', fs.createReadStream(filePath), { filename: fileName });

        console.log(`🔄 Calling extraction API for ${fileName}...`);
        const apiUrl = process.env.EXTRACTION_API_URL || 'https://chorally-venomless-jacalyn.ngrok-free.dev/extract';

        const extractResponse = await axios.post(apiUrl, form, {
            headers: {
                ...form.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        const jsonData = extractResponse.data;
        console.log(`✅ Received JSON data from API`);

        // 2. Prepare policy data
        const policyData = {
            name: title,
            title,
            category: category || 'Budget',
            description: jsonData.summary || jsonData.Description || title,
            fileName: fileName,
            fileSize: fs.statSync(filePath).size,
            filePath: filePath,
            status: 'Active',
            processedData: jsonData,
            uploadDate: new Date(),
            ...extraData
        };

        // 3. Save or Update in MongoDB
        let policy;
        if (extraData.policyId) {
            policy = await Policy.findByIdAndUpdate(extraData.policyId, policyData, { new: true });
        } else {
            policy = new Policy(policyData);
            await policy.save();
        }

        console.log(`💾 Saved processed PDF data to MongoDB for: ${title}`);
        return policy;
    } catch (err) {
        console.error(`❌ PDF processing failed for ${title}: ${err.message}`);
        throw err;
    }
}

module.exports = {
    processPdfFile
};
