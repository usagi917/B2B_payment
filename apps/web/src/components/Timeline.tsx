"use client";

import type { TimelineEvent } from "@/lib/types";
import { getTxUrl } from "@/lib/config";
import { formatAmount } from "@/lib/hooks";

interface TimelineProps {
  events: TimelineEvent[];
  tokenSymbol: string;
  tokenDecimals: number;
  isLoading: boolean;
  error: string | null;
}

const EVENT_STYLES: Record<string, { icon: string; color: string }> = {
  Locked: { icon: "🔒", color: "border-green-500" },
  Submitted: { icon: "📝", color: "border-yellow-500" },
  Released: { icon: "💰", color: "border-blue-500" },
  Cancelled: { icon: "❌", color: "border-red-500" },
};

export function Timeline({
  events,
  tokenSymbol,
  tokenDecimals,
  isLoading,
  error,
}: TimelineProps) {
  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const shortenHash = (hash: string) => `${hash.slice(0, 10)}...`;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold mb-3">Timeline</h2>
        <div className="animate-pulse">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold mb-3">Timeline</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold mb-3">Timeline</h2>

      {events.length === 0 ? (
        <div className="text-gray-500 text-sm">No events yet</div>
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => {
            const { icon, color } = EVENT_STYLES[event.type] || {
              icon: "📌",
              color: "border-gray-500",
            };

            return (
              <div
                key={`${event.txHash}-${index}`}
                className={`border-l-4 ${color} pl-3 py-2`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{icon}</span>
                  <span className="font-medium">{event.type}</span>
                  <span className="text-xs text-gray-500">
                    Block #{event.blockNumber.toString()}
                  </span>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div>
                    <span className="text-gray-500">Actor: </span>
                    <span className="font-mono">{shortenAddress(event.actor)}</span>
                  </div>

                  {event.type === "Locked" && event.amount && (
                    <div>
                      <span className="text-gray-500">Amount: </span>
                      <span className="font-semibold">
                        {formatAmount(event.amount, tokenDecimals, tokenSymbol)}
                      </span>
                    </div>
                  )}

                  {event.type === "Submitted" && (
                    <>
                      <div>
                        <span className="text-gray-500">Milestone: </span>
                        <span>{event.code}</span>
                      </div>
                      {event.evidenceHash && (
                        <div>
                          <span className="text-gray-500">Evidence: </span>
                          <span className="font-mono text-xs">
                            {shortenHash(event.evidenceHash)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {event.type === "Released" && (
                    <>
                      <div>
                        <span className="text-gray-500">Milestone: </span>
                        <span>{event.code}</span>
                      </div>
                      {event.amount && (
                        <div>
                          <span className="text-gray-500">Released: </span>
                          <span className="font-semibold text-blue-600">
                            {formatAmount(event.amount, tokenDecimals, tokenSymbol)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {event.type === "Cancelled" && (
                    <>
                      {event.reason && (
                        <div>
                          <span className="text-gray-500">Reason: </span>
                          <span>{event.reason}</span>
                        </div>
                      )}
                      {event.refundAmount && (
                        <div>
                          <span className="text-gray-500">Refunded: </span>
                          <span className="font-semibold text-orange-600">
                            {formatAmount(event.refundAmount, tokenDecimals, tokenSymbol)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <span className="text-gray-500">TX: </span>
                    {getTxUrl(event.txHash) ? (
                      <a
                        href={getTxUrl(event.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-blue-500 hover:underline"
                      >
                        {shortenHash(event.txHash)}
                      </a>
                    ) : (
                      <span className="font-mono text-xs">{shortenHash(event.txHash)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
