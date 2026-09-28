(function () {
  "use strict";

  const STORAGE_KEY = "wireframe-ai-project-v1";
  const FORMAT_LABELS = {
    landing: "Landing page",
    dashboard: "Dashboard",
    mobile: "Mobile app",
  };
  const PALETTES = ["cobalt", "coral", "forest"];
  const EXAMPLE_BRIEF =
    "A calm analytics dashboard for a sustainable energy startup. Show live production, carbon savings, system health, and recent alerts.";

  const BLOCK_LIBRARY = {
    nav: {
      label: "Navigation",
      icon: "NAV",
      description: "Logo, links, and action",
    },
    hero: {
      label: "Hero",
      icon: "H1",
      description: "Headline and product visual",
    },
    logos: {
      label: "Logo cloud",
      icon: "•••",
      description: "Customer or partner proof",
    },
    features: {
      label: "Feature grid",
      icon: "3×",
      description: "Three product benefits",
    },
    stats: { label: "Metrics", icon: "%", description: "Four outcome numbers" },
    testimonials: {
      label: "Testimonials",
      icon: "“”,",
      description: "Customer quotes",
    },
    cta: {
      label: "Call to action",
      icon: "→",
      description: "Focused conversion block",
    },
    footer: {
      label: "Footer",
      icon: "—",
      description: "Utility links and legal",
    },
    sidebar: {
      label: "Sidebar",
      icon: "▥",
      description: "Primary dashboard nav",
    },
    topbar: {
      label: "Top bar",
      icon: "⌕",
      description: "Title, search, and profile",
    },
    overview: {
      label: "Overview",
      icon: "H2",
      description: "Context and date range",
    },
    kpis: {
      label: "KPI cards",
      icon: "4×",
      description: "High-level performance",
    },
    chart: {
      label: "Trend chart",
      icon: "⌁",
      description: "Time series visual",
    },
    table: {
      label: "Data table",
      icon: "≡",
      description: "Structured records",
    },
    activity: {
      label: "Activity",
      icon: "⋮",
      description: "Recent event stream",
    },
    status: {
      label: "Status bar",
      icon: "··",
      description: "Mobile system status",
    },
    mobileHeader: {
      label: "App header",
      icon: "Hi",
      description: "Greeting and avatar",
    },
    balance: {
      label: "Summary card",
      icon: "$",
      description: "Primary value card",
    },
    quickActions: {
      label: "Quick actions",
      icon: "+",
      description: "Four common actions",
    },
    mobileChart: {
      label: "Progress chart",
      icon: "▥",
      description: "Compact visual summary",
    },
    transactions: {
      label: "Recent items",
      icon: "≡",
      description: "Mobile activity list",
    },
    mobileNav: {
      label: "Tab bar",
      icon: "⌂",
      description: "Bottom navigation",
    },
  };

  const DOM = {
    addDialog: document.getElementById("addDialog"),
    artboard: document.getElementById("artboard"),
    artboardWrap: document.getElementById("artboardWrap"),
    blockAction: document.getElementById("blockAction"),
    blockBody: document.getElementById("blockBody"),
    blockEyebrow: document.getElementById("blockEyebrow"),
    blockHeading: document.getElementById("blockHeading"),
    blockLabel: document.getElementById("blockLabel"),
    blockLibrary: document.getElementById("blockLibrary"),
    briefInput: document.getElementById("briefInput"),
    componentTree: document.getElementById("componentTree"),
    densityControl: document.getElementById("densityControl"),
    densityValue: document.getElementById("densityValue"),
    emptyGenerate: document.getElementById("emptyGenerate"),
    emptyState: document.getElementById("emptyState"),
    exportMenu: document.getElementById("exportMenu"),
    exportMenuButton: document.getElementById("exportMenuButton"),
    formatLabel: document.getElementById("formatLabel"),
    generateButton: document.getElementById("generateButton"),
    inspectorContent: document.getElementById("inspectorContent"),
    inspectorEmpty: document.getElementById("inspectorEmpty"),
    newProjectDialog: document.getElementById("newProjectDialog"),
    previewSlug: document.getElementById("previewSlug"),
    projectName: document.getElementById("projectName"),
    promptCount: document.getElementById("promptCount"),
    saveState: document.getElementById("saveState"),
    selectedTitle: document.getElementById("selectedTitle"),
    selectedType: document.getElementById("selectedType"),
    selectionBreadcrumb: document.getElementById("selectionBreadcrumb"),
    stage: document.getElementById("stage"),
    toast: document.getElementById("toast"),
    toastIcon: document.getElementById("toastIcon"),
    toastMessage: document.getElementById("toastMessage"),
    variantNumber: document.getElementById("variantNumber"),
    wireframeCanvas: document.getElementById("wireframeCanvas"),
    zoomValue: document.getElementById("zoomValue"),
  };

  let saveTimer = 0;
  let toastTimer = 0;
  let draggedId = null;
  let state = loadState() || createInitialState();

  function uid(type) {
    return `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }

  function block(type, content, options) {
    const meta = BLOCK_LIBRARY[type] || { label: "Section" };
    return {
      id: uid(type),
      type,
      label: meta.label,
      eyebrow: content.eyebrow || "",
      heading: content.heading || "",
      body: content.body || "",
      action: content.action || "",
      align: (options && options.align) || "left",
      emphasis: (options && options.emphasis) || "normal",
      density: (options && options.density) || 3,
      hidden: false,
    };
  }

  function createInitialState() {
    const initial = {
      version: 1,
      name: "Solis energy overview",
      brief: EXAMPLE_BRIEF,
      format: "dashboard",
      device: "desktop",
      theme: "cobalt",
      zoom: 0.72,
      variant: 1,
      selectedId: null,
      generated: true,
      components: [],
    };
    initial.components = buildBlueprint(
      initial.format,
      initial.brief,
      initial.variant,
    );
    return initial;
  }

  function defaultEmptyState() {
    return {
      version: 1,
      name: "Untitled workspace",
      brief: "",
      format: "dashboard",
      device: "desktop",
      theme: "cobalt",
      zoom: 0.82,
      variant: 1,
      selectedId: null,
      generated: false,
      components: [],
    };
  }

  function loadState() {
    try {
      const stored = JSON.parse(WorkspaceStorage.getItem(STORAGE_KEY));
      if (!stored || stored.version !== 1 || !Array.isArray(stored.components))
        return null;
      return { ...defaultEmptyState(), ...stored };
    } catch (error) {
      return null;
    }
  }

  function saveState(showStatus) {
    DOM.saveState.classList.add("is-saving");
    DOM.saveState.lastChild.textContent = " Saving…";
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      try {
        WorkspaceStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        DOM.saveState.classList.remove("is-saving");
        DOM.saveState.lastChild.textContent = WorkspaceStorage.persistent
          ? " Saved locally"
          : " Session only";
        if (showStatus)
          showToast(
            WorkspaceStorage.persistent
              ? "Saved in this browser"
              : "Session only — export before closing",
            "✓",
          );
      } catch (error) {
        DOM.saveState.classList.remove("is-saving");
        DOM.saveState.lastChild.textContent = " Could not save";
      }
    }, 220);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function slugify(value) {
    return (
      String(value || "workspace")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 32) || "workspace"
    );
  }

  function titleCase(value) {
    return String(value)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 4)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  function parseBrief(brief) {
    const text = brief.toLowerCase();
    let domain = "product";
    if (/energy|solar|carbon|climate|sustainab/.test(text)) domain = "energy";
    else if (/financ|invoice|expense|money|bank|cash|tax/.test(text))
      domain = "finance";
    else if (/habit|wellness|fitness|health|coach/.test(text)) domain = "habit";
    else if (/logistic|fleet|deliver|route|operations/.test(text))
      domain = "logistics";
    else if (/ai|research|agent|automation/.test(text)) domain = "ai";

    const names = {
      energy: "Solis",
      finance: "Ledgerly",
      habit: "Morrow",
      logistics: "Northline",
      ai: "Thread",
      product: "Northstar",
    };
    const data = {
      energy: {
        name: names.energy,
        eyebrow: "Clean intelligence, in real time",
        heading: "See the energy future taking shape.",
        body: "Bring production, system health, and environmental impact into one calm operating view.",
        action: "Explore live data",
        metric: "1.84 GWh",
        metricLabel: "clean energy generated",
        features: ["Live production", "Carbon accounting", "Proactive alerts"],
        stats: ["1.84G", "92%", "−38%", "24/7"],
      },
      finance: {
        name: names.finance,
        eyebrow: "Money clarity for independents",
        heading: "Know what your business can do next.",
        body: "Cash flow, invoices, expenses, and tax dates finally share one thoughtful workspace.",
        action: "Open your workspace",
        metric: "$48,290",
        metricLabel: "available balance",
        features: ["Cash flow forecast", "Smart invoicing", "Tax readiness"],
        stats: ["$48k", "+18%", "12", "4.2h"],
      },
      habit: {
        name: names.habit,
        eyebrow: "Small steps, visible momentum",
        heading: "Build a rhythm that actually feels like yours.",
        body: "Gentle check-ins and clear weekly patterns make consistency easier to see and sustain.",
        action: "Start a seven-day reset",
        metric: "18 days",
        metricLabel: "current momentum",
        features: [
          "One-tap check-ins",
          "Weekly reflections",
          "Flexible streaks",
        ],
        stats: ["18d", "86%", "+3", "6wk"],
      },
      logistics: {
        name: names.logistics,
        eyebrow: "Every route, one clear signal",
        heading: "Keep the entire operation moving.",
        body: "Monitor fleet health, delivery performance, and exceptions before they become delays.",
        action: "View operations",
        metric: "98.4%",
        metricLabel: "on-time delivery",
        features: ["Fleet health", "Route intelligence", "Exception control"],
        stats: ["98.4%", "−12m", "248", "31"],
      },
      ai: {
        name: names.ai,
        eyebrow: "Research without the busywork",
        heading: "Move from scattered questions to clear decisions.",
        body: "A focused AI workspace that gathers evidence, maps themes, and keeps every source close.",
        action: "Join the early access",
        metric: "12.6h",
        metricLabel: "saved this week",
        features: ["Source synthesis", "Research trails", "Shared decisions"],
        stats: ["12.6h", "94%", "3.8×", "1 view"],
      },
      product: {
        name: names.product,
        eyebrow: "A better way to move work forward",
        heading: "Turn complexity into confident momentum.",
        body: "One focused workspace gives your team the context, signals, and next steps that matter.",
        action: "Start exploring",
        metric: "+34%",
        metricLabel: "weekly momentum",
        features: ["Clear priorities", "Live signals", "Shared context"],
        stats: ["34%", "2.4×", "18h", "99.9%"],
      },
    }[domain];

    const quoted = brief.match(/[“\"]([^”\"]{2,28})[”\"]/);
    if (quoted) data.name = titleCase(quoted[1]);
    return { ...data, domain };
  }

  function buildBlueprint(format, brief, variant) {
    const d = parseBrief(brief || EXAMPLE_BRIEF);
    const even = variant % 2 === 0;
    if (format === "landing") {
      const items = [
        block(
          "nav",
          { heading: d.name, action: even ? "Book a demo" : "Get started" },
          { density: 2 },
        ),
        block(
          "hero",
          {
            eyebrow: d.eyebrow,
            heading: d.heading,
            body: d.body,
            action: d.action,
          },
          {
            align: even ? "center" : "left",
            emphasis: even ? "strong" : "normal",
            density: even ? 4 : 3,
          },
        ),
        block(
          "logos",
          {
            eyebrow: "TRUSTED BY TEAMS AT",
            heading: "Teams moving with clarity",
          },
          { density: 2 },
        ),
        block(
          "features",
          {
            eyebrow: "BUILT FOR MOMENTUM",
            heading: "Everything important, finally connected.",
            body: d.features.join(" · "),
            action: "Explore the platform",
          },
          { density: 3 },
        ),
        block(
          "stats",
          { heading: "Outcomes you can see", body: d.stats.join(" · ") },
          { density: 2 },
        ),
        block(
          "testimonials",
          {
            eyebrow: "CUSTOMER STORIES",
            heading: "Less chasing. More meaningful work.",
            body: "Real teams use one shared view to make faster, calmer decisions.",
          },
          { density: 3 },
        ),
        block(
          "cta",
          {
            eyebrow: "START TODAY",
            heading: "Give the next good idea room to move.",
            body: "Set up your first workspace in minutes.",
            action: even ? "See it in action" : "Get started free",
          },
          { density: 3, emphasis: "strong" },
        ),
        block(
          "footer",
          { heading: d.name, body: `© 2026 ${d.name}. Built with intention.` },
          { density: 2 },
        ),
      ];
      if (variant % 3 === 0) [items[2], items[3]] = [items[3], items[2]];
      return items;
    }

    if (format === "mobile") {
      return [
        block(
          "status",
          { heading: "9:41", body: "signal · wifi · battery" },
          { density: 1 },
        ),
        block(
          "mobileHeader",
          {
            eyebrow: even ? "YOUR WEEK" : "GOOD MORNING",
            heading: even
              ? "Keep the rhythm going"
              : `Welcome back to ${d.name}`,
            action: "Profile",
          },
          { density: 2 },
        ),
        block(
          "balance",
          {
            eyebrow: d.metricLabel,
            heading: d.metric,
            body: even ? "+8.6% from last week" : "A healthy trend this month",
            action: "View details",
          },
          { density: 3, emphasis: "strong" },
        ),
        block(
          "quickActions",
          { heading: "Quick actions", body: d.features.join(" · ") },
          { density: 2 },
        ),
        block(
          "mobileChart",
          {
            eyebrow: "LAST 7 DAYS",
            heading: even ? "Weekly rhythm" : "Progress overview",
            body: "A simple view of recent activity",
          },
          { density: 3 },
        ),
        block(
          "transactions",
          {
            heading: even ? "Latest updates" : "Recent activity",
            body: "Review all activity",
            action: "See all",
          },
          { density: 3 },
        ),
        block(
          "mobileNav",
          { heading: "Home · Insights · Plan · You" },
          { density: 1 },
        ),
      ];
    }

    return [
      block(
        "sidebar",
        {
          heading: d.name,
          body: "Overview · Analytics · Activity · Reports · Team",
          action: d.metric,
        },
        { density: 3 },
      ),
      block(
        "topbar",
        {
          heading: even ? `${d.name} command center` : "Performance overview",
          body: "Search anything…",
          action: "Profile",
        },
        { density: 2 },
      ),
      block(
        "overview",
        {
          eyebrow: "MONDAY, 21 SEPTEMBER",
          heading: even
            ? "The signals that need you."
            : "Here’s what is happening today.",
          body: d.body,
          action: "Last 30 days",
        },
        { density: 2 },
      ),
      block(
        "kpis",
        {
          heading: "Key performance",
          body: `${d.metric} · ${d.stats.join(" · ")}`,
          action: "+12.4% this period",
        },
        { density: 3 },
      ),
      block(
        "chart",
        {
          eyebrow: "PERFORMANCE",
          heading: even ? "Weekly movement" : "Growth trend",
          body: "Compared with previous period",
          action: "View report",
        },
        { density: 3 },
      ),
      block(
        "table",
        {
          heading: even ? "Priority records" : "Recent performance",
          body: d.features.join(" · "),
          action: "View all",
        },
        { density: 3 },
      ),
      block(
        "activity",
        {
          heading: "Live activity",
          body: "Signals and changes from across your workspace",
          action: "Open feed",
        },
        { density: 3 },
      ),
      block(
        "footer",
        {
          heading: d.name,
          body: "Data refreshed just now · All systems operational",
        },
        { density: 1 },
      ),
    ];
  }

  function blockAttrs(item) {
    return `data-id="${escapeHtml(item.id)}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button" aria-label="Select ${escapeHtml(item.label)}"`;
  }

  function renderBlock(item) {
    const h = escapeHtml(item.heading);
    const b = escapeHtml(item.body);
    const e = escapeHtml(item.eyebrow);
    const a = escapeHtml(item.action);
    const d = parseBrief(state.brief || EXAMPLE_BRIEF);
    const parts = b.split(" · ").filter(Boolean);
    const attrs = blockAttrs(item);

    switch (item.type) {
      case "nav":
        return `<header ${attrs} class="wf-block wf-nav${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button" aria-label="Select ${escapeHtml(item.label)}"><span class="wf-logo"><i></i>${h}</span><div class="wf-links"><span>Product</span><span>Stories</span><span>About</span><b class="wf-button">${a}</b></div></header>`;
      case "hero":
        return `<section ${attrs} class="wf-block wf-hero${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button" aria-label="Select ${escapeHtml(item.label)}"><div><span class="wf-kicker">${e}</span><h1>${h}</h1><p>${b}</p><div class="wf-actions"><b class="wf-button">${a}</b><b class="wf-button outline">See how it works</b></div></div><div class="wf-visual"><div class="wf-visual-card"><div class="mini-header"><span class="mini-label"></span><span class="mini-dots">•••</span></div><div class="mini-number">${escapeHtml(d.metric)}</div><span class="mini-note">${escapeHtml(d.metricLabel)}</span><div class="mini-chart"><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div></section>`;
      case "logos":
        return `<section ${attrs} class="wf-block wf-logos${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><span>APERTURE</span><span>North / Co</span><span>HALO</span><span>Layers</span><span>MONUMENT</span></section>`;
      case "features": {
        const features = parts.length ? parts : d.features;
        return `<section ${attrs} class="wf-block wf-features${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><div class="wf-section-heading"><span class="wf-kicker">${e}</span><h2>${h}</h2><p>${a || "A considered toolkit for clearer work."}</p></div><div class="wf-feature-grid">${features
          .slice(0, 3)
          .map(
            (feature, index) =>
              `<article class="wf-feature-card"><span class="wf-feature-icon">0${index + 1}</span><strong>${escapeHtml(feature)}</strong><p>${["See the right signal at exactly the right time.", "Keep decisions and context together by default.", "Move forward without adding more busywork."][index]}</p></article>`,
          )
          .join("")}</div></section>`;
      }
      case "stats": {
        const values = parts.length ? parts : d.stats;
        return `<section ${attrs} class="wf-block wf-stats${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><div class="wf-stat-grid">${values
          .slice(0, 4)
          .map(
            (value, index) =>
              `<div class="wf-stat"><strong>${escapeHtml(value)}</strong><span>${["measurable lift", "team confidence", "less admin", "always available"][index]}</span></div>`,
          )
          .join("")}</div></section>`;
      }
      case "testimonials":
        return `<section ${attrs} class="wf-block wf-testimonials${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><div class="wf-section-heading"><span class="wf-kicker">${e}</span><h2>${h}</h2><p>${b}</p></div><div class="wf-testimonial-grid">${["The whole team sees the same story now.", "We replaced three rituals with one clear view.", "It feels like the product understands our day."].map((quote, index) => `<article class="wf-quote-card"><p>“${quote}”</p><div class="wf-avatar"><i></i><span><strong>${["Maya Chen", "Noah Williams", "Ava Singh"][index]}</strong>${["Product lead", "Operations director", "Founder"][index]}</span></div></article>`).join("")}</div></section>`;
      case "cta":
        return `<section ${attrs} class="wf-block wf-cta${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><div><span class="wf-kicker">${e}</span><h2>${h}</h2><p>${b}</p></div><b class="wf-button">${a}</b></section>`;
      case "footer":
        return `<footer ${attrs} class="wf-block wf-footer${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><strong>${h}</strong><span>${b}</span><span>Privacy&nbsp;&nbsp; Terms&nbsp;&nbsp; Contact</span></footer>`;
      case "sidebar":
        return `<aside ${attrs} class="wf-block wf-sidebar${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><span class="wf-logo"><i></i>${h}</span><div class="wf-side-links">${b
          .split(" · ")
          .map((link) => `<span>${escapeHtml(link)}</span>`)
          .join(
            "",
          )}</div><div class="wf-side-card"><span>Primary metric</span><strong>${a}</strong></div></aside>`;
      case "topbar":
        return `<header ${attrs} class="wf-block wf-topbar${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><h1>${h}</h1><div class="wf-top-actions"><span class="wf-search">⌕&nbsp;&nbsp; ${b}</span><i class="wf-user"></i></div></header>`;
      case "overview":
        return `<section ${attrs} class="wf-block wf-dash-section${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><div class="wf-dash-heading"><div><span class="wf-kicker">${e}</span><h2>${h}</h2><p>${b}</p></div><span class="wf-date">${a}⌄</span></div></section>`;
      case "kpis": {
        const values = parts.length ? parts : [d.metric, ...d.stats];
        return `<section ${attrs} class="wf-block wf-dash-section${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><div class="wf-kpi-grid">${values
          .slice(0, 4)
          .map(
            (value, index) =>
              `<article class="wf-kpi"><span>${["Primary metric", "Efficiency", "Momentum", "Open items"][index]}</span><strong>${escapeHtml(value)}</strong><small>${index === 3 ? "3 need attention" : a}</small></article>`,
          )
          .join("")}</div></section>`;
      }
      case "chart":
        return `<section ${attrs} class="wf-block wf-dash-section${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><article class="wf-chart-card"><div class="wf-chart-head"><div><strong>${h}</strong><br><span>${b}</span></div><span>${a} →</span></div><div class="wf-line-chart"><svg viewBox="0 0 600 150" preserveAspectRatio="none" aria-hidden="true"><path class="fill" d="M0 126 C60 115 78 90 130 102 S220 42 280 75 S370 95 430 43 S520 55 600 12 L600 150 L0 150Z"/><path d="M0 126 C60 115 78 90 130 102 S220 42 280 75 S370 95 430 43 S520 55 600 12"/></svg></div></article></section>`;
      case "table": {
        const labels = parts.length ? parts : d.features;
        return `<section ${attrs} class="wf-block wf-dash-section${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><article class="wf-table-card"><div class="wf-table-head"><strong>${h}</strong><span class="wf-button outline">${a}</span></div>${[0, 1, 2, 3].map((_, index) => `<div class="wf-table-row"><b>${escapeHtml(labels[index % labels.length])}</b><span>${["Today, 09:42", "Yesterday", "18 Sep", "16 Sep"][index]}</span><span>${["Workspace", "Automated", "Review", "Report"][index]}</span><span class="wf-status">${index === 2 ? "REVIEW" : "HEALTHY"}</span></div>`).join("")}</article></section>`;
      }
      case "activity":
        return `<section ${attrs} class="wf-block wf-dash-section${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><article class="wf-activity"><strong>${h}</strong>${["New signal crossed its target", "Weekly report is ready", "Three records were updated"].map((line, index) => `<div class="wf-activity-item"><i></i><div><b>${line}</b><span>${index * 12 + 2} minutes ago</span></div></div>`).join("")}</article></section>`;
      case "status":
        return `<div ${attrs} class="wf-block wf-mobile-status${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><span>${h}</span><span>● ◒ ▰</span></div>`;
      case "mobileHeader":
        return `<header ${attrs} class="wf-block wf-mobile-header${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><div><small>${e}</small><h1>${h}</h1></div><i class="wf-avatar-button"></i></header>`;
      case "balance":
        return `<section ${attrs} class="wf-block wf-balance${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><span>${e}</span><strong>${h}</strong><small>${b}</small></section>`;
      case "quickActions": {
        const actions = parts.length ? parts : d.features;
        return `<section ${attrs} class="wf-block wf-quick-actions${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button">${["＋", "↗", "⌁", "•••"].map((icon, index) => `<div class="wf-quick"><i>${icon}</i>${escapeHtml(actions[index % actions.length])}</div>`).join("")}</section>`;
      }
      case "mobileChart":
        return `<section ${attrs} class="wf-block wf-mobile-section${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><div class="wf-mobile-section-head"><strong>${h}</strong><span>${e}</span></div><div class="wf-mobile-chart"><div class="mini-chart"><i></i><i></i><i></i><i></i><i></i><i></i></div></div></section>`;
      case "transactions":
        return `<section ${attrs} class="wf-block wf-mobile-section${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button"><div class="wf-mobile-section-head"><strong>${h}</strong><span>${a}</span></div>${["Weekly target", "Team update", "Smart reminder"].map((name, index) => `<div class="wf-transaction"><i>${["↗", "◎", "✓"][index]}</i><div><b>${name}</b><span>${["Momentum is up", "A new note arrived", "Completed today"][index]}</span></div><strong>${["+12%", "Now", "09:42"][index]}</strong></div>`).join("")}</section>`;
      case "mobileNav":
        return `<nav ${attrs} class="wf-block wf-mobile-nav${state.selectedId === item.id ? " is-selected" : ""}" data-id="${item.id}" data-layer="${escapeHtml(item.label)}" data-align="${item.align}" data-emphasis="${item.emphasis}" data-density="${item.density}" tabindex="0" role="button">${h
          .split(" · ")
          .map((label) => `<span>${escapeHtml(label)}</span>`)
          .join("")}</nav>`;
      default:
        return `<section ${attrs} class="wf-block${state.selectedId === item.id ? " is-selected" : ""}"><div class="wf-section-heading"><span class="wf-kicker">${e}</span><h2>${h}</h2><p>${b}</p></div></section>`;
    }
  }

  function renderCanvas() {
    DOM.stage.classList.toggle(
      "has-design",
      state.generated && state.components.length > 0,
    );
    DOM.artboard.className = `artboard device-${state.device}`;
    DOM.wireframeCanvas.className = `wireframe theme-${state.theme}`;
    DOM.artboardWrap.style.transform = `scale(${state.zoom})`;
    DOM.formatLabel.textContent = FORMAT_LABELS[state.format];
    DOM.variantNumber.textContent = `V${state.variant}`;
    DOM.zoomValue.textContent = `${Math.round(state.zoom * 100)}%`;
    DOM.previewSlug.textContent = slugify(state.name);

    const visible = state.components.filter((item) => !item.hidden);
    const rendered = visible.map(renderBlock).join("");
    if (state.format === "dashboard")
      DOM.wireframeCanvas.innerHTML = `<div class="wf-dashboard">${rendered}</div>`;
    else if (state.format === "mobile")
      DOM.wireframeCanvas.innerHTML = `<div class="wf-mobile-shell">${rendered}</div>`;
    else DOM.wireframeCanvas.innerHTML = rendered;
  }

  function renderTree() {
    DOM.componentTree.innerHTML = state.components
      .map((item) => {
        const meta = BLOCK_LIBRARY[item.type] || { icon: "□" };
        return `<li class="tree-item${state.selectedId === item.id ? " is-selected" : ""}${item.hidden ? " is-hidden" : ""}" draggable="true" data-id="${escapeHtml(item.id)}"><span class="drag-handle" aria-hidden="true">⠿</span><span class="tree-icon">${escapeHtml(meta.icon)}</span><button type="button" class="tree-label" data-select-id="${escapeHtml(item.id)}">${escapeHtml(item.label)}</button><button type="button" class="visibility-toggle" data-visibility-id="${escapeHtml(item.id)}" aria-label="${item.hidden ? "Show" : "Hide"} ${escapeHtml(item.label)}"><svg viewBox="0 0 20 20" aria-hidden="true">${item.hidden ? '<path d="m3 3 14 14M8.3 5.2A8.7 8.7 0 0 1 10 5c5 0 8 5 8 5a14 14 0 0 1-2.1 2.7M12.2 14.7A8.8 8.8 0 0 1 10 15c-5 0-8-5-8-5a13.7 13.7 0 0 1 2.3-2.8"/>' : '<path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z"/><circle cx="10" cy="10" r="2.4"/>'}</svg></button></li>`;
      })
      .join("");
  }

  function selectedBlock() {
    return (
      state.components.find((item) => item.id === state.selectedId) || null
    );
  }

  function renderInspector() {
    const item = selectedBlock();
    DOM.inspectorEmpty.hidden = Boolean(item);
    DOM.inspectorContent.hidden = !item;
    if (!item) {
      DOM.selectionBreadcrumb.textContent = "Overview";
      return;
    }

    DOM.selectedType.textContent = item.type
      .replace(/([A-Z])/g, " $1")
      .toUpperCase();
    DOM.selectedTitle.textContent = item.label;
    DOM.selectionBreadcrumb.textContent = item.label;
    DOM.blockLabel.value = item.label;
    DOM.blockEyebrow.value = item.eyebrow;
    DOM.blockHeading.value = item.heading;
    DOM.blockBody.value = item.body;
    DOM.blockAction.value = item.action;
    DOM.densityControl.value = item.density;
    DOM.densityValue.textContent = item.density;
    document
      .querySelectorAll("[data-align]")
      .forEach((button) =>
        button.classList.toggle(
          "is-active",
          button.dataset.align === item.align,
        ),
      );
    document
      .querySelectorAll("[data-emphasis]")
      .forEach((button) =>
        button.classList.toggle(
          "is-active",
          button.dataset.emphasis === item.emphasis,
        ),
      );
    document
      .querySelectorAll("[data-theme]")
      .forEach((button) =>
        button.classList.toggle(
          "is-active",
          button.dataset.theme === state.theme,
        ),
      );
  }

  function renderControls() {
    DOM.briefInput.value = state.brief;
    DOM.promptCount.textContent = state.brief.length;
    DOM.projectName.textContent = state.name;
    document.querySelectorAll("[data-format]").forEach((button) => {
      const active = button.dataset.format === state.format;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-device]").forEach((button) => {
      const active = button.dataset.device === state.device;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function renderAll() {
    renderControls();
    renderCanvas();
    renderTree();
    renderInspector();
  }

  function selectBlock(id) {
    if (!state.components.some((item) => item.id === id)) return;
    state.selectedId = id;
    renderCanvas();
    renderTree();
    renderInspector();
    saveState(false);
  }

  function updateSelected(patch) {
    const item = selectedBlock();
    if (!item) return;
    Object.assign(item, patch);
    renderCanvas();
    renderTree();
    DOM.selectedTitle.textContent = item.label;
    DOM.selectionBreadcrumb.textContent = item.label;
    saveState(false);
  }

  function generate() {
    const brief = DOM.briefInput.value.trim() || EXAMPLE_BRIEF;
    state.brief = brief;
    state.variant = 1;
    state.components = buildBlueprint(state.format, brief, state.variant);
    state.generated = true;
    state.selectedId =
      state.components.find((item) =>
        ["hero", "overview", "balance"].includes(item.type),
      )?.id ||
      state.components[0]?.id ||
      null;
    if (state.format === "mobile") {
      state.device = "mobile";
      state.zoom = Math.min(state.zoom, 0.82);
    } else if (state.device === "mobile") {
      state.device = "desktop";
      state.zoom = 0.72;
    }
    const parsed = parseBrief(brief);
    state.name = `${parsed.name} ${state.format === "dashboard" ? "overview" : state.format === "mobile" ? "mobile concept" : "launch concept"}`;
    DOM.generateButton.classList.add("is-generating");
    DOM.generateButton.querySelector("span:nth-child(2)").textContent =
      "Composing layout…";
    window.setTimeout(() => {
      DOM.generateButton.classList.remove("is-generating");
      DOM.generateButton.querySelector("span:nth-child(2)").textContent =
        "Generate wireframe";
      renderAll();
      saveState(false);
      showToast(`${FORMAT_LABELS[state.format]} generated locally`, "✦");
    }, 320);
  }

  function generateVariant() {
    if (!state.generated) return generate();
    state.variant += 1;
    state.components = buildBlueprint(state.format, state.brief, state.variant);
    state.theme = PALETTES[(state.variant - 1) % PALETTES.length];
    state.selectedId =
      state.components.find((item) =>
        ["hero", "overview", "balance"].includes(item.type),
      )?.id || null;
    renderAll();
    saveState(false);
    showToast(`Variant ${state.variant} created`, "↻");
  }

  function moveSelected(direction) {
    const index = state.components.findIndex(
      (item) => item.id === state.selectedId,
    );
    const next = index + direction;
    if (index < 0 || next < 0 || next >= state.components.length) return;
    [state.components[index], state.components[next]] = [
      state.components[next],
      state.components[index],
    ];
    renderCanvas();
    renderTree();
    saveState(false);
  }

  function duplicateSelected() {
    const item = selectedBlock();
    if (!item) return;
    const index = state.components.indexOf(item);
    const copy = { ...item, id: uid(item.type), label: `${item.label} copy` };
    state.components.splice(index + 1, 0, copy);
    state.selectedId = copy.id;
    renderAll();
    saveState(false);
    showToast("Block duplicated", "+");
  }

  function deleteSelected() {
    const index = state.components.findIndex(
      (item) => item.id === state.selectedId,
    );
    if (index < 0) return;
    const removed = state.components[index];
    state.components.splice(index, 1);
    state.selectedId =
      state.components[Math.min(index, state.components.length - 1)]?.id ||
      null;
    renderAll();
    saveState(false);
    showToast(`${removed.label} removed`, "−");
  }

  function toggleVisibility(id) {
    const item = state.components.find((component) => component.id === id);
    if (!item) return;
    item.hidden = !item.hidden;
    renderCanvas();
    renderTree();
    if (state.selectedId === id) renderInspector();
    saveState(false);
  }

  function addBlock(type) {
    const parsed = parseBrief(state.brief || EXAMPLE_BRIEF);
    const presets = {
      nav: { heading: parsed.name, action: "Get started" },
      hero: {
        eyebrow: parsed.eyebrow,
        heading: parsed.heading,
        body: parsed.body,
        action: parsed.action,
      },
      logos: { heading: "Trusted by thoughtful teams" },
      features: {
        eyebrow: "CAPABILITIES",
        heading: "Designed around the work that matters.",
        body: parsed.features.join(" · "),
        action: "Explore all features",
      },
      stats: { heading: "Measurable outcomes", body: parsed.stats.join(" · ") },
      testimonials: {
        eyebrow: "CUSTOMERS",
        heading: "A clearer way to work.",
        body: "Stories from teams moving with confidence.",
      },
      cta: {
        eyebrow: "GET STARTED",
        heading: "Make the next move count.",
        body: "Create your workspace in minutes.",
        action: "Start now",
      },
      footer: { heading: parsed.name, body: `© 2026 ${parsed.name}.` },
      sidebar: {
        heading: parsed.name,
        body: "Overview · Analytics · Activity · Reports · Team",
        action: parsed.metric,
      },
      topbar: { heading: "Workspace overview", body: "Search anything…" },
      overview: {
        eyebrow: "TODAY",
        heading: "Everything that needs your attention.",
        body: parsed.body,
        action: "Last 30 days",
      },
      kpis: {
        heading: "Key performance",
        body: `${parsed.metric} · ${parsed.stats.join(" · ")}`,
        action: "+12.4%",
      },
      chart: {
        eyebrow: "PERFORMANCE",
        heading: "Growth trend",
        body: "Compared with the previous period",
        action: "View report",
      },
      table: {
        heading: "Recent performance",
        body: parsed.features.join(" · "),
        action: "View all",
      },
      activity: {
        heading: "Live activity",
        body: "Signals from across the workspace",
      },
      status: { heading: "9:41", body: "signal · wifi · battery" },
      mobileHeader: {
        eyebrow: "GOOD MORNING",
        heading: `Welcome to ${parsed.name}`,
      },
      balance: {
        eyebrow: parsed.metricLabel,
        heading: parsed.metric,
        body: "+8.6% this week",
      },
      quickActions: {
        heading: "Quick actions",
        body: parsed.features.join(" · "),
      },
      mobileChart: { eyebrow: "LAST 7 DAYS", heading: "Progress overview" },
      transactions: { heading: "Recent activity", action: "See all" },
      mobileNav: { heading: "Home · Insights · Plan · You" },
    };
    const newItem = block(
      type,
      presets[type] || {
        heading: "New section",
        body: "Add supporting content here.",
      },
    );
    const selectedIndex = state.components.findIndex(
      (item) => item.id === state.selectedId,
    );
    state.components.splice(
      selectedIndex >= 0 ? selectedIndex + 1 : state.components.length,
      0,
      newItem,
    );
    state.selectedId = newItem.id;
    state.generated = true;
    DOM.addDialog.close();
    renderAll();
    saveState(false);
    showToast(`${newItem.label} added`, "+");
  }

  function showToast(message, icon) {
    window.clearTimeout(toastTimer);
    DOM.toastMessage.textContent = message;
    DOM.toastIcon.textContent = icon || "✓";
    DOM.toast.hidden = false;
    toastTimer = window.setTimeout(() => {
      DOM.toast.hidden = true;
    }, 2400);
  }

  function downloadFile(filename, contents, mime) {
    const blob = new Blob([contents], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function exportJson() {
    const payload = {
      ...state,
      exportedAt: new Date().toISOString(),
      generator: "Wireframe AI — deterministic local rules",
    };
    downloadFile(
      `${slugify(state.name)}.wireframe.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    );
    closeExportMenu();
    showToast("Wireframe JSON exported", "↓");
  }

  function exportHtml() {
    const exportedPreview = DOM.wireframeCanvas.innerHTML.replaceAll(
      " is-selected",
      "",
    );
    const standalone = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(state.name)}</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f7f7f5;color:#171815;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.export-note{background:#171815;color:#fff;font-size:12px;padding:12px 24px;text-align:center}.wireframe{--a:${state.theme === "coral" ? "#e9503e" : state.theme === "forest" ? "#28785e" : "#3156f4"};max-width:1200px;margin:0 auto;background:#fff;min-height:100vh}.wf-block{padding:40px 6%;border-bottom:1px solid #e4e4df}.wf-block h1{font-size:clamp(38px,7vw,76px);line-height:1;letter-spacing:-.06em;max-width:850px;margin:20px 0}.wf-block h2{font-size:clamp(26px,4vw,44px);letter-spacing:-.04em}.wf-block p{color:#6d716d;line-height:1.65;max-width:680px}.wf-kicker{color:var(--a);font:700 11px ui-monospace;letter-spacing:.14em}.wf-button{display:inline-block;background:var(--a);color:white;padding:12px 18px;border-radius:7px}.wf-links,.wf-actions{display:flex;gap:20px;align-items:center}.wf-nav,.wf-footer,.wf-topbar,.wf-cta{display:flex;align-items:center;justify-content:space-between}.wf-logo{font-weight:800}.wf-logo i{display:inline-block;background:var(--a);height:18px;width:18px;margin-right:8px}.wf-feature-grid,.wf-testimonial-grid,.wf-kpi-grid,.wf-stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}.wf-feature-card,.wf-quote-card,.wf-kpi,.wf-chart-card,.wf-table-card,.wf-activity,.wf-mobile-chart{border:1px solid #e1e2de;border-radius:10px;padding:20px}.wf-visual{background:#f0f2ff;border-radius:14px;min-height:260px;margin-top:30px}.mini-chart{display:flex;align-items:end;gap:7px;height:100px}.mini-chart i{background:var(--a);flex:1}.mini-chart i:nth-child(odd){height:45%}.mini-chart i:nth-child(even){height:80%}.wf-dashboard{display:grid;grid-template-columns:190px 1fr}.wf-sidebar{background:#171815;color:#fff;grid-row:1/20;min-height:100vh}.wf-side-links{display:grid;gap:12px;margin-top:30px}.wf-dash-section{padding:20px 4%}.wf-mobile-shell{max-width:430px;margin:auto}.wf-quick-actions,.wf-mobile-nav{display:flex;justify-content:space-around}.wf-balance{background:#171815;color:white;margin:16px;border-radius:16px}.wf-table-row,.wf-transaction{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:12px;border-top:1px solid #eee;font-size:12px}@media(max-width:700px){.wf-dashboard{display:block}.wf-sidebar{display:none}.wf-nav{gap:20px}.wf-links span{display:none}}
</style></head><body><div class="export-note">Prototype exported from Wireframe AI · Edit this HTML freely</div><main class="wireframe">${exportedPreview}</main></body></html>`;
    downloadFile(`${slugify(state.name)}.html`, standalone, "text/html");
    closeExportMenu();
    showToast("Standalone HTML exported", "↓");
  }

  function closeExportMenu() {
    DOM.exportMenu.hidden = true;
    DOM.exportMenuButton.setAttribute("aria-expanded", "false");
  }

  function populateLibrary() {
    const allowed =
      state.format === "landing"
        ? [
            "nav",
            "hero",
            "logos",
            "features",
            "stats",
            "testimonials",
            "cta",
            "footer",
          ]
        : state.format === "mobile"
          ? [
              "mobileHeader",
              "balance",
              "quickActions",
              "mobileChart",
              "transactions",
              "mobileNav",
            ]
          : ["overview", "kpis", "chart", "table", "activity", "footer"];
    DOM.blockLibrary.innerHTML = allowed
      .map((type) => {
        const item = BLOCK_LIBRARY[type];
        return `<button type="button" class="library-item" data-add-type="${type}"><span class="library-icon">${escapeHtml(item.icon)}</span><span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.description)}</small></span></button>`;
      })
      .join("");
  }

  function bindEvents() {
    DOM.briefInput.addEventListener("input", () => {
      state.brief = DOM.briefInput.value;
      DOM.promptCount.textContent = state.brief.length;
      saveState(false);
    });

    document.querySelectorAll("[data-prompt]").forEach((button) =>
      button.addEventListener("click", () => {
        state.brief = button.dataset.prompt;
        DOM.briefInput.value = state.brief;
        DOM.promptCount.textContent = state.brief.length;
        DOM.briefInput.focus();
        saveState(false);
      }),
    );

    document.querySelectorAll("[data-format]").forEach((button) =>
      button.addEventListener("click", () => {
        state.format = button.dataset.format;
        if (state.generated) {
          state.variant = 1;
          state.components = buildBlueprint(
            state.format,
            state.brief || EXAMPLE_BRIEF,
            state.variant,
          );
          state.selectedId =
            state.components.find((item) =>
              ["hero", "overview", "balance"].includes(item.type),
            )?.id || null;
          if (state.format === "mobile") state.device = "mobile";
        }
        renderAll();
        saveState(false);
      }),
    );

    document.querySelectorAll("[data-device]").forEach((button) =>
      button.addEventListener("click", () => {
        state.device = button.dataset.device;
        state.zoom =
          state.device === "mobile"
            ? 0.82
            : state.device === "tablet"
              ? 0.68
              : 0.72;
        renderControls();
        renderCanvas();
        saveState(false);
      }),
    );

    DOM.generateButton.addEventListener("click", generate);
    DOM.emptyGenerate.addEventListener("click", () => {
      state.brief = EXAMPLE_BRIEF;
      DOM.briefInput.value = state.brief;
      generate();
    });
    document
      .getElementById("variantButton")
      .addEventListener("click", generateVariant);

    DOM.wireframeCanvas.addEventListener("click", (event) => {
      const target = event.target.closest("[data-id]");
      if (target) selectBlock(target.dataset.id);
    });
    DOM.wireframeCanvas.addEventListener("keydown", (event) => {
      const target = event.target.closest("[data-id]");
      if (target && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        selectBlock(target.dataset.id);
      }
    });

    DOM.componentTree.addEventListener("click", (event) => {
      const select = event.target.closest("[data-select-id]");
      const visibility = event.target.closest("[data-visibility-id]");
      if (select) selectBlock(select.dataset.selectId);
      if (visibility) toggleVisibility(visibility.dataset.visibilityId);
    });
    DOM.componentTree.addEventListener("dragstart", (event) => {
      const item = event.target.closest("[data-id]");
      if (!item) return;
      draggedId = item.dataset.id;
      item.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
    });
    DOM.componentTree.addEventListener("dragend", (event) => {
      event.target.closest("[data-id]")?.classList.remove("is-dragging");
      draggedId = null;
    });
    DOM.componentTree.addEventListener("dragover", (event) =>
      event.preventDefault(),
    );
    DOM.componentTree.addEventListener("drop", (event) => {
      event.preventDefault();
      const target = event.target.closest("[data-id]");
      if (!target || !draggedId || target.dataset.id === draggedId) return;
      const from = state.components.findIndex((item) => item.id === draggedId);
      const to = state.components.findIndex(
        (item) => item.id === target.dataset.id,
      );
      const [moved] = state.components.splice(from, 1);
      state.components.splice(to, 0, moved);
      renderCanvas();
      renderTree();
      saveState(false);
    });

    const fieldMap = [
      [DOM.blockLabel, "label"],
      [DOM.blockEyebrow, "eyebrow"],
      [DOM.blockHeading, "heading"],
      [DOM.blockBody, "body"],
      [DOM.blockAction, "action"],
    ];
    fieldMap.forEach(([field, key]) =>
      field.addEventListener("input", () =>
        updateSelected({ [key]: field.value }),
      ),
    );

    document.querySelectorAll("[data-align]").forEach((button) =>
      button.addEventListener("click", () => {
        updateSelected({ align: button.dataset.align });
        renderInspector();
      }),
    );
    document.querySelectorAll("[data-emphasis]").forEach((button) =>
      button.addEventListener("click", () => {
        updateSelected({ emphasis: button.dataset.emphasis });
        renderInspector();
      }),
    );
    document.querySelectorAll("[data-theme]").forEach((button) =>
      button.addEventListener("click", () => {
        state.theme = button.dataset.theme;
        renderCanvas();
        renderInspector();
        saveState(false);
      }),
    );
    DOM.densityControl.addEventListener("input", () => {
      DOM.densityValue.textContent = DOM.densityControl.value;
      updateSelected({ density: Number(DOM.densityControl.value) });
    });

    document
      .getElementById("contentTabButton")
      .addEventListener("click", () => switchTab("content"));
    document
      .getElementById("styleTabButton")
      .addEventListener("click", () => switchTab("style"));
    document
      .getElementById("moveUpButton")
      .addEventListener("click", () => moveSelected(-1));
    document
      .getElementById("moveDownButton")
      .addEventListener("click", () => moveSelected(1));
    document
      .getElementById("duplicateButton")
      .addEventListener("click", duplicateSelected);
    document
      .getElementById("deleteButton")
      .addEventListener("click", deleteSelected);
    document
      .getElementById("hideBlockButton")
      .addEventListener(
        "click",
        () => state.selectedId && toggleVisibility(state.selectedId),
      );

    document.getElementById("zoomOut").addEventListener("click", () => {
      state.zoom = Math.max(0.4, Math.round((state.zoom - 0.08) * 100) / 100);
      renderCanvas();
      saveState(false);
    });
    document.getElementById("zoomIn").addEventListener("click", () => {
      state.zoom = Math.min(1.1, Math.round((state.zoom + 0.08) * 100) / 100);
      renderCanvas();
      saveState(false);
    });

    document.getElementById("addBlockButton").addEventListener("click", () => {
      populateLibrary();
      DOM.addDialog.showModal();
    });
    DOM.blockLibrary.addEventListener("click", (event) => {
      const button = event.target.closest("[data-add-type]");
      if (button) addBlock(button.dataset.addType);
    });

    document.getElementById("renameProject").addEventListener("click", () => {
      const next = window.prompt("Name this workspace", state.name);
      if (next && next.trim()) {
        state.name = next.trim().slice(0, 60);
        renderControls();
        renderCanvas();
        saveState(false);
      }
    });

    document
      .getElementById("newProject")
      .addEventListener("click", () => DOM.newProjectDialog.showModal());
    DOM.newProjectDialog.addEventListener("close", () => {
      if (DOM.newProjectDialog.returnValue !== "confirm") return;
      state = defaultEmptyState();
      renderAll();
      saveState(false);
      showToast("Fresh workspace ready", "↻");
    });

    DOM.exportMenuButton.addEventListener("click", () => {
      const isOpen = !DOM.exportMenu.hidden;
      DOM.exportMenu.hidden = isOpen;
      DOM.exportMenuButton.setAttribute("aria-expanded", String(!isOpen));
      if (!isOpen) DOM.exportMenu.querySelector("button")?.focus();
    });
    document.getElementById("exportJson").addEventListener("click", exportJson);
    document.getElementById("exportHtml").addEventListener("click", exportHtml);

    document.addEventListener("click", (event) => {
      if (
        !event.target.closest("#exportMenu") &&
        !event.target.closest("#exportMenuButton")
      )
        closeExportMenu();
    });
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        generate();
      }
      if (event.key === "Escape") closeExportMenu();
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveState(true);
      }
    });
  }

  function switchTab(tab) {
    const isContent = tab === "content";
    document.getElementById("contentTab").hidden = !isContent;
    document.getElementById("styleTab").hidden = isContent;
    document
      .getElementById("contentTabButton")
      .setAttribute("aria-selected", String(isContent));
    document
      .getElementById("styleTabButton")
      .setAttribute("aria-selected", String(!isContent));
  }

  renderAll();
  bindEvents();
})();
