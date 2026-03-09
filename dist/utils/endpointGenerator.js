"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePaymentEndpoint = generatePaymentEndpoint;
exports.validateEndpointFormat = validateEndpointFormat;
exports.generateEndpointOptions = generateEndpointOptions;
exports.formatEndpointForDisplay = formatEndpointForDisplay;
exports.validateEndpointOwnership = validateEndpointOwnership;
// Import PrismaClient dynamically
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
/**
 * Generate a unique payment endpoint for a user
 * Format: pay_[username]_[random]
 * Example: pay_john123, pay_mystore456
 */
async function generatePaymentEndpoint(username) {
    let endpoint;
    let attempts = 0;
    const maxAttempts = 10;
    do {
        endpoint = createEndpointString(username);
        const exists = await isEndpointTaken(endpoint);
        if (!exists) {
            return endpoint;
        }
        attempts++;
    } while (attempts < maxAttempts);
    // Fallback: use timestamp for guaranteed uniqueness
    const timestamp = Date.now().toString().slice(-6);
    return `pay_user_${timestamp}`;
}
/**
 * Create endpoint string based on username
 */
function createEndpointString(username) {
    // Clean username: remove special chars, convert to lowercase
    const cleanUsername = username
        ? username.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .slice(0, 8) // Limit to 8 chars
        : 'user';
    // Generate random 3-digit suffix
    const randomSuffix = Math.random().toString(36).substring(2, 5);
    return `pay_${cleanUsername}_${randomSuffix}`;
}
/**
 * Check if endpoint already exists in database
 */
async function isEndpointTaken(endpoint) {
    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                paymentEndpoint: endpoint // Temporary fix for type issue
            },
            select: { id: true }
        });
        return existingUser !== null;
    }
    catch (error) {
        console.error('Error checking endpoint uniqueness:', error);
        // If database error, assume it's taken to be safe
        return true;
    }
}
/**
 * Validate endpoint format
 */
function validateEndpointFormat(endpoint) {
    // Format: pay_[alphanumeric]_[alphanumeric]
    const endpointRegex = /^pay_[a-z0-9]+_[a-z0-9]+$/;
    // Length check: 8-20 characters
    const isValidLength = endpoint.length >= 8 && endpoint.length <= 20;
    return endpointRegex.test(endpoint) && isValidLength;
}
/**
 * Generate multiple endpoint options for user to choose from
 */
async function generateEndpointOptions(username, count = 3) {
    const options = [];
    for (let i = 0; i < count; i++) {
        const endpoint = await generatePaymentEndpoint(username);
        if (!options.includes(endpoint)) {
            options.push(endpoint);
        }
    }
    return options;
}
/**
 * Format endpoint for display (more readable)
 */
function formatEndpointForDisplay(endpoint) {
    return endpoint.toUpperCase();
}
/**
 * Check if endpoint belongs to active user
 */
async function validateEndpointOwnership(endpoint) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                paymentEndpoint: endpoint // Temporary fix for type issue
            },
            select: {
                id: true
            }
        });
        if (!user) {
            return { isValid: false };
        }
        // Note: Add 'status' field to User model if you want to track active/suspended users
        return {
            isValid: true,
            userId: user.id,
            userStatus: 'ACTIVE' // Default status for now
        };
    }
    catch (error) {
        console.error('Error validating endpoint:', error);
        return { isValid: false };
    }
}
//# sourceMappingURL=endpointGenerator.js.map