"use client";

import type { Address } from "viem";

interface ConnectWalletProps {
  address: Address | null;
  isConnecting: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ConnectWallet({
  address,
  isConnecting,
  error,
  onConnect,
  onDisconnect,
}: ConnectWalletProps) {
  const shortenAddress = (addr: Address) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold mb-3">Wallet</h2>

      {error && (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      )}

      {address ? (
        <div className="flex items-center justify-between">
          <div>
            <span className="text-green-500 mr-2">●</span>
            <span className="font-mono text-sm">{shortenAddress(address)}</span>
          </div>
          <button
            onClick={onDisconnect}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? "Connecting..." : "Connect MetaMask"}
        </button>
      )}
    </div>
  );
}
