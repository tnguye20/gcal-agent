#!/usr/bin/env node

/**
 * Test script to verify the application works
 * Run: node test-api.js
 */

const http = require('http');

const PORT = process.env.PORT || 3000;

// Test data
const testCases = [
  {
    name: 'Instagram URL test',
    data: {
      instagramUrl: 'https://www.instagram.com/p/C2ErC2P/',
    }
  },
  {
    name: 'Plain text test',
    data: {
      text: 'Team standup meeting tomorrow at 10am in Conference Room B. Discussing Q1 roadmap and sprint planning.'
    }
  },
  {
    name: 'Natural language test',
    data: {
      text: 'Coffee with Sarah next Tuesday at 3pm at Starbucks downtown'
    }
  }
];

async function testAPI() {
  console.log('🧪 Testing Instagram to Calendar API...\n');

  // Check if server is running
  try {
    const healthCheck = await fetch(`http://localhost:${PORT}/api/health`);
    if (healthCheck.ok) {
      console.log('✅ Server is running\n');
    }
  } catch (error) {
    console.error('❌ Server is not running. Start it with: npm run dev\n');
    process.exit(1);
  }

  // Run test cases
  for (const testCase of testCases) {
    console.log(`📋 Test: ${testCase.name}`);
    console.log(`   Input:`, JSON.stringify(testCase.data, null, 2));

    try {
      const response = await fetch(`http://localhost:${PORT}/api/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      });

      const result = await response.json();

      if (result.success) {
        console.log('   ✅ Success!');
        console.log('   📅 Event:', result.eventInfo.title);
        console.log('   🕐 Start:', result.eventInfo.startDateTime);
        console.log('   📍 Location:', result.eventInfo.location || 'N/A');
        console.log('   🔗 Calendar URL:', result.calendarUrl.substring(0, 80) + '...');
      } else {
        console.log('   ❌ Failed:', result.error);
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    console.log('');
  }

  console.log('✅ Testing complete!\n');
}

// Run tests
testAPI().catch(console.error);
