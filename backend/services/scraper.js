const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const ScrapedDocument = require('../models/ScrapedDocument');
const Policy = require('../models/Policy');
const Scheme = require('../models/Scheme');
const pdfProcessor = require('./pdfProcessor');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// ============================================================
// Configuration
// ============================================================
const CONFIG = {
    BASE_URL: 'https://www.india.gov.in',
    MYSCHEME_API: 'https://api.myscheme.gov.in/search/v4/schemes',
    MYSCHEME_DETAIL: 'https://www.myscheme.gov.in/schemes',
    SCHEMES_SEARCH: 'https://www.india.gov.in/my-government/schemes/search',
    SPOTLIGHT_URL: 'https://www.india.gov.in/spotlight',
    DOCUMENTS_URL: 'https://www.india.gov.in/my-government/documents',
    PIB_URL: 'https://pib.gov.in',
    PUPPETEER_OPTS: {
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1920,1080'
        ],
        executablePath: '/usr/bin/google-chrome',
        timeout: 120000
    },
    PAGE_TIMEOUT: 120000,
    DELAY_BETWEEN_REQUESTS: 2000,   // ms between each page to avoid rate limiting
    MAX_PAGES: 50,                   // max pages to scrape per category
    MAX_SCHEMES_PER_RUN: 100,        // max schemes to scrape in one run
    MAX_POLICIES_PER_RUN: 50,
    MAX_SPOTLIGHTS_PER_RUN: 30
};

// ============================================================
// Utility helpers
// ============================================================
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const cleanText = (text) => {
    if (!text) return '';
    return text
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();
};

const categorizeDocument = (title, content) => {
    const text = `${title} ${content}`.toLowerCase();

    if (text.includes('budget') || text.includes('fiscal') || text.includes('finance bill')) return 'Budget';
    if (text.includes('agriculture') || text.includes('kisan') || text.includes('farmer') || text.includes('crop')) return 'Agriculture';
    if (text.includes('education') || text.includes('school') || text.includes('learning') || text.includes('scholarship')) return 'Education';
    if (text.includes('housing') || text.includes('awas') || text.includes('urban')) return 'Housing';
    if (text.includes('health') || text.includes('medical') || text.includes('ayushman') || text.includes('wellness')) return 'Health';
    if (text.includes('msme') || text.includes('enterprise') || text.includes('startup') || text.includes('mudra')) return 'MSME';
    if (text.includes('tax') || text.includes('gst') || text.includes('income tax') || text.includes('revenue')) return 'Tax';
    if (text.includes('sustainability') || text.includes('environment') || text.includes('solar') || text.includes('green')) return 'Sustainability';
    if (text.includes('technology') || text.includes('digital') || text.includes('it ') || text.includes('cyber')) return 'Technology';
    if (text.includes('employment') || text.includes('job') || text.includes('skill') || text.includes('labour')) return 'Employment';
    return 'General';
};

const determinePolicyCategory = (title, content) => {
    const category = categorizeDocument(title, content);
    const validCategories = ['Budget', 'Tax', 'Agriculture', 'MSME', 'Housing', 'Education', 'Sustainability', 'Technology', 'Employment'];
    return validCategories.includes(category) ? category : 'Budget'; // fallback to Budget
};

/**
 * Downloads a PDF and uses pdfProcessor to call extraction API
 */
async function processPdf(pdfUrl, title, category) {
    console.log(`      📄 Scraping PDF: ${title}`);
    const tempDir = path.join(__dirname, '../uploads/temp');
    const tempFilePath = path.join(tempDir, `temp_${Date.now()}.pdf`);

    try {
        // 1. Download PDF
        const response = await axios({
            url: pdfUrl,
            method: 'GET',
            responseType: 'stream'
        });

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // 2. Use the central processor
        const policy = await pdfProcessor.processPdfFile(tempFilePath, title, category, {
            isAutoScraped: true,
            filePath: pdfUrl // Keep original URL as path for scraped docs
        });

        // Clean up temp file (pdfProcessor might not know it's a temp file)
        if (fs.existsSync(tempFilePath)) {
            try { fs.unlinkSync(tempFilePath); } catch (e) { }
        }

        return policy;
    } catch (err) {
        if (fs.existsSync(tempFilePath)) {
            try { fs.unlinkSync(tempFilePath); } catch (e) { }
        }
        throw err;
    }
}

// Track active scraping sessions
let scrapingStatus = {
    isRunning: false,
    currentTask: '',
    progress: 0,
    totalItems: 0,
    scrapedItems: 0,
    errors: [],
    startedAt: null,
    lastRunAt: null
};

const getStatus = () => ({ ...scrapingStatus });

// ============================================================
// 1. SCRAPE GOVERNMENT SCHEMES  (from myscheme.gov.in)
// ============================================================
async function scrapeSchemes() {
    console.log('🔍 Starting scheme scraping from myScheme.gov.in...');
    scrapingStatus.currentTask = 'Scraping Government Schemes';

    let browser;
    const results = { added: 0, updated: 0, failed: 0, total: 0 };

    try {
        browser = await puppeteer.launch(CONFIG.PUPPETEER_OPTS);
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Navigate to schemes search page
        await page.goto(`${CONFIG.SCHEMES_SEARCH}?pagenumber=1`, {
            waitUntil: 'domcontentloaded',
            timeout: CONFIG.PAGE_TIMEOUT
        });
        await sleep(3000);

        // Get total count & scheme links from first page
        let totalSchemes = 0;
        try {
            const countText = await page.$eval('[class*="total"], [class*="count"], .result-count', el => el.textContent);
            const match = countText.match(/(\d+)/);
            if (match) totalSchemes = parseInt(match[1]);
        } catch (e) {
            console.log('  Could not extract total count, will scrape available pages');
        }

        console.log(`  📊 Found approximately ${totalSchemes || 'unknown'} schemes`);

        // Scrape scheme links across pages
        const schemeLinks = [];
        let currentPage = 1;
        const maxPages = Math.min(CONFIG.MAX_PAGES, Math.ceil(CONFIG.MAX_SCHEMES_PER_RUN / 10));

        while (currentPage <= maxPages) {
            scrapingStatus.progress = Math.round((currentPage / maxPages) * 50);
            console.log(`  📄 Scraping page ${currentPage}...`);

            try {
                if (currentPage > 1) {
                    await page.goto(`${CONFIG.SCHEMES_SEARCH}?pagenumber=${currentPage}`, {
                        waitUntil: 'domcontentloaded',
                        timeout: CONFIG.PAGE_TIMEOUT
                    });
                    await sleep(2000);
                }

                // Extract scheme links from the page
                const links = await page.evaluate(() => {
                    const results = [];
                    // Look for scheme cards/links
                    const anchors = document.querySelectorAll('a[href*="myscheme.gov.in/schemes/"], a[href*="/schemes/"]');
                    anchors.forEach(a => {
                        const href = a.href;
                        const title = a.textContent?.trim() || a.getAttribute('title') || '';
                        if (href && title && !results.find(r => r.url === href)) {
                            results.push({ url: href, title });
                        }
                    });

                    // Also look for scheme cards with data attributes
                    const cards = document.querySelectorAll('[class*="scheme"], [class*="card"]');
                    cards.forEach(card => {
                        const link = card.querySelector('a');
                        const title = card.querySelector('h3, h4, [class*="title"]');
                        if (link && title) {
                            const href = link.href;
                            const name = title.textContent?.trim();
                            if (href && name && !results.find(r => r.url === href)) {
                                results.push({ url: href, title: name });
                            }
                        }
                    });

                    return results;
                });

                if (links.length === 0) {
                    console.log(`  ⚠️  No schemes found on page ${currentPage}, stopping pagination`);
                    break;
                }

                schemeLinks.push(...links);
                console.log(`    Found ${links.length} schemes on page ${currentPage}`);
            } catch (err) {
                console.error(`  ❌ Error on page ${currentPage}:`, err.message);
                scrapingStatus.errors.push(`Scheme page ${currentPage}: ${err.message}`);
            }

            await sleep(CONFIG.DELAY_BETWEEN_REQUESTS);
            currentPage++;
        }

        // Deduplicate
        const uniqueSchemes = [];
        const seenUrls = new Set();
        for (const s of schemeLinks) {
            if (!seenUrls.has(s.url)) {
                seenUrls.add(s.url);
                uniqueSchemes.push(s);
            }
        }

        results.total = uniqueSchemes.length;
        scrapingStatus.totalItems = uniqueSchemes.length;
        console.log(`  📋 Total unique schemes to scrape: ${uniqueSchemes.length}`);

        // Scrape individual scheme details
        for (let i = 0; i < Math.min(uniqueSchemes.length, CONFIG.MAX_SCHEMES_PER_RUN); i++) {
            const scheme = uniqueSchemes[i];
            scrapingStatus.scrapedItems = i + 1;
            scrapingStatus.progress = 50 + Math.round(((i + 1) / uniqueSchemes.length) * 50);

            try {
                // Check if already scraped
                const existing = await ScrapedDocument.findOne({ sourceUrl: scheme.url });
                if (existing) {
                    results.updated++;
                    continue;
                }

                console.log(`  🔄 [${i + 1}/${uniqueSchemes.length}] Scraping: ${scheme.title}`);

                await page.goto(scheme.url, {
                    waitUntil: 'domcontentloaded',
                    timeout: CONFIG.PAGE_TIMEOUT
                });
                await sleep(2000);

                // Extract detailed content
                const details = await page.evaluate(() => {
                    const getText = (selector) => {
                        const el = document.querySelector(selector);
                        return el ? el.textContent.trim() : '';
                    };

                    const getContent = () => {
                        // Try various content selectors
                        const selectors = [
                            '.scheme-detail', '.scheme-content', '.content-area',
                            'main', '#main-content', '[role="main"]',
                            '.detail-page', '.page-content', 'article'
                        ];
                        for (const sel of selectors) {
                            const el = document.querySelector(sel);
                            if (el && el.textContent.trim().length > 100) {
                                return el.textContent.trim();
                            }
                        }
                        return document.body.textContent.trim();
                    };

                    const getSections = () => {
                        const sections = {};
                        const headings = document.querySelectorAll('h2, h3, h4, .section-title');
                        headings.forEach(heading => {
                            const key = heading.textContent.trim().toLowerCase();
                            let content = '';
                            let sibling = heading.nextElementSibling;
                            while (sibling && !['H2', 'H3', 'H4'].includes(sibling.tagName)) {
                                content += sibling.textContent.trim() + '\n';
                                sibling = sibling.nextElementSibling;
                            }
                            if (content) sections[key] = content.trim();
                        });
                        return sections;
                    };

                    return {
                        title: getText('h1') || getText('.scheme-title') || getText('title'),
                        content: getContent(),
                        sections: getSections(),
                        ministry: getText('[class*="ministry"]') || getText('[class*="department"]'),
                        tags: Array.from(document.querySelectorAll('[class*="tag"], [class*="label"], [class*="category"]'))
                            .map(el => el.textContent.trim())
                            .filter(t => t.length > 0 && t.length < 50)
                    };
                });

                const title = details.title || scheme.title;
                const content = cleanText(details.content);

                if (content.length < 50) {
                    console.log(`    ⚠️  Insufficient content for: ${title}`);
                    results.failed++;
                    continue;
                }

                // Build scheme-specific details from sections
                const sections = details.sections;
                const schemeInfo = {
                    benefits: sections['benefits'] || sections['benefit'] || '',
                    eligibility: sections['eligibility'] || sections['eligibility criteria'] || '',
                    applicationProcess: sections['application process'] || sections['how to apply'] || '',
                    documentsRequired: sections['documents required'] || sections['required documents'] || '',
                    targetBeneficiaries: sections['target beneficiaries'] || sections['beneficiaries'] || '',
                    implementingAgency: details.ministry || '',
                    schemeType: scheme.url.includes('state') ? 'State' : 'Central',
                    state: ''
                };

                // Save to ScrapedDocument
                const doc = new ScrapedDocument({
                    title,
                    sourceUrl: scheme.url,
                    content: content.substring(0, 50000), // limit content size
                    summary: content.substring(0, 500),
                    documentType: 'scheme',
                    category: categorizeDocument(title, content),
                    ministry: details.ministry || schemeInfo.implementingAgency,
                    tags: details.tags.slice(0, 10),
                    schemeDetails: schemeInfo,
                    source: 'myscheme.gov.in',
                    scrapeStatus: 'scraped'
                });

                await doc.save();

                // Also sync to Scheme model
                const existingScheme = await Scheme.findOne({ name: title });
                if (!existingScheme) {
                    const newScheme = new Scheme({
                        name: title,
                        category: categorizeDocument(title, content),
                        description: content.substring(0, 1000),
                        eligibilityRate: 0,
                        totalApplications: 0,
                        approvedApplications: 0,
                        avgBenefit: '₹0',
                        status: 'Active'
                    });
                    await newScheme.save();
                    doc.linkedSchemeId = newScheme._id;
                    await doc.save();
                }

                results.added++;
                console.log(`    ✅ Saved: ${title}`);
            } catch (err) {
                console.error(`    ❌ Failed: ${scheme.title} - ${err.message}`);
                scrapingStatus.errors.push(`Scheme "${scheme.title}": ${err.message}`);
                results.failed++;
            }

            await sleep(CONFIG.DELAY_BETWEEN_REQUESTS);
        }
    } catch (err) {
        console.error('❌ Scheme scraping error:', err.message);
        scrapingStatus.errors.push(`Scheme scraping: ${err.message}`);
    } finally {
        if (browser) await browser.close();
    }

    return results;
}

// ============================================================
// 2. SCRAPE SPOTLIGHT ARTICLES (policy highlights, amendments)
// ============================================================
async function scrapeSpotlights() {
    console.log('🔍 Starting spotlight/amendment scraping...');
    scrapingStatus.currentTask = 'Scraping Spotlight Articles & Amendments';

    let browser;
    const results = { added: 0, updated: 0, failed: 0, total: 0 };

    try {
        browser = await puppeteer.launch(CONFIG.PUPPETEER_OPTS);
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Navigate to spotlight page
        await page.goto(CONFIG.SPOTLIGHT_URL, {
            waitUntil: 'domcontentloaded',
            timeout: CONFIG.PAGE_TIMEOUT
        });
        await sleep(3000);

        // Extract spotlight article links
        const spotlightLinks = await page.evaluate((baseUrl) => {
            const results = [];
            const anchors = document.querySelectorAll('a[href*="/spotlight/details/"]');
            anchors.forEach(a => {
                const href = a.href.startsWith('http') ? a.href : baseUrl + a.getAttribute('href');
                const title = a.textContent?.trim() || a.getAttribute('title') || '';
                if (href && title && title.length > 5 && !results.find(r => r.url === href)) {
                    results.push({ url: href, title });
                }
            });
            return results;
        }, CONFIG.BASE_URL);

        console.log(`  📋 Found ${spotlightLinks.length} spotlight articles`);
        results.total = spotlightLinks.length;
        scrapingStatus.totalItems += spotlightLinks.length;

        // Also get spotlight links from the homepage
        await page.goto(CONFIG.BASE_URL, {
            waitUntil: 'domcontentloaded',
            timeout: CONFIG.PAGE_TIMEOUT
        });
        await sleep(3000);

        const homeSpotlights = await page.evaluate((baseUrl) => {
            const results = [];
            const anchors = document.querySelectorAll('a[href*="/spotlight/details/"]');
            anchors.forEach(a => {
                const href = a.href.startsWith('http') ? a.href : baseUrl + a.getAttribute('href');
                const title = a.textContent?.trim() || '';
                if (href && title && title.length > 5 && !results.find(r => r.url === href)) {
                    results.push({ url: href, title });
                }
            });
            return results;
        }, CONFIG.BASE_URL);

        // Merge and deduplicate
        const allSpotlights = [...spotlightLinks];
        for (const s of homeSpotlights) {
            if (!allSpotlights.find(x => x.url === s.url)) {
                allSpotlights.push(s);
            }
        }

        console.log(`  📋 Total unique spotlight articles: ${allSpotlights.length}`);
        results.total = allSpotlights.length;

        // Scrape each spotlight
        for (let i = 0; i < Math.min(allSpotlights.length, CONFIG.MAX_SPOTLIGHTS_PER_RUN); i++) {
            const article = allSpotlights[i];
            scrapingStatus.scrapedItems++;

            try {
                let doc = await ScrapedDocument.findOne({ sourceUrl: article.url });
                let title, content, docType;

                if (!doc) {
                    console.log(`  🔄 [${i + 1}/${allSpotlights.length}] Scraping: ${article.title}`);

                    await page.goto(article.url, {
                        waitUntil: 'domcontentloaded',
                        timeout: CONFIG.PAGE_TIMEOUT
                    });
                    await sleep(2000);

                    const details = await page.evaluate(() => {
                        const getContent = () => {
                            const selectors = [
                                '.spotlight-content', '.detail-content', '.content-area',
                                'main', '#main-content', 'article', '.page-content'
                            ];
                            for (const sel of selectors) {
                                const el = document.querySelector(sel);
                                if (el && el.textContent.trim().length > 100) {
                                    return el.textContent.trim();
                                }
                            }
                            return document.body.textContent.trim();
                        };

                        return {
                            title: document.querySelector('h1')?.textContent?.trim() || document.title,
                            content: getContent(),
                            dateText: document.querySelector('[class*="date"], time, [class*="publish"]')?.textContent?.trim() || ''
                        };
                    });

                    title = details.title || article.title;
                    content = cleanText(details.content);

                    if (content.length < 50) {
                        console.log(`    ⚠️  Insufficient content for: ${title}`);
                        results.failed++;
                        continue;
                    }

                    // Determine document type
                    const lowerTitle = title.toLowerCase();
                    docType = 'spotlight';
                    if (lowerTitle.includes('amendment') || lowerTitle.includes('amended')) docType = 'amendment';
                    if (lowerTitle.includes('budget')) docType = 'budget';
                    if (lowerTitle.includes('act') || lowerTitle.includes('bill')) docType = 'act';
                    if (lowerTitle.includes('code') || lowerTitle.includes('reform')) docType = 'policy';
                    if (lowerTitle.includes('scheme') || lowerTitle.includes('yojana') || lowerTitle.includes('mission')) docType = 'scheme';

                    doc = new ScrapedDocument({
                        title,
                        sourceUrl: article.url,
                        content: content.substring(0, 50000),
                        summary: content.substring(0, 500),
                        documentType: docType,
                        category: categorizeDocument(title, content),
                        source: 'india.gov.in',
                        scrapeStatus: 'scraped'
                    });

                    await doc.save();
                    results.added++;
                    console.log(`    ✅ Saved: ${title}`);
                } else {
                    results.updated++;
                    title = doc.title;
                    content = doc.content;
                    docType = doc.documentType;
                }

                // Auto-create a Policy entry for most documents (exclude schemes as they sync separately)
                if (docType !== 'scheme') {
                    const existingPolicy = await Policy.findOne({ name: title });
                    if (!existingPolicy) {
                        const policy = new Policy({
                            name: title,
                            title,
                            category: determinePolicyCategory(title, content),
                            description: content.substring(0, 1000),
                            fileName: `scraped_${article.url.split('/').pop()}.txt`,
                            fileSize: Buffer.byteLength(content, 'utf8'),
                            filePath: article.url,
                            status: 'Active',
                            views: 0,
                            uploadedBy: null, // auto-scraped, no admin
                            processedData: { source: 'web_scraper', scrapedAt: new Date() }
                        });

                        // Remove the required uploadedBy constraint for auto-scraped
                        policy.uploadedBy = undefined;

                        try {
                            await Policy.collection.insertOne({
                                name: title,
                                title,
                                category: determinePolicyCategory(title, content),
                                description: content.substring(0, 1000),
                                fileName: `scraped_${article.url.split('/').pop()}.txt`,
                                fileSize: Buffer.byteLength(content, 'utf8'),
                                filePath: article.url,
                                status: 'Active',
                                views: 0,
                                uploadDate: new Date(),
                                processedData: { source: 'web_scraper', scrapedAt: new Date() },
                                isAutoScraped: true,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });

                            console.log(`    📄 Auto-created policy: ${title}`);
                        } catch (policyErr) {
                            // Ignore duplicate key errors
                            if (policyErr.code !== 11000) {
                                console.error(`    ⚠️  Policy creation error: ${policyErr.message}`);
                            }
                        }
                    }
                }

                results.added++;
                console.log(`    ✅ Saved: ${title}`);
            } catch (err) {
                console.error(`    ❌ Failed: ${article.title} - ${err.message}`);
                scrapingStatus.errors.push(`Spotlight "${article.title}": ${err.message}`);
                results.failed++;
            }

            await sleep(CONFIG.DELAY_BETWEEN_REQUESTS);
        }
    } catch (err) {
        console.error('❌ Spotlight scraping error:', err.message);
        scrapingStatus.errors.push(`Spotlight scraping: ${err.message}`);
    } finally {
        if (browser) await browser.close();
    }

    return results;
}

// ============================================================
// 3. SCRAPE POLICY DOCUMENTS
// ============================================================
async function scrapePolicies() {
    console.log('🔍 Starting policy document scraping from india.gov.in...');
    scrapingStatus.currentTask = 'Scraping Policy Documents';

    let browser;
    const results = { added: 0, updated: 0, failed: 0, total: 0 };

    try {
        browser = await puppeteer.launch(CONFIG.PUPPETEER_OPTS);
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Scrape by document type: Policy, Act, Rule
        const documentTypes = ['Policy', 'Act', 'Rule'];

        for (const docType of documentTypes) {
            console.log(`\n  📂 Scraping ${docType} documents...`);

            let docPage = 1;
            const maxPages = Math.min(5, CONFIG.MAX_PAGES); // 5 pages per type

            while (docPage <= maxPages) {
                try {
                    const url = `${CONFIG.DOCUMENTS_URL}?type=${docType}&page=${docPage}`;
                    console.log(`    📄 Page ${docPage}: ${url}`);

                    await page.goto(url, {
                        waitUntil: 'domcontentloaded',
                        timeout: CONFIG.PAGE_TIMEOUT
                    });
                    await sleep(3000);

                    // Extract document links
                    const docLinks = await page.evaluate((baseUrl) => {
                        const results = [];
                        // Look for document cards/links
                        const cards = document.querySelectorAll('[class*="card"], [class*="document"], [class*="item"], [class*="result"]');
                        cards.forEach(card => {
                            const link = card.querySelector('a');
                            const title = card.querySelector('h3, h4, h5, [class*="title"], a');
                            if (link || title) {
                                const href = link ? (link.href.startsWith('http') ? link.href : baseUrl + link.getAttribute('href')) : '';
                                const name = title ? title.textContent.trim() : '';
                                const desc = card.querySelector('[class*="desc"], p, [class*="summary"]')?.textContent?.trim() || '';
                                const date = card.querySelector('[class*="date"], time')?.textContent?.trim() || '';
                                if (href && name && name.length > 5) {
                                    results.push({ url: href, title: name, description: desc, date });
                                }
                            }
                        });

                        // Fallback: look for anchors to document pages
                        if (results.length === 0) {
                            const anchors = document.querySelectorAll('a[href*="/documents/"], a[href*="/document/"]');
                            anchors.forEach(a => {
                                const href = a.href.startsWith('http') ? a.href : baseUrl + a.getAttribute('href');
                                const title = a.textContent.trim();
                                if (title.length > 10) {
                                    results.push({ url: href, title, description: '', date: '' });
                                }
                            });
                        }

                        return results;
                    }, CONFIG.BASE_URL);

                    if (docLinks.length === 0) {
                        console.log(`    ⚠️  No ${docType} docs found on page ${docPage}, stopping`);
                        break;
                    }

                    console.log(`    Found ${docLinks.length} documents`);
                    results.total += docLinks.length;
                    scrapingStatus.totalItems += docLinks.length;

                    // Process each document
                    for (const doc of docLinks.slice(0, CONFIG.MAX_POLICIES_PER_RUN)) {
                        scrapingStatus.scrapedItems++;

                        try {
                            const existing = await ScrapedDocument.findOne({ sourceUrl: doc.url });
                            if (existing) {
                                results.updated++;
                                continue;
                            }

                            // If it's a PDF, download and call extraction API
                            if (doc.url.endsWith('.pdf')) {
                                try {
                                    await processPdf(doc.url, doc.title, determinePolicyCategory(doc.title, doc.description));
                                    results.added++;
                                } catch (pdfErr) {
                                    console.error(`      ⚠️ PDF extraction failed: ${pdfErr.message}`);
                                    results.failed++;
                                }
                                continue;
                            }

                            console.log(`      🔄 Scraping: ${doc.title}`);

                            await page.goto(doc.url, {
                                waitUntil: 'domcontentloaded',
                                timeout: CONFIG.PAGE_TIMEOUT
                            });
                            await sleep(2000);

                            const details = await page.evaluate(() => {
                                const getContent = () => {
                                    const selectors = [
                                        '.document-content', '.content-area', 'main',
                                        '#main-content', 'article', '.page-content', '.detail-content'
                                    ];
                                    for (const sel of selectors) {
                                        const el = document.querySelector(sel);
                                        if (el && el.textContent.trim().length > 100) {
                                            return el.textContent.trim();
                                        }
                                    }
                                    return document.body.textContent.trim();
                                };

                                return {
                                    title: document.querySelector('h1')?.textContent?.trim() || document.title,
                                    content: getContent(),
                                    ministry: document.querySelector('[class*="ministry"]')?.textContent?.trim() || '',
                                    date: document.querySelector('[class*="date"], time')?.textContent?.trim() || ''
                                };
                            });

                            const title = details.title || doc.title;
                            const content = cleanText(details.content);

                            if (content.length < 50) {
                                results.failed++;
                                continue;
                            }

                            const documentTypeMap = {
                                'Policy': 'policy',
                                'Act': 'act',
                                'Rule': 'rule'
                            };

                            const scrapedDoc = new ScrapedDocument({
                                title,
                                sourceUrl: doc.url,
                                content: content.substring(0, 50000),
                                summary: (doc.description || content.substring(0, 500)),
                                documentType: documentTypeMap[docType] || 'policy',
                                category: categorizeDocument(title, content),
                                ministry: details.ministry,
                                source: 'india.gov.in',
                                scrapeStatus: 'scraped'
                            });

                            await scrapedDoc.save();

                            // Auto-create Policy entry
                            try {
                                await Policy.collection.insertOne({
                                    name: title,
                                    title,
                                    category: determinePolicyCategory(title, content),
                                    description: (doc.description || content.substring(0, 1000)),
                                    fileName: `scraped_${docType.toLowerCase()}_${Date.now()}.txt`,
                                    fileSize: Buffer.byteLength(content, 'utf8'),
                                    filePath: doc.url,
                                    status: 'Active',
                                    views: 0,
                                    uploadDate: new Date(),
                                    processedData: { source: 'web_scraper', documentType: docType, scrapedAt: new Date() },
                                    isAutoScraped: true,
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                });
                            } catch (policyErr) {
                                if (policyErr.code !== 11000) {
                                    console.error(`      ⚠️  Policy creation: ${policyErr.message}`);
                                }
                            }

                            results.added++;
                            console.log(`      ✅ Saved: ${title}`);
                        } catch (err) {
                            console.error(`      ❌ Failed: ${doc.title} - ${err.message}`);
                            results.failed++;
                        }

                        await sleep(CONFIG.DELAY_BETWEEN_REQUESTS);
                    }
                } catch (err) {
                    console.error(`    ❌ Page error: ${err.message}`);
                }

                docPage++;
                await sleep(CONFIG.DELAY_BETWEEN_REQUESTS);
            }
        }
    } catch (err) {
        console.error('❌ Policy scraping error:', err.message);
        scrapingStatus.errors.push(`Policy scraping: ${err.message}`);
    } finally {
        if (browser) await browser.close();
    }

    return results;
}

// ============================================================
// 4. SCRAPE PIB PRESS RELEASES
// ============================================================
async function scrapePressReleases() {
    console.log('🔍 Starting PIB press release scraping...');
    scrapingStatus.currentTask = 'Scraping Press Releases';

    let browser;
    const results = { added: 0, updated: 0, failed: 0, total: 0 };

    try {
        browser = await puppeteer.launch(CONFIG.PUPPETEER_OPTS);
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // PIB latest releases
        await page.goto('https://pib.gov.in/allRel.aspx', {
            waitUntil: 'domcontentloaded',
            timeout: CONFIG.PAGE_TIMEOUT
        });
        await sleep(3000);

        const releaseLinks = await page.evaluate(() => {
            const results = [];
            const anchors = document.querySelectorAll('a[href*="PressRelease"], a[href*="pressrelease"]');
            anchors.forEach(a => {
                const href = a.href;
                const title = a.textContent.trim();
                if (href && title && title.length > 10 && !results.find(r => r.url === href)) {
                    results.push({ url: href, title });
                }
            });
            return results.slice(0, 30); // limit to 30 press releases
        });

        console.log(`  📋 Found ${releaseLinks.length} press releases`);
        results.total = releaseLinks.length;
        scrapingStatus.totalItems += releaseLinks.length;

        for (let i = 0; i < releaseLinks.length; i++) {
            const release = releaseLinks[i];
            scrapingStatus.scrapedItems++;

            try {
                const existing = await ScrapedDocument.findOne({ sourceUrl: release.url });
                if (existing) {
                    results.updated++;
                    continue;
                }

                console.log(`  🔄 [${i + 1}/${releaseLinks.length}] Scraping: ${release.title.substring(0, 60)}...`);

                await page.goto(release.url, {
                    waitUntil: 'domcontentloaded',
                    timeout: CONFIG.PAGE_TIMEOUT
                });
                await sleep(2000);

                const details = await page.evaluate(() => {
                    const content = document.querySelector('#PressRelease, .innercontent, #maincontent, main');
                    return {
                        title: document.querySelector('h2, h1, .pr-title')?.textContent?.trim() || document.title,
                        content: content ? content.textContent.trim() : document.body.textContent.trim(),
                        date: document.querySelector('.date, [class*="date"]')?.textContent?.trim() || '',
                        ministry: document.querySelector('.ministry, [class*="ministry"]')?.textContent?.trim() || ''
                    };
                });

                const title = details.title || release.title;
                const content = cleanText(details.content);

                if (content.length < 50) {
                    results.failed++;
                    continue;
                }

                const doc = new ScrapedDocument({
                    title,
                    sourceUrl: release.url,
                    content: content.substring(0, 50000),
                    summary: content.substring(0, 500),
                    documentType: 'press_release',
                    category: categorizeDocument(title, content),
                    ministry: details.ministry,
                    source: 'pib.gov.in',
                    scrapeStatus: 'scraped'
                });

                await doc.save();
                results.added++;
                console.log(`    ✅ Saved: ${title.substring(0, 60)}...`);
            } catch (err) {
                console.error(`    ❌ Failed: ${release.title.substring(0, 40)} - ${err.message}`);
                results.failed++;
            }

            await sleep(CONFIG.DELAY_BETWEEN_REQUESTS);
        }
    } catch (err) {
        console.error('❌ Press release scraping error:', err.message);
        scrapingStatus.errors.push(`Press release scraping: ${err.message}`);
    } finally {
        if (browser) await browser.close();
    }

    return results;
}

// ============================================================
// 5. MASTER SCRAPE FUNCTION (runs all scrapers)
// ============================================================
async function runFullScrape() {
    if (scrapingStatus.isRunning) {
        return { error: 'A scraping session is already running' };
    }

    scrapingStatus = {
        isRunning: true,
        currentTask: 'Initializing...',
        progress: 0,
        totalItems: 0,
        scrapedItems: 0,
        errors: [],
        startedAt: new Date(),
        lastRunAt: null
    };

    console.log('\n' + '='.repeat(60));
    console.log('🚀 STARTING FULL WEB SCRAPE');
    console.log('='.repeat(60) + '\n');

    const allResults = {
        schemes: { added: 0, updated: 0, failed: 0, total: 0 },
        spotlights: { added: 0, updated: 0, failed: 0, total: 0 },
        policies: { added: 0, updated: 0, failed: 0, total: 0 },
        pressReleases: { added: 0, updated: 0, failed: 0, total: 0 }
    };

    try {
        // 1. Scrape Schemes
        allResults.schemes = await scrapeSchemes();
        console.log('\n📊 Scheme scraping complete:', allResults.schemes);

        // 2. Scrape Spotlights
        allResults.spotlights = await scrapeSpotlights();
        console.log('\n📊 Spotlight scraping complete:', allResults.spotlights);

        // 3. Scrape Policy Documents
        allResults.policies = await scrapePolicies();
        console.log('\n📊 Policy scraping complete:', allResults.policies);

        // 4. Scrape Press Releases
        allResults.pressReleases = await scrapePressReleases();
        console.log('\n📊 Press release scraping complete:', allResults.pressReleases);

    } catch (err) {
        console.error('❌ Full scrape error:', err.message);
        scrapingStatus.errors.push(`Full scrape: ${err.message}`);
    }

    // Summary
    const totalAdded = Object.values(allResults).reduce((sum, r) => sum + r.added, 0);
    const totalUpdated = Object.values(allResults).reduce((sum, r) => sum + r.updated, 0);
    const totalFailed = Object.values(allResults).reduce((sum, r) => sum + r.failed, 0);

    scrapingStatus.isRunning = false;
    scrapingStatus.currentTask = 'Completed';
    scrapingStatus.progress = 100;
    scrapingStatus.lastRunAt = new Date();

    console.log('\n' + '='.repeat(60));
    console.log('✅ FULL SCRAPE COMPLETE');
    console.log(`   Added: ${totalAdded} | Updated: ${totalUpdated} | Failed: ${totalFailed}`);
    console.log(`   Errors: ${scrapingStatus.errors.length}`);
    console.log('='.repeat(60) + '\n');

    return {
        success: true,
        summary: {
            totalAdded,
            totalUpdated,
            totalFailed,
            errors: scrapingStatus.errors
        },
        details: allResults
    };
}

// ============================================================
// 6. TARGETED SCRAPE FUNCTION (scrape specific type)
// ============================================================
async function runTargetedScrape(type) {
    if (scrapingStatus.isRunning) {
        return { error: 'A scraping session is already running' };
    }

    scrapingStatus = {
        isRunning: true,
        currentTask: `Scraping ${type}...`,
        progress: 0,
        totalItems: 0,
        scrapedItems: 0,
        errors: [],
        startedAt: new Date(),
        lastRunAt: null
    };

    let result;

    try {
        switch (type) {
            case 'schemes':
                result = await scrapeSchemes();
                break;
            case 'spotlights':
                result = await scrapeSpotlights();
                break;
            case 'policies':
                result = await scrapePolicies();
                break;
            case 'press_releases':
                result = await scrapePressReleases();
                break;
            default:
                result = { error: `Unknown scrape type: ${type}` };
        }
    } catch (err) {
        console.error(`❌ Targeted scrape error (${type}):`, err.message);
        result = { error: err.message };
    }

    scrapingStatus.isRunning = false;
    scrapingStatus.currentTask = 'Completed';
    scrapingStatus.progress = 100;
    scrapingStatus.lastRunAt = new Date();

    return result;
}

module.exports = {
    scrapeSchemes,
    scrapeSpotlights,
    scrapePolicies,
    scrapePressReleases,
    runFullScrape,
    runTargetedScrape,
    getStatus,
    CONFIG
};
