import { webcrypto } from 'node:crypto';

// Use standard Web Crypto API if available (Node 19+), otherwise fallback to node implementation 
// logic effectively handled by standard Math.random is insufficient.
// Excluding ambiguous characters: 0, O, 1, I, l
const ALPHABET = '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
const ALPHABET_LENGTH = ALPHABET.length;

export function generateRoomCode(length: number = 8): string {
    // Use crypto.getRandomValues for better entropy
    const array = new Uint8Array(length);
    // In a browser or modern Node env, crypto is available globally
    const cryptoToCheck = typeof crypto !== 'undefined' ? crypto : webcrypto as unknown as Crypto;

    if (!cryptoToCheck) {
        throw new Error("Crypto API not available");
    }

    cryptoToCheck.getRandomValues(array);

    let result = '';
    for (let i = 0; i < length; i++) {
        // Map the random byte to our alphabet
        result += ALPHABET[array[i] % ALPHABET_LENGTH];
    }
    return result;
}

export function isValidRoomCode(code: string): boolean {
    if (!code || code.length !== 8) return false;
    // Check if all characters are in ALPHABET
    for (const char of code) {
        if (!ALPHABET.includes(char)) return false;
    }
    return true;
}
