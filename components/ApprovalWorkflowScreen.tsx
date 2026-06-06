"use client";

import React, { useState } from "react";
import { usePortal } from "@/context/PortalContext";
import { Check, ShieldCheck, AlertCircle, Send, MessageSquare } from "lucide-react";

export default function ApprovalWorkflowScreen() {
  const { approvals, approveWorkflow, rejectWorkflow, selectedRfqForApproval, setView } = usePortal();
  const [commentText, setCommentText] = useState("");

  // Find active approval
  const activeApproval = approvals.find((a) => a.rfqId === selectedRfqForApproval) || approvals[0];

  const handleApprove = () => {
    if (!activeApproval) return;
    approveWorkflow(activeApproval.id, commentText || "Approved.");
    setCommentText("");
  };

  const handleReject = () => {
    if (!activeApproval) return;
    if (!commentText.trim()) {
      alert("Please provide a reason in the comment section for rejection.");
      return;
    }
    rejectWorkflow(activeApproval.id, commentText);
    setCommentText("");
  };

  if (!activeApproval) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p className="font-semibold">No pending approval workflows found.</p>
        <button
          onClick={() => setView("comparison")}
          className="mt-4 text-emerald-600 font-bold hover:underline"
        >
          Go select an RFQ winner first
        </button>
      </div>
    );
  }

  const stages = ["Prepared", "Reviewed", "Approved", "Completed"];
  const currentStageIndex = stages.indexOf(activeApproval.stage);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 leading-tight">
          Approval Workflow
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review and approve selected vendor awards
        </p>
      </div>

      {/* Main Stepper Bento Card */}
      <div className="bento-card p-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-6">
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
              Workflow Target
            </span>
            <h3 className="font-bold text-sm text-slate-800 mt-0.5">
              RFQ: {activeApproval.rfqTitle}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
              Proposed Award Value
            </span>
            <span className="text-base font-extrabold text-slate-800 mt-0.5 block">
              ${activeApproval.amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Stepper visualizer */}
        <div className="max-w-xl mx-auto flex items-center justify-between py-6">
          {stages.map((stage, idx) => {
            const isActive = stage === activeApproval.stage;
            const isPassed = currentStageIndex >= idx;
            return (
              <div key={idx} className="flex flex-col items-center gap-2 relative flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 z-10 ${
                    isPassed
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                      : "bg-slate-50 text-slate-350 border-slate-200"
                  }`}
                >
                  {isPassed ? <Check className="w-4.5 h-4.5 stroke-[3.5]" /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] font-bold tracking-tight uppercase ${
                    isActive ? "text-emerald-600 font-black" : isPassed ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {stage}
                </span>

                {/* Connector line */}
                {idx < 3 && (
                  <div
                    className={`absolute top-4.5 left-[50%] right-[-50%] h-0.5 z-0 transition-colors duration-300 ${
                      currentStageIndex > idx ? "bg-emerald-500" : "bg-slate-100"
                    }`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Split details & comments Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left pane: Award summary card (2/3 col on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bento-card p-6 min-h-[300px] flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800 tracking-tight mb-4">
                Award Proposal Details
              </h3>

              <div className="grid grid-cols-2 gap-4 border border-slate-100 rounded-2xl p-4 bg-slate-50/40 text-xs font-semibold text-slate-650 mb-4">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Selected Vendor</span>
                  <span className="text-slate-800 font-extrabold mt-0.5 block">{activeApproval.vendorName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Vendor ID</span>
                  <span className="font-mono text-slate-500 font-bold mt-0.5 block">{activeApproval.vendorId}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Requested Date</span>
                  <span className="text-slate-700 font-bold mt-0.5 block">{activeApproval.updatedAt.split(" ")[0]}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Current workflow stage</span>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-bold mt-1 inline-block text-[10px]">
                    {activeApproval.stage}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded-xl text-xs font-medium">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-bold">Automated Audit Compliance</p>
                  <p className="text-[11px] text-blue-600/90 mt-0.5">
                    This vendor proposal represents the lowest bid out of 3 received quotations and matches all compliance parameters.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer workflow action buttons */}
            {activeApproval.stage !== "Completed" && activeApproval.stage !== "Approved" ? (
              <div className="pt-6 border-t border-slate-100 flex gap-3 mt-6">
                <button
                  onClick={handleReject}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-rose-50 hover:border-rose-100 active:bg-rose-100 text-rose-600 font-bold rounded-xl text-xs transition-colors"
                >
                  Return / Reject
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  Approve Workflow
                </button>
              </div>
            ) : (
              <div className="pt-6 border-t border-slate-100 flex justify-center text-emerald-600 font-bold text-xs gap-1.5 mt-6 items-center">
                <ShieldCheck className="w-4.5 h-4.5" /> Fully approved and dispatched.
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Comments timeline bento card */}
        <div className="bento-card p-6 flex flex-col justify-between h-[380px]">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <MessageSquare className="w-4.5 h-4.5 text-slate-400" />
              <h3 className="font-bold text-sm text-slate-800 tracking-tight">
                Review Comments
              </h3>
            </div>

            {/* Comments log scroll box */}
            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1 scrollbar-none">
              {activeApproval.comments.map((comment, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[10px] text-slate-700">{comment.user}</span>
                    <span className="text-[9px] text-slate-400">{comment.date.split(" ")[1]}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-2.5 leading-relaxed font-medium">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Comment send input */}
          {activeApproval.stage !== "Completed" && activeApproval.stage !== "Approved" && (
            <div className="relative mt-4">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Type approval remarks..."
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                onClick={handleApprove}
                className="absolute right-1.5 top-1.5 p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
