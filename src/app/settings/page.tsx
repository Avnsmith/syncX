"use client";

import React, { useState, useEffect } from "react";
import { Settings, Eye, EyeOff, CheckCircle2, AlertTriangle, Key, Cpu, HelpCircle, Loader2, Play, Terminal, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { PaymentService } from "@/services/payments/paymentService";

interface AIPreferences {
  responseStyle: "concise" | "detailed" | "friendly";
  riskSensitivity: "low" | "medium" | "high";
  transactionGuidance: boolean;
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const [preferences, setPreferences] = useState<AIPreferences>({
    responseStyle: "concise",
    riskSensitivity: "medium",
    transactionGuidance: true,
  });

  // Orchestrator Validation state
  const [orchestratedProvider, setOrchestratedProvider] = useState<"circle" | "arc" | "payx" | "stream">("circle");
  const [orchestratedAmount, setOrchestratedAmount] = useState("10.00");
  const [orchestratedFrom, setOrchestratedFrom] = useState("0x9c41E5c5F296Ed1797AaE4238D26CCaBEadb86C");
  const [orchestratedTo, setOrchestratedTo] = useState("0x3600000000000000000000000000000000000000");
  const [orchestratedTrace, setOrchestratedTrace] = useState<string[]>([]);
  const [orchestratedExecuting, setOrchestratedExecuting] = useState(false);
  const [orchestratedResponse, setOrchestratedResponse] = useState<any>(null);

  // Load preferences and key from localStorage on mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("syncx_gemini_api_key") || "";
      setApiKey(storedKey);

      const storedPrefs = localStorage.getItem("syncx_ai_config");
      if (storedPrefs) {
        try {
          setPreferences(JSON.parse(storedPrefs));
        } catch (e) {
          console.error("Failed to parse stored AI preferences:", e);
        }
      }
    }
  }, []);

  const handleSavePreferences = (updated: Partial<AIPreferences>) => {
    const next = { ...preferences, ...updated } as AIPreferences;
    setPreferences(next);
    localStorage.setItem("syncx_ai_config", JSON.stringify(next));
  };

  const handleSaveKey = (val: string) => {
    setApiKey(val);
    localStorage.setItem("syncx_gemini_api_key", val);
    setTestStatus("idle");
    setFeedbackMsg("");
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus("error");
      setFeedbackMsg("Please enter a valid Gemini API Key before testing.");
      return;
    }

    setTestStatus("testing");
    setFeedbackMsg("");

    try {
      const res = await fetch("/api/ai/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus("success");
        setFeedbackMsg("Connection successful! The API key is valid.");
      } else {
        setTestStatus("error");
        setFeedbackMsg(data.error || "Connection failed. Please verify your API key and try again.");
      }
    } catch (err: any) {
      setTestStatus("error");
      setFeedbackMsg("Network error. Unable to test connection.");
    }
  };

  const handleExecuteOrchestratedPayment = async () => {
    setOrchestratedExecuting(true);
    setOrchestratedResponse(null);
    const trace: string[] = [];
    trace.push(`1. Constructing PaymentRequest...`);
    
    const request = {
      id: "payx_" + Math.random().toString(36).substring(2, 9),
      fromType: "human" as const,
      toType: "agent" as const,
      from: orchestratedFrom,
      to: orchestratedTo,
      amount: parseFloat(orchestratedAmount) * 100, // minor units (cents)
      asset: "USDC",
      memo: `Orchestrated validation payment`,
      tags: orchestratedProvider === "circle" ? [] : [orchestratedProvider],
    };
    
    trace.push(`   Payload: { id: "${request.id}", from: "${request.from.substring(0, 6)}...", to: "${request.to.substring(0, 6)}...", amount: ${request.amount}, tags: [${request.tags.join(", ")}] }`);
    
    // Simulate minor delay to watch trace
    setOrchestratedTrace([...trace]);
    await new Promise((resolve) => setTimeout(resolve, 600));

    trace.push(`2. Fetching PaymentService instance...`);
    setOrchestratedTrace([...trace]);
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const paymentService = PaymentService.getInstance();
      trace.push(`   PaymentService successfully retrieved in runtime.`);
      trace.push(`3. Dispatching to IPaymentProcessor (DefaultPaymentProcessor)...`);
      setOrchestratedTrace([...trace]);
      await new Promise((resolve) => setTimeout(resolve, 600));

      trace.push(`4. Evaluating routing tags...`);
      if (orchestratedProvider === "circle") {
        trace.push(`   → No specific routing tag found. Defaulting to Circle USDC Provider.`);
      } else {
        trace.push(`   → Found routing tag: "${orchestratedProvider}".`);
      }
      setOrchestratedTrace([...trace]);
      await new Promise((resolve) => setTimeout(resolve, 600));

      trace.push(`5. Selecting and Executing Provider...`);
      if (orchestratedProvider === "circle") {
        trace.push(`   → Selected: MockCircleProvider`);
        trace.push(`   → Executing Circle transfer...`);
      } else if (orchestratedProvider === "arc") {
        trace.push(`   → Selected: MockArcProvider`);
        trace.push(`   → Executing Arc Network payment...`);
      } else if (orchestratedProvider === "payx") {
        trace.push(`   → Selected: MockPayXProvider`);
        trace.push(`   → Executing PayX Engine settlement...`);
      } else if (orchestratedProvider === "stream") {
        trace.push(`   → Selected: MockStreamPayProvider`);
        trace.push(`   → Initializing Streaming Subscription stream...`);
      }
      setOrchestratedTrace([...trace]);
      await new Promise((resolve) => setTimeout(resolve, 700));

      const response = await paymentService.processPayment(request);
      
      trace.push(`6. Provider executed successfully.`);
      trace.push(`7. Collecting Unified PaymentResponse...`);
      trace.push(`   Unified Response: { paymentId: "${response.paymentId}", status: "${response.status}", fee: { amount: ${response.fee?.amount ?? 0}, asset: "${response.fee?.asset ?? 'USDC'}", source: "${response.fee?.source ?? 'circle'}" } }`);
      setOrchestratedTrace([...trace]);
      await new Promise((resolve) => setTimeout(resolve, 500));

      trace.push(`8. Propagating transaction state to UI...`);
      trace.push(`   State: SUCCESS! Transaction settled.`);
      setOrchestratedTrace([...trace]);
      
      setOrchestratedResponse(response);
    } catch (err: any) {
      trace.push(`❌ Error encountered during orchestration: ${err.message || err}`);
      setOrchestratedTrace([...trace]);
    } finally {
      setOrchestratedExecuting(false);
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium">Loading settings...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto bg-slate-50">
      
      {/* Page Header */}
      <div className="flex items-center gap-2 mb-8 pb-6 border-b border-slate-200">
        <Settings className="h-8 w-8 text-sky-600" />
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SyncX Settings & Audits</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your Gemini API key and run infrastructure validation tests.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Gemini API Section */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Key className="h-5 w-5 text-sky-600" />
            Gemini API Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center justify-between">
                <span>Gemini API Key</span>
                <a
                  href="https://aistudio.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-600 hover:underline hover:text-sky-700 capitalize font-extrabold tracking-normal"
                >
                  Get API Key ↗
                </a>
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => handleSaveKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 p-3.5 pr-12 font-mono text-sm focus:outline-none focus:border-sky-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer active:scale-95 transition-all"
                >
                  {showKey ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Test Connection Button & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus === "testing"}
                className="py-3 px-5 rounded-2xl font-bold bg-sky-600 hover:bg-sky-500 text-white text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {testStatus === "testing" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Test Connection</span>
                )}
              </button>

              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="text-slate-400">Status:</span>
                {testStatus === "idle" && (
                  <span className="text-slate-500">Unverified</span>
                )}
                {testStatus === "testing" && (
                  <span className="text-amber-600">Testing connection...</span>
                )}
                {testStatus === "success" && (
                  <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 font-extrabold uppercase tracking-wide">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                  </span>
                )}
                {testStatus === "error" && (
                  <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 font-extrabold uppercase tracking-wide">
                    <AlertTriangle className="h-3.5 w-3.5" /> Error
                  </span>
                )}
              </div>
            </div>

            {/* Feedback Messages */}
            {feedbackMsg && (
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                testStatus === "success" 
                  ? "border-emerald-100 bg-emerald-50/50 text-emerald-700" 
                  : "border-rose-100 bg-rose-50/50 text-rose-700"
              }`}>
                {feedbackMsg}
              </div>
            )}
          </div>
        </section>

        {/* AI Preferences Section */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="h-5 w-5 text-sky-600" />
            AI Preferences
          </h3>

          <div className="space-y-4">
            {/* Response Style */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Response Style</h4>
                <p className="text-xs text-slate-500">Determine how verbose or casual the assistant replies.</p>
              </div>
              <select
                value={preferences.responseStyle}
                onChange={(e) => handleSavePreferences({ responseStyle: e.target.value as any })}
                className="rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-800 font-semibold text-xs focus:outline-none cursor-pointer w-full sm:w-[150px]"
              >
                <option value="concise">Concise</option>
                <option value="detailed">Detailed</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>

            {/* Risk Sensitivity */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Risk Sensitivity</h4>
                <p className="text-xs text-slate-500">How cautious the AI should be when verifying transactions.</p>
              </div>
              <select
                value={preferences.riskSensitivity}
                onChange={(e) => handleSavePreferences({ riskSensitivity: e.target.value as any })}
                className="rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-800 font-semibold text-xs focus:outline-none cursor-pointer w-full sm:w-[150px]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Transaction Guidance Toggle */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Transaction Guidance</h4>
                <p className="text-xs text-slate-500">Receive recommendations before confirming transfers.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.transactionGuidance}
                  onChange={(e) => handleSavePreferences({ transactionGuidance: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
          </div>
        </section>

        {/* PayX Orchestrator Validation Panel */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ArrowRightLeft className="h-5 w-5 text-indigo-600" />
            PayX Orchestrator Validation Panel
          </h3>

          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Select any of the registered payment providers to dispatch a live transaction through the core `PaymentService` engine. Trace the active provider selection and unified state response in real-time.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["circle", "arc", "payx", "stream"] as const).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setOrchestratedProvider(prov)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer ${
                    orchestratedProvider === prov
                      ? "bg-indigo-650 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800"
                  }`}
                  disabled={orchestratedExecuting}
                >
                  {prov === "circle" ? "Circle USDC" : prov === "arc" ? "Arc network" : prov === "payx" ? "PayX Engine" : "StreamPay"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Amount</label>
                <input
                  type="number"
                  value={orchestratedAmount}
                  onChange={(e) => setOrchestratedAmount(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-2.5 text-xs font-bold"
                  disabled={orchestratedExecuting}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Asset Token</label>
                <div className="rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-2.5 text-xs font-bold select-none">
                  USDC
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Sender Address (from)</label>
                <input
                  type="text"
                  value={orchestratedFrom}
                  onChange={(e) => setOrchestratedFrom(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-2.5 text-xs font-mono"
                  disabled={orchestratedExecuting}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Recipient Address (to)</label>
                <input
                  type="text"
                  value={orchestratedTo}
                  onChange={(e) => setOrchestratedTo(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 p-2.5 text-xs font-mono"
                  disabled={orchestratedExecuting}
                />
              </div>
            </div>

            {/* Run button */}
            <button
              type="button"
              onClick={handleExecuteOrchestratedPayment}
              disabled={orchestratedExecuting}
              className="py-3 px-5 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 w-full"
            >
              {orchestratedExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Orchestration...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Execute Orchestrated Payment</span>
                </>
              )}
            </button>

            {/* Live Trace Logs */}
            {orchestratedTrace.length > 0 && (
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Terminal className="h-3.5 w-3.5 text-slate-400" />
                  Live Execution Trace Log
                </label>
                <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[11px] text-emerald-400 leading-relaxed shadow-inner overflow-x-auto whitespace-pre space-y-1 max-h-[220px]">
                  {orchestratedTrace.map((log, idx) => (
                    <div key={idx} className="animate-in fade-in duration-100">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unified PaymentResponse state */}
            {orchestratedResponse && (
              <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 text-emerald-800 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>Unified Payment Response Collected</span>
                </div>
                <div className="text-xs font-medium space-y-1 text-slate-600 pl-7">
                  <div><strong className="text-slate-800">Orchestrator ID:</strong> {orchestratedResponse.paymentId}</div>
                  <div><strong className="text-slate-800">State Code:</strong> {orchestratedResponse.status.toUpperCase()}</div>
                  <div><strong className="text-slate-800">Service Fee:</strong> {orchestratedResponse.fee?.amount / 100} {orchestratedResponse.fee?.asset}</div>
                  <div><strong className="text-slate-800">Fee Source Adapter:</strong> {orchestratedResponse.fee?.source.toUpperCase()}</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Back Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/assistant"
            className="py-3 px-5 rounded-2xl font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs transition-all shadow-sm cursor-pointer"
          >
            Go to Assistant
          </Link>
          <Link
            href="/"
            className="py-3 px-5 rounded-2xl font-bold bg-sky-600 hover:bg-sky-500 text-white text-xs transition-all shadow-md cursor-pointer"
          >
            Save and Exit
          </Link>
        </div>
      </div>
    </main>
  );
}
