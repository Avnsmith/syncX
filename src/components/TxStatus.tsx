import React from "react";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export interface TxStatusProps {
  txHash: string;
  status: "pending" | "attesting" | "minting" | "complete" | "failed";
  explorerUrl?: string;
  type?: "swap" | "bridge";
}

export function TxStatus({ txHash, status, explorerUrl = "https://testnet.arcscan.app", type = "swap" }: TxStatusProps) {
  if (!txHash) return null;

  const steps = [
    { id: "submitted", label: "Submitted", active: ["pending", "attesting", "minting", "complete"].includes(status) },
    { id: "attesting", label: "Attesting", active: ["attesting", "minting", "complete"].includes(status) },
    { id: "minting", label: "Minting", active: ["minting", "complete"].includes(status) },
    { id: "complete", label: "Completed", active: status === "complete" },
  ];

  return (
    <div className="w-full mt-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-zinc-400">Transaction Status</span>
        <div className="flex items-center gap-2">
          {["pending", "attesting", "minting"].includes(status) && (
            <span className="flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {status.toUpperCase()}
            </span>
          )}
          {status === "complete" && (
            <span className="flex items-center gap-1.5 text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              COMPLETE
            </span>
          )}
          {status === "failed" && (
            <span className="flex items-center gap-1.5 text-xs text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full font-medium">
              <XCircle className="h-3.5 w-3.5" />
              FAILED
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>TX Hash</span>
          <a
            href={`${explorerUrl}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
          >
            {txHash.slice(0, 6)}...{txHash.slice(-6)}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {type === "bridge" && (
        <div className="mt-4 pt-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-500 block mb-2 font-medium">Bridge Progress (CCTP)</span>
          <div className="grid grid-cols-4 gap-1">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                    step.active
                      ? status === "complete"
                        ? "bg-green-500"
                        : "bg-sky-500"
                      : "bg-zinc-800"
                  }`}
                />
                <span
                  className={`text-[10px] mt-1.5 font-medium transition-colors duration-300 ${
                    step.active ? "text-zinc-300" : "text-zinc-600"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
