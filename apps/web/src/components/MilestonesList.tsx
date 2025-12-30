"use client";

import type { Milestone } from "@/lib/types";
import { MilestoneState } from "@/lib/types";

interface MilestonesListProps {
  milestones: Milestone[];
}

const MILESTONE_DESCRIPTIONS: Record<string, string> = {
  E1: "契約・個体登録",
  E2: "初期検疫・導入",
  E3_01: "月次肥育記録 1",
  E3_02: "月次肥育記録 2",
  E3_03: "月次肥育記録 3",
  E3_04: "月次肥育記録 4",
  E3_05: "月次肥育記録 5",
  E3_06: "月次肥育記録 6",
  E4: "出荷準備",
  E5: "出荷",
  E6: "受領・検収",
};

const STATE_LABELS: Record<MilestoneState, { label: string; color: string }> = {
  [MilestoneState.PENDING]: { label: "Pending", color: "bg-gray-200 text-gray-700" },
  [MilestoneState.SUBMITTED]: { label: "Submitted", color: "bg-yellow-200 text-yellow-800" },
  [MilestoneState.APPROVED]: { label: "Approved", color: "bg-green-200 text-green-800" },
};

export function MilestonesList({ milestones }: MilestonesListProps) {
  const formatTimestamp = (ts: bigint) => {
    if (ts === 0n) return "-";
    return new Date(Number(ts) * 1000).toLocaleString("ja-JP");
  };

  const shortenHash = (hash: string) => {
    if (hash === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      return "-";
    }
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold mb-3">Milestones</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-2">#</th>
              <th className="text-left py-2 px-2">Code</th>
              <th className="text-left py-2 px-2">Description</th>
              <th className="text-right py-2 px-2">Rate</th>
              <th className="text-center py-2 px-2">Status</th>
              <th className="text-left py-2 px-2">Evidence</th>
              <th className="text-left py-2 px-2">Submitted</th>
              <th className="text-left py-2 px-2">Approved</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((m, index) => {
              const { label, color } = STATE_LABELS[m.state];
              return (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-2 px-2 text-gray-500">{index}</td>
                  <td className="py-2 px-2 font-mono font-medium">{m.code}</td>
                  <td className="py-2 px-2 text-gray-600 dark:text-gray-400">
                    {MILESTONE_DESCRIPTIONS[m.code] || m.code}
                  </td>
                  <td className="py-2 px-2 text-right">{Number(m.bps) / 100}%</td>
                  <td className="py-2 px-2 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${color}`}>
                      {label}
                    </span>
                  </td>
                  <td className="py-2 px-2 font-mono text-xs">
                    {shortenHash(m.evidenceHash)}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-500">
                    {formatTimestamp(m.submittedAt)}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-500">
                    {formatTimestamp(m.approvedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Progress summary */}
      <div className="mt-4 flex gap-4 text-sm">
        <div>
          <span className="text-gray-500">Approved: </span>
          <span className="font-medium">
            {milestones.filter((m) => m.state === MilestoneState.APPROVED).length}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Submitted: </span>
          <span className="font-medium">
            {milestones.filter((m) => m.state === MilestoneState.SUBMITTED).length}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Pending: </span>
          <span className="font-medium">
            {milestones.filter((m) => m.state === MilestoneState.PENDING).length}
          </span>
        </div>
      </div>
    </div>
  );
}
