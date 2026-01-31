const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testPagination() {
    try {
        console.log('Testing Tutors Pagination...');
        const tutorsRes = await axios.get(`${API_URL}/api/tutors?page=1&limit=2`);
        console.log('Tutors Result:', {
            total: tutorsRes.data.total,
            count: tutorsRes.data.tutors.length,
            pages: tutorsRes.data.pages
        });

        console.log('\nTesting Tutors Filter (minRating=4)...');
        const filteredRes = await axios.get(`${API_URL}/api/tutors?minRating=4`);
        console.log('Filtered Tutors:', filteredRes.data.tutors.length);

        console.log('\nTesting Posts Pagination...');
        const postsRes = await axios.get(`${API_URL}/api/posts?page=1&limit=5`);
        console.log('Posts Result:', {
            total: postsRes.data.total,
            count: postsRes.data.posts.length,
            pages: postsRes.data.pages
        });

    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) console.error('Response:', error.response.data);
    }
}

testPagination();
