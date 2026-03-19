// Sage Vault — global type declarations
export {};

declare global {
  interface Window {
    ethereum?: Record<string, unknown>;
  }
}
