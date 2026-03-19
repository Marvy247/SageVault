// Polyfill hooks that exist in YO SDK types but aren't exported from the bundle
import { useVaults, useYoClient } from '@yo-protocol/react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import type { VaultStatsItem, VaultSnapshot, VaultId } from '@yo-protocol/core';
import type { Address } from 'viem';

export function useVaultStats(options?: { enabled?: boolean }) {
  const { vaults, isLoading, isError, error } = useVaults(options);
  return { stats: (vaults ?? []) as VaultStatsItem[], isLoading, isError, error };
}

export function useVaultSnapshot(vault: Address | VaultId, options?: { enabled?: boolean }) {
  const client = useYoClient();
  const { chain } = useAccount();
  const chainId = chain?.id ?? 8453;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['yo-vault-snapshot-local', vault, chainId],
    queryFn: async () => {
      if (!client) return undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fn = (client as any).getVaultSnapshot ?? (client as any).getSnapshot;
      if (fn) return fn.call(client, vault) as Promise<VaultSnapshot>;
      return undefined;
    },
    enabled: options?.enabled !== false && !!client,
    staleTime: 30_000,
  });

  return { snapshot: data as VaultSnapshot | undefined, isLoading, isError, error };
}

export function useVaultSnapshots(options?: { enabled?: boolean }) {
  const client = useYoClient();
  const { chain } = useAccount();
  const chainId = chain?.id ?? 8453;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['yo-vault-snapshots-local', chainId],
    queryFn: async () => {
      if (!client) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fn = (client as any).getVaultSnapshots ?? (client as any).getSnapshots;
      if (fn) return fn.call(client) as Promise<VaultSnapshot[]>;
      return [];
    },
    enabled: options?.enabled !== false && !!client,
    staleTime: 30_000,
  });

  return { snapshots: (data ?? []) as VaultSnapshot[], isLoading, isError, error };
}
