/**
 * Generate a unique payment endpoint for a user
 * Format: pay_[username]_[random]
 * Example: pay_john123, pay_mystore456
 */
export declare function generatePaymentEndpoint(username?: string): Promise<string>;
/**
 * Validate endpoint format
 */
export declare function validateEndpointFormat(endpoint: string): boolean;
/**
 * Generate multiple endpoint options for user to choose from
 */
export declare function generateEndpointOptions(username?: string, count?: number): Promise<string[]>;
/**
 * Format endpoint for display (more readable)
 */
export declare function formatEndpointForDisplay(endpoint: string): string;
/**
 * Check if endpoint belongs to active user
 */
export declare function validateEndpointOwnership(endpoint: string): Promise<{
    isValid: boolean;
    userId?: string;
    userStatus?: string;
}>;
//# sourceMappingURL=endpointGenerator.d.ts.map