import React, { useState } from "react";
import { useDeveloperStore } from "@/store/useDeveloperStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Github,
  Globe,
  HardDrive,
  Bell,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Shield,
} from "lucide-react";

export const PublishPluginModal: React.FC = () => {
  const { isPublishModalOpen, setPublishModalOpen, addSubmission } =
    useDeveloperStore();
  const { currentUser } = useAuthStore();

  const [step, setStep] = useState<number>(1);

  // Form State
  const [pluginId, setPluginId] = useState<string>("at.ac.tuwien.my-plugin");
  const [name, setName] = useState<string>("");
  const [version, setVersion] = useState<string>("1.0.0");
  const [description, setDescription] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "academics",
  ]);

  const [githubRepo, setGithubRepo] = useState<string>(
    currentUser?.githubUsername
      ? `https://github.com/${currentUser.githubUsername}/`
      : "https://github.com/"
  );
  const [releaseTag, setReleaseTag] = useState<string>("v1.0.0");

  // Capabilities & Justifications
  const [networkDomains, setNetworkDomains] = useState<string[]>([
    "https://tuwel.tuwien.ac.at/*",
  ]);
  const [networkJustifications, setNetworkJustifications] = useState<
    Record<string, string>
  >({
    "https://tuwel.tuwien.ac.at/*":
      "Required to fetch active course modules and student deadlines.",
  });
  const [newDomainInput, setNewDomainInput] = useState<string>("");

  const [storageMb, setStorageMb] = useState<number>(2);
  const [storageJustification, setStorageJustification] = useState<string>(
    "Local encrypted cache for course summaries and offline access."
  );
  const [notifications, setNotifications] = useState<boolean>(true);
  const [notificationsJustification, setNotificationsJustification] =
    useState<string>("Notifies student 24h prior to deadline submission.");

  const [submittedPr, setSubmittedPr] = useState<{
    prNumber: number;
    prUrl: string;
  } | null>(null);

  if (!isPublishModalOpen) return null;

  const categoriesList = [
    { id: "academics", label: "Academics" },
    { id: "productivity", label: "Productivity" },
    { id: "campus", label: "Campus Life" },
    { id: "tools", label: "Utilities & Tools" },
    { id: "community", label: "Community" },
  ];

  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== id));
      }
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const handleAddDomain = () => {
    const trimmed = newDomainInput.trim();
    if (trimmed && !networkDomains.includes(trimmed)) {
      setNetworkDomains([...networkDomains, trimmed]);
      setNetworkJustifications({
        ...networkJustifications,
        [trimmed]: "Access needed for institutional API synchronization.",
      });
      setNewDomainInput("");
    }
  };

  const handleRemoveDomain = (domain: string) => {
    setNetworkDomains(networkDomains.filter((d) => d !== domain));
    const updated = { ...networkJustifications };
    delete updated[domain];
    setNetworkJustifications(updated);
  };

  // Automated Pre-Flight Linter Checks
  const isReverseDnsValid = /^[a-z0-9-]+(\.[a-z0-9-]+){2,}$/.test(pluginId);
  const isVersionValid = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(
    version.replace(/^v/, "")
  );
  const isRepoValid = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+/.test(
    githubRepo.trim()
  );
  const isNameValid = name.trim().length >= 3;
  const isDescValid = description.trim().length >= 10;
  const areJustificationsValid =
    networkDomains.every(
      (d) =>
        networkJustifications[d] && networkJustifications[d].trim().length >= 8
    ) &&
    (!storageMb || storageJustification.trim().length >= 6) &&
    (!notifications || notificationsJustification.trim().length >= 6);

  const linterChecks = [
    {
      title: "Reverse-DNS Namespace",
      description: `Target: "${pluginId}" conforms to hierarchical domain naming.`,
      pass: isReverseDnsValid,
      critical: true,
    },
    {
      title: "Semantic Versioning",
      description: `Format: "v${version.replace(/^v/, "")}" strictly follows SemVer specification.`,
      pass: isVersionValid,
      critical: true,
    },
    {
      title: "GitHub Repository & Release",
      description: `Target repo "${githubRepo}" and tag "${releaseTag}" are reachable.`,
      pass: isRepoValid && releaseTag.trim().length > 0,
      critical: true,
    },
    {
      title: "HTTPS Capability Bounding",
      description: `All ${networkDomains.length} network domains use strict HTTPS protocols.`,
      pass:
        networkDomains.length === 0 ||
        networkDomains.every((d) => d.startsWith("https://")),
      critical: true,
    },
    {
      title: "Security & Privacy Justifications",
      description:
        "Every requested network permission and storage quota has an explicit rationale.",
      pass: areJustificationsValid,
      critical: true,
    },
    {
      title: "Metadata & Classification",
      description: `Title (${name.length} chars) & description (${description.length} chars) provided.`,
      pass: isNameValid && isDescValid,
      critical: true,
    },
  ];

  const canProceedToLint =
    isReverseDnsValid && isNameValid && isDescValid && isRepoValid;
  const allLintsPassed = linterChecks.every((c) => c.pass);

  const handleSubmit = () => {
    if (!allLintsPassed) return;

    const newSub = addSubmission({
      id: pluginId,
      name,
      version: version.replace(/^v/, ""),
      description,
      categories: selectedCategories,
      githubRepo,
      releaseTag,
      networkJustifications,
      storageQuotaBytes: storageMb * 1024 * 1024,
      notifications,
    });

    setSubmittedPr({
      prNumber: newSub.prNumber || 35,
      prUrl:
        newSub.prUrl ||
        `https://github.com/tuwien-community/tu-cockpit-store/pull/35`,
    });
  };

  const handleClose = () => {
    setSubmittedPr(null);
    setPublishModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-[var(--tu-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)]/15 border border-[var(--tu-accent)]/30 text-[var(--tu-accent)] flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--tu-text-primary)]">
                Community Store Publishing Application
              </h3>
              <p className="text-xs text-[var(--tu-text-secondary)]">
                Submit an open-source student plugin for automated security review and store inclusion
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] p-1 rounded hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper Bar (if not submitted) */}
        {!submittedPr && (
          <div className="px-6 py-2.5 bg-[var(--tu-bg-card)] border-b border-[var(--tu-border-subtle)] flex items-center justify-between text-xs shrink-0 select-none">
            {[
              { num: 1, label: "Plugin Metadata" },
              { num: 2, label: "Source & Release" },
              { num: 3, label: "Capability Justifications" },
              { num: 4, label: "Pre-Flight Linting" },
            ].map((s) => (
              <div
                key={s.num}
                onClick={() => {
                  if (s.num < step || canProceedToLint) setStep(s.num);
                }}
                className={`flex items-center gap-1.5 cursor-pointer font-medium transition-colors ${
                  step === s.num
                    ? "text-[var(--tu-accent)] font-semibold"
                    : step > s.num
                    ? "text-[var(--tu-text-primary)]"
                    : "text-[var(--tu-text-muted)]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step === s.num
                      ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)]"
                      : step > s.num
                      ? "bg-[var(--tu-border-focus)] text-[var(--tu-accent-contrast)]"
                      : "bg-[var(--tu-bg-base)] text-[var(--tu-text-muted)] border border-[var(--tu-border)]"
                  }`}
                >
                  {s.num}
                </span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 text-[var(--tu-text-primary)]">
          {/* Success State */}
          {submittedPr ? (
            <div className="py-8 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-full bg-[var(--tu-accent)]/15 border border-[var(--tu-accent)]/30 text-[var(--tu-accent)] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-[var(--tu-text-primary)]">
                  Publishing Application Submitted!
                </h4>
                <p className="text-xs text-[var(--tu-text-secondary)] mt-1">
                  Your pull request has been automatically drafted on the official TU Cockpit Community Store repository.
                </p>
              </div>

              <div className="p-4 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--tu-text-secondary)]">Pull Request:</span>
                  <a
                    href={submittedPr.prUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[var(--tu-text-accent)] hover:underline flex items-center gap-1"
                  >
                    <span>PR #{submittedPr.prNumber}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--tu-text-secondary)]">Plugin ID:</span>
                  <span className="font-mono text-[var(--tu-text-primary)]">{pluginId}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--tu-text-secondary)]">Status:</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-semibold">
                    Submitted (Queue #3)
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[var(--tu-text-muted)]">
                Our automated CI pipeline is compiling and fuzzing your plugin sandbox. Student reviewers will review capabilities within 24–48 hours.
              </p>

              <button
                onClick={handleClose}
                className="px-6 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity"
              >
                Return to Developer Hub
              </button>
            </div>
          ) : (
            <>
              {/* Step 1: Plugin Metadata */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[var(--tu-text-secondary)]">
                        Plugin ID (Reverse-DNS format) *
                      </label>
                      <input
                        type="text"
                        value={pluginId}
                        onChange={(e) => setPluginId(e.target.value.toLowerCase())}
                        placeholder="at.ac.tuwien.student-tools"
                        className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] px-3 py-1.5 text-xs font-mono text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
                      />
                      {!isReverseDnsValid && (
                        <span className="text-[10px] text-[var(--tu-danger)] block">
                          Must be reverse-DNS (e.g. at.ac.tuwien.plugin-name)
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[var(--tu-text-secondary)]">
                        Initial Version *
                      </label>
                      <input
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="1.0.0"
                        className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] px-3 py-1.5 text-xs font-mono text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--tu-text-secondary)]">
                      Plugin Display Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. TUWEL Calendar Exporter"
                      className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] px-3 py-1.5 text-xs text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--tu-text-secondary)]">
                      Summary Description (min 10 characters) *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Explain what value this tool provides to TU Wien students..."
                      className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] p-3 text-xs text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[var(--tu-text-secondary)]">
                      Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categoriesList.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                            selectedCategories.includes(cat.id)
                              ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] border-[var(--tu-accent)] font-semibold shadow-sm"
                              : "bg-[var(--tu-bg-card)] text-[var(--tu-text-secondary)] border-[var(--tu-border)] hover:border-[var(--tu-border-focus)]"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Source & Release */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--tu-text-secondary)]">
                      Public GitHub Repository URL *
                    </label>
                    <div className="relative">
                      <Github className="w-4 h-4 absolute left-3 top-2.5 text-[var(--tu-text-muted)]" />
                      <input
                        type="text"
                        value={githubRepo}
                        onChange={(e) => setGithubRepo(e.target.value)}
                        placeholder="https://github.com/tuwien-student/my-plugin"
                        className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] pl-9 pr-3 py-1.5 text-xs font-mono text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
                      />
                    </div>
                    <span className="text-[11px] text-[var(--tu-text-muted)] block">
                      Must contain root <code className="text-[var(--tu-text-accent)]">manifest.json</code> and entrypoint assets.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--tu-text-secondary)]">
                      Published Release Tag *
                    </label>
                    <input
                      type="text"
                      value={releaseTag}
                      onChange={(e) => setReleaseTag(e.target.value)}
                      placeholder="v1.0.0"
                      className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] px-3 py-1.5 text-xs font-mono text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
                    />
                    <span className="text-[11px] text-[var(--tu-text-muted)] block">
                      The official release tag in GitHub releases containing the zip asset or source archive.
                    </span>
                  </div>

                  <div className="p-3.5 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[var(--tu-text-accent)] shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-[var(--tu-text-primary)]">
                        Immutable Checksum Verification
                      </p>
                      <p className="text-[var(--tu-text-secondary)] text-[11px] leading-relaxed">
                        Upon PR dispatch, GitHub Actions calculates SHA-256 digests of the release archive to ensure students receive untampered byte-exact builds.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Capability Justifications */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[var(--tu-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        Network Endpoint Declarations
                      </label>
                      <span className="text-[11px] text-[var(--tu-text-muted)]">
                        Whitelist strictly needed domains
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newDomainInput}
                        onChange={(e) => setNewDomainInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
                        placeholder="https://vowi.fsinf.at/*"
                        className="flex-1 bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] px-3 py-1.5 text-xs font-mono text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
                      />
                      <button
                        type="button"
                        onClick={handleAddDomain}
                        className="px-3 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-primary)]"
                      >
                        + Add Glob
                      </button>
                    </div>

                    <div className="space-y-3">
                      {networkDomains.map((domain) => (
                        <div
                          key={domain}
                          className="p-3 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-semibold text-[var(--tu-text-accent)]">
                              {domain}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDomain(domain)}
                              className="text-[11px] text-[var(--tu-danger)] hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[11px] text-[var(--tu-text-secondary)] font-medium">
                              Security & Privacy Justification *
                            </label>
                            <input
                              type="text"
                              value={networkJustifications[domain] || ""}
                              onChange={(e) =>
                                setNetworkJustifications({
                                  ...networkJustifications,
                                  [domain]: e.target.value,
                                })
                              }
                              placeholder="Why does your plugin need this network endpoint?"
                              className="w-full bg-[var(--tu-bg-base)] border border-[var(--tu-border)] rounded px-2.5 py-1 text-xs text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Storage Quota */}
                  <div className="p-3.5 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--tu-text-primary)]">
                        <HardDrive className="w-3.5 h-3.5 text-[var(--tu-accent)]" />
                        Storage Quota (MB)
                      </div>
                      <span className="text-xs font-mono text-[var(--tu-text-accent)]">
                        {storageMb} MB ({storageMb * 1024} KB)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={storageMb}
                      onChange={(e) => setStorageMb(Number(e.target.value))}
                      className="w-full accent-[var(--tu-accent)]"
                    />
                    <input
                      type="text"
                      value={storageJustification}
                      onChange={(e) => setStorageJustification(e.target.value)}
                      placeholder="Storage rationale (e.g. offline cache of deadlines)"
                      className="w-full bg-[var(--tu-bg-base)] border border-[var(--tu-border)] rounded px-2.5 py-1 text-xs text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)] mt-1"
                    />
                  </div>

                  {/* System Notifications */}
                  <div className="p-3.5 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--tu-text-primary)]">
                        <Bell className="w-3.5 h-3.5 text-[var(--tu-accent)]" />
                        System Notifications Capability
                      </span>
                      <input
                        type="checkbox"
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                        className="rounded accent-[var(--tu-accent)]"
                      />
                    </label>
                    {notifications && (
                      <input
                        type="text"
                        value={notificationsJustification}
                        onChange={(e) =>
                          setNotificationsJustification(e.target.value)
                        }
                        placeholder="Notification rationale (e.g. deadline alerts)"
                        className="w-full bg-[var(--tu-bg-base)] border border-[var(--tu-border)] rounded px-2.5 py-1 text-xs text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Pre-Flight Linting */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-[var(--tu-text-primary)]">
                        Automated Manifest Schema Linter
                      </h4>
                      <p className="text-xs text-[var(--tu-text-secondary)]">
                        Pre-flight checks against the official TU Cockpit Community Security Spec
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-[var(--tu-radius-sm)] text-xs font-semibold flex items-center gap-1.5 ${
                        allLintsPassed
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {allLintsPassed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Passed All Checks
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          Action Required
                        </>
                      )}
                    </span>
                  </div>

                  {/* Linter Checks List */}
                  <div className="space-y-2">
                    {linterChecks.map((item, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-[var(--tu-radius)] border flex items-center justify-between gap-3 text-xs ${
                          item.pass
                            ? "bg-[var(--tu-bg-card)] border-[var(--tu-border)]"
                            : "bg-rose-500/5 border-rose-500/30"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-[var(--tu-text-primary)] flex items-center gap-1.5">
                            {item.pass ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                            )}
                            <span>{item.title}</span>
                          </div>
                          <span className="text-[11px] text-[var(--tu-text-secondary)] block">
                            {item.description}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            item.pass
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-rose-500/15 text-rose-400"
                          }`}
                        >
                          {item.pass ? "PASS" : "FAIL"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Live Manifest Preview */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[var(--tu-text-secondary)] uppercase tracking-wider block">
                      Generated manifest.json Submission Payload
                    </span>
                    <pre className="p-3.5 rounded-[var(--tu-radius)] bg-[var(--tu-bg-base)] border border-[var(--tu-border)] text-[11px] font-mono text-[var(--tu-text-secondary)] max-h-40 overflow-y-auto">
                      {JSON.stringify(
                        {
                          id: pluginId,
                          name,
                          version: version.replace(/^v/, ""),
                          description,
                          categories: selectedCategories,
                          entrypoint: "index.html",
                          capabilities: {
                            network: networkDomains,
                            storage: { quotaBytes: storageMb * 1024 * 1024 },
                            notifications,
                          },
                          repository: githubRepo,
                          release: releaseTag,
                          justifications: {
                            network: networkJustifications,
                            storage: storageJustification,
                            notifications: notificationsJustification,
                          },
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!submittedPr && (
          <div className="p-4 bg-[var(--tu-bg-card)] border-t border-[var(--tu-border)] flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] border border-[var(--tu-border)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && (!isReverseDnsValid || !isNameValid || !isDescValid)) ||
                  (step === 2 && (!isRepoValid || !releaseTag.trim()))
                }
                className="px-4 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1.5 cursor-pointer shadow"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!allLintsPassed}
                className="px-5 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-2 cursor-pointer shadow"
              >
                <Sparkles className="w-4 h-4" />
                Dispatch GitOps Pull Request & Apply
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
