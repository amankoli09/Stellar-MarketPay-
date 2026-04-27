/**
 * pages/jobs/[id].tsx
 * Single job detail page — view description, apply, manage as client, share, rate, and report.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import ApplicationForm from "@/components/ApplicationForm";
import WalletConnect from "@/components/WalletConnect";
import RatingForm from "@/components/RatingForm";
import ShareJobModal from "@/components/ShareJobModal";
import { fetchJob, fetchApplications, acceptApplication, releaseEscrow, scoreProposals } from "@/lib/api";
import { formatXLM, timeAgo, formatDate, shortenAddress, statusLabel, statusClass } from "@/utils/format";
import {
  accountUrl,
  buildReleaseEscrowTransaction,
  buildReleaseWithConversionTransaction,
  explorerUrl,
  getPathPaymentPrice,
  submitSignedSorobanTransaction,
  USDC_ISSUER,
  USDC_SAC_ADDRESS,
  XLM_SAC_ADDRESS,
} from "@/lib/stellar";
import { Asset } from "@stellar/stellar-sdk";
import { signTransactionWithWallet } from "@/lib/wallet";
<<<<<<< feature/report-job
import type { Application, Job } from "@/utils/types";
=======
import type { Application, AvailabilityStatus, Job, UserProfile } from "@/utils/types";
import clsx from "clsx";
>>>>>>> main

interface JobDetailProps {
  publicKey: string | null;
  onConnect: (pk: string) => void;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function JobDetail({ publicKey, onConnect }: JobDetailProps) {
  const router = useRouter();
  const { id } = router.query;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [releasingEscrow, setReleasingEscrow] = useState(false);
  const [releaseSuccess, setReleaseSuccess] = useState(false);
  const [releaseTxHash, setReleaseTxHash] = useState<string | null>(null);
  const [releaseSyncedWithBackend, setReleaseSyncedWithBackend] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);
  const [aiScores, setAiScores] = useState<Record<string, { score: number; reasoning: string }>>({});
  const [scoringProposals, setScoringProposals] = useState(false);

  const [releaseCurrency, setReleaseCurrency] = useState<"XLM" | "USDC">("XLM");
  const [estimatedOutput, setEstimatedOutput] = useState<string | null>(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const isClient = Boolean(publicKey && job?.clientAddress === publicKey);
  const isFreelancer = Boolean(publicKey && job?.freelancerAddress === publicKey);
  const hasApplied = applications.some(
    (application) => application.freelancerAddress === publicKey
  );

  useEffect(() => {
<<<<<<< feature/report-job
    if (!id || !router.isReady) return;

=======
    if (job?.currency) setReleaseCurrency(job.currency as any);
  }, [job?.currency]);

  useEffect(() => {
    if (!job || !releaseCurrency || releaseCurrency === job.currency) {
      setEstimatedOutput(null);
      return;
    }

    let cancelled = false;
    const fetchPrice = async () => {
      setFetchingPrice(true);
      try {
        const sourceAsset = job.currency === "XLM" ? Asset.native() : new Asset("USDC", USDC_ISSUER);
        const destAsset = releaseCurrency === "XLM" ? Asset.native() : new Asset("USDC", USDC_ISSUER);
        const res = await getPathPaymentPrice(sourceAsset, job.budget, destAsset);
        if (!cancelled && res) {
          setEstimatedOutput(res.amount);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setFetchingPrice(false);
      }
    };

    fetchPrice();
    return () => { cancelled = true; };
  }, [releaseCurrency, job?.budget, job?.currency]);

  useEffect(() => {
    if (!id) return;
    
    // Check for prefill parameter
>>>>>>> main
    const { prefill } = router.query;

    if (typeof prefill === "string") {
      try {
        const decoded = JSON.parse(Buffer.from(prefill, "base64").toString("utf8"));
        setPrefillData(decoded);
      } catch {
        setPrefillData(null);
      }
    }

    Promise.all([fetchJob(id as string), fetchApplications(id as string)])
      .then(([loadedJob, loadedApplications]) => {
        setJob(loadedJob);
        setApplications(loadedApplications);
      })
      .catch(() => router.push("/jobs"))
      .finally(() => setLoading(false));
  }, [id, router, router.isReady, router.query]);

  const handleAcceptApplication = async (applicationId: string) => {
    if (!publicKey || !id) return;

    try {
      setActionError(null);
      await acceptApplication(applicationId, publicKey);

      const [updatedJob, updatedApplications] = await Promise.all([
        fetchJob(id as string),
        fetchApplications(id as string),
      ]);

      setJob(updatedJob);
      setApplications(updatedApplications);
    } catch {
      setActionError("Failed to accept application.");
    }
  };

<<<<<<< feature/report-job
=======
  const handleToggleSelection = (appId: string) => {
    setSelectedApplications((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(appId)) {
        newSet.delete(appId);
      } else if (newSet.size < 3) {
        newSet.add(appId);
      }
      return newSet;
    });
  };

  const handleClearSelection = () => {
    setSelectedApplications(new Set());
  };

  const selectedApps = applications.filter((app) => selectedApplications.has(app.id));

  const handleScoreProposals = async () => {
    if (!id) return;
    setScoringProposals(true);
    try {
      const scores = await scoreProposals(id as string);
      const scoreMap = scores.reduce((accumulator, current) => {
        accumulator[current.id] = { score: current.score, reasoning: current.reasoning };
        return accumulator;
      }, {} as Record<string, { score: number; reasoning: string }>);
      setAiScores(scoreMap);
    } catch (error) {
      console.error("Scoring error:", error);
    } finally {
      setScoringProposals(false);
    }
  };

>>>>>>> main
  const handleReleaseEscrow = async () => {
    if (!publicKey || !job) return;

    if (!job.escrowContractId) {
      setActionError("This job has no escrow contract ID.");
      return;
    }

    setReleasingEscrow(true);
    setActionError(null);
    setReleaseTxHash(null);
    setReleaseSyncedWithBackend(false);

    try {
<<<<<<< feature/report-job
      const prepared = await buildReleaseEscrowTransaction(
        job.escrowContractId,
        job.id,
        publicKey
      );

      const { signedXDR, error: signError } = await signTransactionWithWallet(
        prepared.toXDR()
      );

=======
      let prepared;
      if (releaseCurrency !== job.currency && estimatedOutput) {
        // Issue #104: Release with conversion
        const targetTokenAddress = releaseCurrency === "XLM" ? XLM_SAC_ADDRESS : USDC_SAC_ADDRESS;
        // Apply 1% slippage protection (destMin = estimatedOutput * 0.99)
        const minAmountOut = BigInt(Math.round(parseFloat(estimatedOutput) * 0.99 * (releaseCurrency === "XLM" ? 10_000_000 : 1_000_000)));
        
        prepared = await buildReleaseWithConversionTransaction(
          job.escrowContractId,
          job.id,
          publicKey,
          targetTokenAddress,
          minAmountOut
        );
      } else {
        prepared = await buildReleaseEscrowTransaction(job.escrowContractId, job.id, publicKey);
      }

      const { signedXDR, error: signError } = await signTransactionWithWallet(prepared.toXDR());
>>>>>>> main
      if (signError || !signedXDR) {
        setActionError(signError || "Signing was cancelled.");
        return;
      }

      const { hash } = await submitSignedSorobanTransaction(signedXDR);
      setReleaseTxHash(hash);

      try {
        await releaseEscrow(job.id, publicKey, hash);
        const refreshedJob = await fetchJob(id as string);
        setJob(refreshedJob);
        setReleaseSuccess(true);
        setReleaseSyncedWithBackend(true);
      } catch {
        setActionError(
          "Payment was released on-chain, but the backend status could not be updated."
        );
        setReleaseSuccess(true);
        setReleaseSyncedWithBackend(false);
      }
    } catch (error: unknown) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Could not complete the release. Please try again."
      );
    } finally {
      setReleasingEscrow(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!job) return;

    if (!publicKey) {
      setReportError("Please connect your wallet before reporting this job.");
      return;
    }

    if (!reportCategory) {
      setReportError("Please select a report category.");
      return;
    }

    setReportLoading(true);
    setReportError(null);

    try {
      const response = await fetch(`/api/jobs/${job.id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reporterAddress: publicKey,
          category: reportCategory,
          description: reportDescription,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to submit report.");
      }

      setReportSuccess(true);
      setReportCategory("");
      setReportDescription("");
    } catch (error: unknown) {
      setReportError(
        error instanceof Error ? error.message : "Failed to submit report."
      );
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
        <div className="h-8 bg-market-500/8 rounded w-2/3 mb-4" />
        <div className="h-4 bg-market-500/5 rounded w-1/3 mb-8" />
        <div className="card space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-4 bg-market-500/8 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <>
      <Head>
        <title>{job.title} - Stellar MarketPay</title>
        <meta name="description" content={job.description.substring(0, 160)} />
        <meta property="og:title" content={job.title} />
        <meta property="og:description" content={job.description.substring(0, 160)} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Stellar MarketPay" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={job.title} />
        <meta name="twitter:description" content={job.description.substring(0, 160)} />
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-amber-800 hover:text-amber-400 transition-colors mb-6"
        >
          ← Back to Jobs
        </Link>

        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={statusClass(job.status)}>{statusLabel(job.status)}</span>

                <span className="text-xs text-amber-800 bg-ink-700 px-2.5 py-1 rounded-full border border-market-500/10">
                  {job.category}
                </span>

                {job.boosted && new Date(job.boostedUntil || "") > new Date() && (
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold text-amber-100 leading-snug">
                {job.title}
              </h1>
            </div>

            <div className="flex-shrink-0 sm:text-right">
              <p className="text-xs text-amber-800 mb-1">Budget</p>
              <p className="font-mono font-bold text-2xl text-market-400">
                {formatXLM(job.budget)} {job.currency}
              </p>

              {job.deadline && (
                <p className="text-xs text-amber-700 mt-2">
                  Deadline: {formatDate(job.deadline)}
                </p>
              )}

              <a
                href={accountUrl(job.clientAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-sm text-amber-700 hover:text-market-400 transition-colors"
              >
                Client: {shortenAddress(job.clientAddress)} ↗
              </a>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <h3 className="font-display text-base font-semibold text-amber-300 mb-3">
              Description
            </h3>

            <p className="text-amber-700/90 leading-relaxed whitespace-pre-wrap font-body text-sm">
              {job.description}
            </p>
          </div>

          <div className="mt-4 flex justify-between items-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="text-xs text-market-400 hover:text-market-300 underline"
            >
              Share job
            </button>

            <button
              onClick={() => {
                setShowReportModal(true);
                setReportSuccess(false);
                setReportError(null);
              }}
              className="text-xs text-red-400 hover:text-red-300 underline"
            >
              Report this job
            </button>
          </div>

          {job.skills?.length > 0 && (
            <div className="mt-5">
              <h3 className="font-display text-base font-semibold text-amber-300 mb-3">
                Required Skills
              </h3>

              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-sm bg-market-500/8 text-market-500/80 border border-market-500/15 px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
<<<<<<< feature/report-job
=======
      )}

      {/* Applications (client view) */}
      {isClient && applications.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-amber-100">
              Applications ({applications.length})
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={handleScoreProposals}
                disabled={scoringProposals || applications.length === 0}
                className="btn-secondary text-[10px] py-1 px-3 flex items-center gap-1.5"
              >
                {scoringProposals ? (
                  <Spinner />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                )}
                Score proposals (AI)
              </button>
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-amber-800 font-medium uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <kbd className="bg-ink-900 px-1.5 py-0.5 rounded border border-market-500/20 text-market-400">
                    ↑↓
                  </kbd>{" "}
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-ink-900 px-1.5 py-0.5 rounded border border-market-500/20 text-market-400">
                    Enter
                  </kbd>{" "}
                  Accept
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {applications.map((app) => (
              <div 
                key={app.id} 
                className="card focus-visible:ring-2 focus-visible:ring-market-400 focus:outline-none transition-all"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
                  } else if (e.key === "Enter" && e.target === e.currentTarget) {
                    if (app.status === "pending" && job.status === "open") {
                      handleAcceptApplication(app.id);
                    }
                  }
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedApplications.has(app.id)}
                      onChange={() => handleToggleSelection(app.id)}
                      disabled={
                        !selectedApplications.has(app.id) && selectedApplications.size >= 3
                      }
                      className="w-4 h-4 rounded border-market-500/30 bg-market-500/10 text-market-400 focus:ring-market-500/50 cursor-pointer"
                    />
                    <a href={accountUrl(app.freelancerAddress)} target="_blank" rel="noopener noreferrer"
                      className="address-tag hover:border-market-500/40 transition-colors">
                      {shortenAddress(app.freelancerAddress)} ↗
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-market-400 font-semibold text-sm">{formatXLM(app.bidAmount)}</span>
                    <span className={clsx("text-xs px-2.5 py-1 rounded-full border",
                      app.status === "accepted" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      app.status === "rejected" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-market-500/10 text-market-400 border-market-500/20"
                    )}>{app.status}</span>
                  </div>
                </div>

                {aiScores[app.id] && (
                  <div className="mb-4 p-3 rounded bg-market-500/5 border border-market-500/15 animate-fade-in">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-market-400 bg-market-500/10 px-1.5 py-0.5 rounded">AI Score</span>
                      <span className="text-lg font-display font-bold text-amber-100">{aiScores[app.id].score}/10</span>
                    </div>
                    <p className="text-xs text-amber-700/90 leading-relaxed italic">
                      &quot;{aiScores[app.id].reasoning}&quot;
                    </p>
                  </div>
                )}

                <p className="text-amber-700/80 text-sm leading-relaxed mb-4">{app.proposal}</p>
                
                {/* Screening Answers */}
                {app.screeningAnswers && Object.keys(app.screeningAnswers).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-market-500/10">
                    <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-3">Screening Question Answers</h4>
                    <div className="space-y-3">
                      {Object.entries(app.screeningAnswers).map(([question, answer], index) => (
                        <div key={index}>
                          <p className="text-xs text-amber-300 font-medium mb-1">{question}</p>
                          <p className="text-sm text-amber-700/80 bg-market-500/5 p-2 rounded border border-market-500/10">{answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {app.status === "pending" && job.status === "open" && (
                  <button onClick={() => handleAcceptApplication(app.id)} className="btn-secondary text-sm py-2 px-4 mt-4">
                    Accept Proposal
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proposal Comparison Modal */}
      {showComparison && (
        <ProposalComparison
          applications={selectedApps}
          job={job}
          publicKey={publicKey}
          onClose={() => setShowComparison(false)}
          onAccept={handleAcceptApplication}
        />
      )}

      {/* Apply (freelancer view) */}
      {!isClient && job.status === "open" && (
        <div className="mb-6">
          {!publicKey ? (
            <div>
              <p className="text-amber-800 text-sm mb-4 text-center">Connect your wallet to apply for this job</p>
              <WalletConnect onConnect={onConnect} />
            </div>
          ) : hasApplied ? (
            <div className="card text-center py-8 border-market-500/20">
              <p className="text-market-400 font-medium mb-1">✅ Application submitted</p>
              <p className="text-amber-800 text-sm">The client will review your proposal shortly.</p>
            </div>
          ) : showApplyForm ? (
            <ApplicationForm
              job={job}
              publicKey={publicKey}
              prefillData={prefillData}
              onSuccess={() => { setShowApplyForm(false); setApplications((prev) => [...prev, {} as Application]); }}
            />
          ) : (
            <div className="text-center">
              <button onClick={() => setShowApplyForm(true)} className="btn-primary text-base px-10 py-3.5">
                Apply for this Job
              </button>
            )}

        {isClient && job.status === "in_progress" && (
          <div className="card mb-6 border-market-500/30">
            <h2 className="font-display text-xl font-bold text-amber-100 mb-4">Escrow Management</h2>
            <p className="text-amber-800 text-sm mb-6">
              The work is in progress. Once you are satisfied with the deliverables, you can release the funds to the freelancer.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-amber-800 uppercase tracking-wider mb-3">
                  Release Asset
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReleaseCurrency(job.currency as any)}
                    className={clsx(
                      "flex-1 py-2 px-4 rounded border transition-all",
                      releaseCurrency === job.currency
                        ? "bg-market-500/20 border-market-400 text-market-400"
                        : "bg-ink-900 border-market-500/10 text-amber-800 hover:border-market-500/30"
                    )}
                  >
                    {job.currency} (Default)
                  </button>
                  <button
                    onClick={() => setReleaseCurrency(job.currency === "USDC" ? "XLM" : "USDC")}
                    className={clsx(
                      "flex-1 py-2 px-4 rounded border transition-all",
                      releaseCurrency !== job.currency
                        ? "bg-market-500/20 border-market-400 text-market-400"
                        : "bg-ink-900 border-market-500/10 text-amber-800 hover:border-market-500/30"
                    )}
                  >
                    {job.currency === "USDC" ? "XLM" : "USDC"}
                  </button>
                </div>
              </div>

              {releaseCurrency !== job.currency && (
                <div className="bg-market-500/5 p-4 rounded border border-market-500/10 animate-fade-in">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-amber-800">Estimated Output</span>
                    {fetchingPrice ? (
                      <Spinner />
                    ) : (
                      <span className="font-mono text-market-400">
                        {estimatedOutput} {releaseCurrency}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-amber-900">
                    Conversion via Stellar DEX path payment. Rate is estimated and subject to slippage.
                  </p>
                </div>
              )}

              <button
                onClick={handleReleaseEscrow}
                disabled={releasingEscrow || (releaseCurrency !== job.currency && !estimatedOutput)}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {releasingEscrow ? <Spinner /> : "Release Escrow"}
              </button>
              
              {actionError && <p className="mt-3 text-red-400 text-sm">{actionError}</p>}
            </div>
          </div>
        )}
>>>>>>> main

        {isClient && applications.length > 0 && (
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-amber-100 mb-4">
              Applications ({applications.length})
            </h2>

            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="card">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <a
                      href={accountUrl(application.freelancerAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="address-tag hover:border-market-500/40 transition-colors"
                    >
                      {shortenAddress(application.freelancerAddress)} ↗
                    </a>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-market-400 font-semibold text-sm">
                        {formatXLM(application.bidAmount)}
                      </span>

                      <span
                        className={cx(
                          "text-xs px-2.5 py-1 rounded-full border",
                          application.status === "accepted" &&
                            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                          application.status === "rejected" &&
                            "bg-red-500/10 text-red-400 border-red-500/20",
                          application.status === "pending" &&
                            "bg-market-500/10 text-market-400 border-market-500/20"
                        )}
                      >
                        {application.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-amber-700/80 text-sm leading-relaxed mb-4">
                    {application.proposal}
                  </p>

                  {application.screeningAnswers &&
                    Object.keys(application.screeningAnswers).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-market-500/10">
                        <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-3">
                          Screening Question Answers
                        </h4>

                        <div className="space-y-3">
                          {Object.entries(application.screeningAnswers).map(
                            ([question, answer], index) => (
                              <div key={index}>
                                <p className="text-xs text-amber-300 font-medium mb-1">
                                  {question}
                                </p>

                                <p className="text-sm text-amber-700/80 bg-market-500/5 p-2 rounded border border-market-500/10">
                                  {String(answer)}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {application.status === "pending" && job.status === "open" && (
                    <button
                      onClick={() => handleAcceptApplication(application.id)}
                      className="btn-secondary text-sm py-2 px-4 mt-4"
                    >
                      Accept Proposal
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isClient && job.status === "open" && (
          <div className="mb-6">
            {!publicKey ? (
              <div>
                <p className="text-amber-800 text-sm mb-4 text-center">
                  Connect your wallet to apply for this job
                </p>
                <WalletConnect onConnect={onConnect} />
              </div>
            ) : hasApplied ? (
              <div className="card text-center py-8 border-market-500/20">
                <p className="text-market-400 font-medium mb-1">
                  Application submitted
                </p>
                <p className="text-amber-800 text-sm">
                  The client will review your proposal shortly.
                </p>
              </div>
            ) : showApplyForm ? (
              <ApplicationForm
                job={job}
                publicKey={publicKey}
                prefillData={prefillData}
                onSuccess={() => {
                  setShowApplyForm(false);
                  fetchApplications(job.id).then(setApplications);
                }}
              />
            ) : (
              <div className="text-center">
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="btn-primary text-base px-10 py-3.5"
                >
                  Apply for this Job
                </button>
              </div>
            )}
          </div>
        )}

        {isClient && job.status !== "completed" && job.freelancerAddress && (
          <div className="card mb-6">
            <h2 className="font-display text-xl font-bold text-amber-100 mb-3">
              Escrow
            </h2>

            <button
              onClick={handleReleaseEscrow}
              disabled={releasingEscrow}
              className="btn-primary"
            >
              {releasingEscrow ? "Releasing..." : "Release Escrow"}
            </button>

            {releaseSuccess && (
              <p className="mt-3 text-emerald-400 text-sm">
                Escrow released successfully.
              </p>
            )}

            {releaseTxHash && (
              <p className="mt-2 text-amber-700 text-xs break-all">
                Transaction hash: {releaseTxHash}
              </p>
            )}

            {releaseSuccess && !releaseSyncedWithBackend && (
              <p className="mt-2 text-amber-400 text-xs">
                On-chain release succeeded, but backend sync failed.
              </p>
            )}
          </div>
        )}

        {actionError && (
          <p className="mt-3 mb-6 text-red-400 text-sm">{actionError}</p>
        )}

        {job.status === "completed" && publicKey && !ratingSubmitted && (
          <div className="mt-6">
            {isClient && job.freelancerAddress && (
              <RatingForm
                jobId={job.id}
                ratedAddress={job.freelancerAddress}
                ratedLabel="the freelancer"
                onSuccess={() => setRatingSubmitted(true)}
              />
            )}

            {isFreelancer && (
              <RatingForm
                jobId={job.id}
                ratedAddress={job.clientAddress}
                ratedLabel="the client"
                onSuccess={() => setRatingSubmitted(true)}
              />
            )}
          </div>
        )}
      </div>

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-market-500/20 bg-ink-900 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-amber-100">
                  Report this job
                </h2>
                <p className="text-xs text-amber-800 mt-1">
                  Help keep suspicious or fraudulent jobs off the platform.
                </p>
              </div>

              <button
                onClick={() => setShowReportModal(false)}
                className="text-amber-800 hover:text-amber-300"
                aria-label="Close report modal"
              >
                ✕
              </button>
            </div>

            {reportSuccess ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-emerald-400 font-medium">
                  Thank you for your report.
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  The team will review this job listing.
                </p>

                <button
                  onClick={() => setShowReportModal(false)}
                  className="btn-primary w-full mt-4"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <label className="block text-sm text-amber-300 mb-2">
                  Report category
                </label>

                <select
                  value={reportCategory}
                  onChange={(event) => setReportCategory(event.target.value)}
                  className="w-full rounded-lg border border-market-500/20 bg-ink-800 px-3 py-2 text-sm text-amber-100 outline-none focus:border-market-400"
                >
                  <option value="">Select a category</option>
                  <option value="fraud">Fraud or scam</option>
                  <option value="suspicious">Suspicious listing</option>
                  <option value="spam">Spam</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="other">Other</option>
                </select>

                <label className="block text-sm text-amber-300 mt-4 mb-2">
                  Description optional
                </label>

                <textarea
                  value={reportDescription}
                  onChange={(event) => setReportDescription(event.target.value)}
                  rows={4}
                  placeholder="Add extra details..."
                  className="w-full rounded-lg border border-market-500/20 bg-ink-800 px-3 py-2 text-sm text-amber-100 outline-none focus:border-market-400"
                />

                {reportError && (
                  <p className="mt-3 text-sm text-red-400">{reportError}</p>
                )}

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="btn-secondary flex-1"
                    disabled={reportLoading}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSubmitReport}
                    className="btn-primary flex-1"
                    disabled={reportLoading}
                  >
                    {reportLoading ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showShareModal && (
        <ShareJobModal job={job} onClose={() => setShowShareModal(false)} />
      )}
    </>
  );
}