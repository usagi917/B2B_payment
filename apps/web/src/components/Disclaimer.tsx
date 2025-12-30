"use client";

export function Disclaimer() {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
        Important Notice
      </h3>
      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
        <li>
          This is <strong>B2B payment infrastructure</strong>, not an investment product
        </li>
        <li>
          No yields, resale, fractional ownership, or investment solicitation
        </li>
        <li>
          Milestones are <strong>evidence logs</strong> (accountability), not payment conditions
        </li>
        <li>
          <strong>Unaudited contract</strong> - Demo/testnet use only
        </li>
      </ul>
    </div>
  );
}
