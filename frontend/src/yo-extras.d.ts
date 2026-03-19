import type { VaultStatsItem, VaultSnapshot, VaultId } from '@yo-protocol/core';
import type { Address } from 'viem';

declare module '@yo-protocol/react/dist/hooks/useVaultStats' {
  export function useVaultStats(options?: { enabled?: boolean }): {
    stats: VaultStatsItem[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };
}

declare module '@yo-protocol/react/dist/hooks/useVaultSnapshot' {
  export function useVaultSnapshot(
    vault: Address | VaultId,
    options?: { enabled?: boolean }
  ): {
    snapshot: VaultSnapshot | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };
}

declare module '@yo-protocol/react/dist/hooks/useVaultSnapshots' {
  export function useVaultSnapshots(options?: { enabled?: boolean }): {
    snapshots: VaultSnapshot[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };
}
