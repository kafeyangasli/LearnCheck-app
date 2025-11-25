/**
 * Redis Service Test Suite
 * 
 * Tests:
 * 1. Redis connection and initialization
 * 2. Cache operations (get, set, delete, has)
 * 3. Rate limiting functionality
 * 4. Graceful degradation when Redis is unavailable
 * 5. TTL (Time To Live) expiration
 */

import dotenv from 'dotenv';
dotenv.config();

import {
    initializeRedis,
    isRedisAvailable,
    getCache,
    setCache,
    deleteCache,
    hasCache,
    incrementRateLimit,
    closeRedis,
} from '../services/redis.service';

// Test utilities
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const runTests = async () => {
    console.log('🧪 Starting Redis Test Suite\n');
    console.log('='.repeat(60));

    let testsPassed = 0;
    let testsFailed = 0;

    // Helper function to run a test
    const test = async (name: string, fn: () => Promise<void>) => {
        try {
            console.log(`\n📝 Test: ${name}`);
            await fn();
            console.log(`✅ PASSED: ${name}`);
            testsPassed++;
        } catch (error) {
            console.error(`❌ FAILED: ${name}`);
            console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
            testsFailed++;
        }
    };

    // Test 1: Initialize Redis
    await test('Initialize Redis Connection', async () => {
        await initializeRedis();

        if (process.env.REDIS_URL) {
            if (!isRedisAvailable()) {
                throw new Error('Redis should be available when REDIS_URL is set');
            }
            console.log('   ✓ Redis connected successfully');
        } else {
            if (isRedisAvailable()) {
                throw new Error('Redis should not be available when REDIS_URL is not set');
            }
            console.log('   ⚠ Redis URL not configured - testing graceful degradation');
        }
    });

    // Test 2: Set and Get Cache
    await test('Set and Get Cache', async () => {
        const testKey = 'test:cache:basic';
        const testValue = JSON.stringify({ message: 'Hello Redis!', timestamp: Date.now() });

        await setCache(testKey, testValue, 60); // 60 seconds TTL
        const retrieved = await getCache(testKey);

        if (isRedisAvailable()) {
            if (retrieved !== testValue) {
                throw new Error(`Expected "${testValue}", got "${retrieved}"`);
            }
            console.log('   ✓ Cache set and retrieved successfully');
        } else {
            if (retrieved !== null) {
                throw new Error('Should return null when Redis is unavailable');
            }
            console.log('   ✓ Gracefully returns null when Redis unavailable');
        }
    });

    // Test 3: Check if key exists
    await test('Check Cache Existence', async () => {
        const testKey = 'test:cache:exists';
        const testValue = 'exists-test';

        await setCache(testKey, testValue, 60);
        const exists = await hasCache(testKey);

        if (isRedisAvailable()) {
            if (!exists) {
                throw new Error('Key should exist after setting');
            }
            console.log('   ✓ Cache existence check works');
        } else {
            if (exists) {
                throw new Error('Should return false when Redis is unavailable');
            }
            console.log('   ✓ Returns false when Redis unavailable');
        }
    });

    // Test 4: Delete Cache
    await test('Delete Cache', async () => {
        const testKey = 'test:cache:delete';
        const testValue = 'delete-me';

        await setCache(testKey, testValue, 60);
        await deleteCache(testKey);
        const retrieved = await getCache(testKey);

        if (isRedisAvailable()) {
            if (retrieved !== null) {
                throw new Error('Key should be deleted');
            }
            console.log('   ✓ Cache deleted successfully');
        } else {
            console.log('   ✓ Delete operation handled gracefully');
        }
    });

    // Test 5: TTL Expiration
    await test('TTL Expiration (3 seconds)', async () => {
        const testKey = 'test:cache:ttl';
        const testValue = 'expires-soon';

        await setCache(testKey, testValue, 2); // 2 seconds TTL

        if (isRedisAvailable()) {
            // Should exist immediately
            const existsBefore = await hasCache(testKey);
            if (!existsBefore) {
                throw new Error('Key should exist immediately after setting');
            }
            console.log('   ✓ Key exists immediately after setting');

            // Wait for expiration
            console.log('   ⏳ Waiting 3 seconds for TTL expiration...');
            await sleep(3000);

            // Should not exist after TTL
            const existsAfter = await hasCache(testKey);
            if (existsAfter) {
                throw new Error('Key should be expired after TTL');
            }
            console.log('   ✓ Key expired after TTL');
        } else {
            console.log('   ⚠ Skipping TTL test (Redis unavailable)');
        }
    });

    // Test 6: Rate Limiting
    await test('Rate Limiting', async () => {
        const rateLimitKey = 'test:ratelimit:user123';

        if (isRedisAvailable()) {
            // First request
            const count1 = await incrementRateLimit(rateLimitKey, 60);
            if (count1 !== 1) {
                throw new Error(`Expected count 1, got ${count1}`);
            }
            console.log('   ✓ First request: count = 1');

            // Second request
            const count2 = await incrementRateLimit(rateLimitKey, 60);
            if (count2 !== 2) {
                throw new Error(`Expected count 2, got ${count2}`);
            }
            console.log('   ✓ Second request: count = 2');

            // Third request
            const count3 = await incrementRateLimit(rateLimitKey, 60);
            if (count3 !== 3) {
                throw new Error(`Expected count 3, got ${count3}`);
            }
            console.log('   ✓ Third request: count = 3');

            // Cleanup
            await deleteCache(rateLimitKey);
        } else {
            const count = await incrementRateLimit(rateLimitKey, 60);
            if (count !== 0) {
                throw new Error('Should return 0 when Redis is unavailable');
            }
            console.log('   ✓ Returns 0 when Redis unavailable (fail-open)');
        }
    });

    // Test 7: Quiz Pool Cache Simulation
    await test('Quiz Pool Cache Simulation', async () => {
        const tutorialId = '12345';
        const poolKey = `learncheck:quiz:pool:${tutorialId}`;
        const mockQuizPool = {
            questions: [
                { id: 1, question: 'Q1?', options: ['A', 'B', 'C', 'D'], correctAnswer: 0 },
                { id: 2, question: 'Q2?', options: ['A', 'B', 'C', 'D'], correctAnswer: 1 },
                { id: 3, question: 'Q3?', options: ['A', 'B', 'C', 'D'], correctAnswer: 2 },
            ],
            tutorialId,
            generatedAt: new Date().toISOString(),
        };

        // Cache quiz pool (24 hours)
        await setCache(poolKey, JSON.stringify(mockQuizPool), 24 * 60 * 60);

        // Retrieve and verify
        const cached = await getCache(poolKey);

        if (isRedisAvailable()) {
            if (!cached) {
                throw new Error('Quiz pool should be cached');
            }

            const parsed = JSON.parse(cached);
            if (parsed.questions.length !== 3) {
                throw new Error('Quiz pool should have 3 questions');
            }
            console.log('   ✓ Quiz pool cached successfully');
            console.log(`   ✓ Retrieved ${parsed.questions.length} questions`);

            // Cleanup
            await deleteCache(poolKey);
        } else {
            console.log('   ⚠ Skipping quiz pool test (Redis unavailable)');
        }
    });

    // Test 8: User Preferences Cache Simulation
    await test('User Preferences Cache Simulation', async () => {
        const userId = 'user-456';
        const prefsKey = `learncheck:prefs:user:${userId}`;
        const mockPreferences = {
            userId,
            name: 'Test User',
            email: 'test@example.com',
            settings: {
                difficulty: 'medium',
                questionsPerQuiz: 3,
            },
        };

        // Cache preferences (5 minutes)
        await setCache(prefsKey, JSON.stringify(mockPreferences), 5 * 60);

        // Retrieve and verify
        const cached = await getCache(prefsKey);

        if (isRedisAvailable()) {
            if (!cached) {
                throw new Error('Preferences should be cached');
            }

            const parsed = JSON.parse(cached);
            if (parsed.userId !== userId) {
                throw new Error('User ID mismatch');
            }
            console.log('   ✓ User preferences cached successfully');
            console.log(`   ✓ Retrieved preferences for ${parsed.name}`);

            // Cleanup
            await deleteCache(prefsKey);
        } else {
            console.log('   ⚠ Skipping preferences test (Redis unavailable)');
        }
    });

    // Test 9: Multiple Concurrent Operations
    await test('Concurrent Cache Operations', async () => {
        const keys = ['test:concurrent:1', 'test:concurrent:2', 'test:concurrent:3'];
        const values = ['value1', 'value2', 'value3'];

        // Set multiple keys concurrently
        await Promise.all(
            keys.map((key, i) => setCache(key, values[i], 60))
        );

        // Get multiple keys concurrently
        const results = await Promise.all(
            keys.map(key => getCache(key))
        );

        if (isRedisAvailable()) {
            for (let i = 0; i < keys.length; i++) {
                if (results[i] !== values[i]) {
                    throw new Error(`Mismatch at index ${i}: expected "${values[i]}", got "${results[i]}"`);
                }
            }
            console.log('   ✓ All concurrent operations succeeded');

            // Cleanup
            await Promise.all(keys.map(key => deleteCache(key)));
        } else {
            console.log('   ✓ Concurrent operations handled gracefully');
        }
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Test Summary:');
    console.log(`   ✅ Passed: ${testsPassed}`);
    console.log(`   ❌ Failed: ${testsFailed}`);
    console.log(`   📈 Total:  ${testsPassed + testsFailed}`);

    if (testsFailed === 0) {
        console.log('\n🎉 All tests passed!');
    } else {
        console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }

    // Close Redis connection
    await closeRedis();
    console.log('\n🔌 Redis connection closed');

    // Exit with appropriate code
    process.exit(testsFailed > 0 ? 1 : 0);
};

// Run tests
runTests().catch((error) => {
    console.error('💥 Fatal error running tests:', error);
    process.exit(1);
});
