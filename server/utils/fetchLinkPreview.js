const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fetch Open Graph metadata from a URL for link preview.
 * Returns { url, title, description, image, siteName } or null on failure.
 */
const fetchLinkPreview = async (url) => {
    try {
        if (!url || typeof url !== 'string') return null;

        // Ensure URL has protocol
        const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

        const { data } = await axios.get(normalizedUrl, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; TutorHub/1.0; +https://tutorhub.com)',
                'Accept': 'text/html'
            },
            maxRedirects: 3,
            // Only accept HTML responses
            validateStatus: (status) => status < 400
        });

        if (typeof data !== 'string') return null;

        const $ = cheerio.load(data);

        const getMetaContent = (property) => {
            return $(`meta[property="${property}"]`).attr('content') ||
                $(`meta[name="${property}"]`).attr('content') || '';
        };

        const title = getMetaContent('og:title') || $('title').text() || '';
        const description = getMetaContent('og:description') || getMetaContent('description') || '';
        const image = getMetaContent('og:image') || '';
        const siteName = getMetaContent('og:site_name') || '';

        // At minimum we need a title
        if (!title.trim()) return null;

        return {
            url: normalizedUrl,
            title: title.trim().substring(0, 200),
            description: description.trim().substring(0, 500),
            image: image.trim(),
            siteName: siteName.trim().substring(0, 100)
        };
    } catch (error) {
        console.log(`Link preview fetch failed for: ${url}`, error.message);
        return null;
    }
};

module.exports = { fetchLinkPreview };
