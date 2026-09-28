/* Validate persisted data before it reaches rendering or simulation. */
(() => {
  "use strict";
  const text = (v) => typeof v === "string" && v.length <= 100000;
  const id = (v) => text(v) && /^[a-zA-Z0-9_-]{1,120}$/.test(v);
  const number =
    (min = 0, max = 1e15) =>
    (v) =>
      Number.isFinite(v) && v >= min && v <= max;
  const bool = (v) => typeof v === "boolean";
  const one =
    (...values) =>
    (v) =>
      values.includes(v);
  const optional = (check) => (v) => v === undefined || check(v);
  const nullable = (check) => (v) => v === null || check(v);
  const array =
    (check, min = 0, max = 1000) =>
    (v) =>
      Array.isArray(v) && v.length >= min && v.length <= max && v.every(check);
  const object = (fields) => (v) =>
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Object.entries(fields).every(([key, check]) => check(v[key]));
  const record = (check) => (v) =>
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Object.values(v).every(check);
  const unique = (items) =>
    new Set(items.map((item) => item.id)).size === items.length;
  const component = object({
    id,
    type: one(
      "nav",
      "hero",
      "logos",
      "features",
      "stats",
      "testimonials",
      "cta",
      "footer",
      "sidebar",
      "topbar",
      "overview",
      "kpis",
      "chart",
      "table",
      "activity",
      "status",
      "mobileHeader",
      "balance",
      "quickActions",
      "mobileChart",
      "transactions",
      "mobileNav",
    ),
    label: text,
    eyebrow: text,
    heading: text,
    body: text,
    action: text,
    align: one("left", "center", "right"),
    emphasis: one("normal", "quiet", "strong"),
    density: number(1, 5),
    hidden: bool,
  });
  window.validateWorkspace = (v) =>
    object({
      version: one(1),
      name: text,
      brief: text,
      format: one("dashboard", "landing", "mobile"),
      device: one("desktop", "tablet", "mobile"),
      theme: one("cobalt", "violet", "forest", "coral"),
      zoom: number(0.2, 2),
      variant: number(),
      selectedId: nullable(id),
      generated: bool,
      components: array(component, 0, 100),
    })(v) && unique(v.components);
})();
