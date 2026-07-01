"use client";

import * as React from "react";
import Link from "next/link";

import "./landing.css";

type CSS = React.CSSProperties;
/** Allow scoped CSS custom properties (e.g. --w) in inline style objects. */
const s = (style: Record<string, string | number>): CSS => style as CSS;

const mark = (
  <>
    <path
      d="M73 24.3 A38 38 0 1 1 47 24.3"
      stroke="var(--blue)"
      strokeWidth={10}
      strokeLinecap="round"
    />
    <circle cx="60" cy="22" r="8" fill="var(--signal)" />
  </>
);

export type LandingPageProps = {
  accent?: string;
  animate?: boolean;
};

export function LandingPage({ accent = "#4C8DFF", animate = true }: LandingPageProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion =
      animate === false ||
      (typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    if (accent) root.style.setProperty("--blue", accent);

    const q = <T extends Element = HTMLElement>(sel: string) =>
      root.querySelector<T>(sel);
    const qa = <T extends Element = HTMLElement>(sel: string) =>
      [...root.querySelectorAll<T>(sel)];

    const timers: ReturnType<typeof setTimeout>[] = [];
    const cleanups: Array<() => void> = [];
    let unmounted = false;
    cleanups.push(() => {
      unmounted = true;
    });

    const heroRow = ([label, state, meta, tag]: [
      string,
      string,
      string,
      string?,
    ]) => {
      let icon: string, labelColor: string;
      if (state === "done") {
        icon =
          '<span style="flex:none;width:16px;height:16px;border-radius:50%;background:rgba(79,208,140,0.15);color:var(--green-fg);display:grid;place-items:center;font-size:9px;font-weight:700;">✓</span>';
        labelColor = "var(--muted)";
      } else if (state === "current") {
        icon =
          '<span style="flex:none;width:16px;height:16px;border-radius:50%;border:2px solid var(--blue);display:grid;place-items:center;"><span style="width:5px;height:5px;border-radius:50%;background:var(--blue);animation:roomba-landing-pulse 1s ease-in-out infinite;"></span></span>';
        labelColor = "var(--paper)";
      } else {
        icon =
          '<span style="flex:none;width:16px;height:16px;border-radius:50%;border:1px solid var(--border2);"></span>';
        labelColor = "var(--muteddim)";
      }
      let labelHtml = label;
      if (tag && state === "current") {
        labelHtml =
          label +
          ' <span class="rl-mono" style="font-size:9px;color:var(--amber);background:rgba(232,177,76,0.12);border-radius:4px;padding:1px 5px;">↳ ' +
          tag +
          "</span>";
      }
      let metaHtml = "";
      if (meta) {
        const ci = meta.indexOf(":");
        const type = meta.slice(0, ci);
        const val = meta.slice(ci + 1);
        if (type === "chip")
          metaHtml =
            '<span class="rl-mono" style="font-size:10.5px;color:var(--signal);background:rgba(155,194,255,0.1);border-radius:5px;padding:2px 6px;">' +
            val +
            "</span>";
        else if (type === "time")
          metaHtml =
            '<span class="rl-mono" style="font-size:11px;color:var(--muteddim);">' +
            val +
            "</span>";
        else if (type === "pr")
          metaHtml =
            '<span class="rl-mono" style="font-size:11px;color:var(--blue-dim);">' +
            val +
            "</span>";
        else if (type === "dots")
          metaHtml =
            '<span class="rl-mono" style="font-size:12px;color:var(--blue-dim);animation:roomba-landing-pulse 1.1s ease-in-out infinite;">···</span>';
      }
      return (
        '<div style="display:flex; align-items:center; gap:11px;">' +
        icon +
        '<span style="font-size:13px; color:' +
        labelColor +
        '; flex:1; min-width:0; display:flex; align-items:center; gap:7px;">' +
        labelHtml +
        "</span>" +
        metaHtml +
        "</div>"
      );
    };

    const setStatus = (el: HTMLElement | null, done: boolean) => {
      if (!el) return;
      if (done) {
        el.style.color = "var(--green-fg)";
        el.style.background = "rgba(63,182,125,0.13)";
        el.innerHTML =
          '<span style="width:6px; height:6px; border-radius:50%; background:var(--green-fg);"></span>succeeded';
      } else {
        el.style.color = "var(--blue-dim)";
        el.style.background = "rgba(76,141,255,0.13)";
        el.innerHTML =
          '<span style="width:6px; height:6px; border-radius:50%; background:var(--blue); animation:roomba-landing-pulse 1.3s ease-in-out infinite;"></span>running';
      }
    };

    // ---------- hero entrance (transform-only; visible by default) ----------
    if (!reduceMotion) {
      const t = setTimeout(() => {
        qa("[data-hero]").forEach((el) => {
          if (!el.animate) return;
          const delay = parseInt(el.getAttribute("data-delay") || "0", 10);
          el.animate(
            [{ transform: "translateY(16px)" }, { transform: "none" }],
            { duration: 680, delay, easing: "cubic-bezier(.2,.7,.2,1)", fill: "both" },
          );
        });
      }, 120);
      timers.push(t);
    }

    if (!reduceMotion) {
      const t = setTimeout(() => {
        const steps = q("[data-hero-steps]");
        if (!steps) return;
        const phases = [
          {
            spend: 0.62,
            done: false,
            rows: [
              ["Clone repository", "done", "time:0:04"],
              ["Plan changes", "done", "chip:$0.46"],
              ["Apply fix", "current", "chip:$0.16", "gpt-4o"],
              ["Run test suite", "pending", ""],
              ["Open pull request", "pending", ""],
            ],
          },
          {
            spend: 1.13,
            done: false,
            rows: [
              ["Clone repository", "done", "time:0:04"],
              ["Plan changes", "done", "chip:$0.46"],
              ["Apply fix", "done", "chip:$0.51"],
              ["Run test suite", "current", "dots"],
              ["Open pull request", "pending", ""],
            ],
          },
          {
            spend: 1.13,
            done: false,
            rows: [
              ["Clone repository", "done", "time:0:04"],
              ["Plan changes", "done", "chip:$0.46"],
              ["Apply fix", "done", "chip:$0.51"],
              ["Run test suite", "done", "time:0:09"],
              ["Open pull request", "current", "dots"],
            ],
          },
          {
            spend: 1.18,
            done: true,
            rows: [
              ["Clone repository", "done", "time:0:04"],
              ["Plan changes", "done", "chip:$0.46"],
              ["Apply fix", "done", "chip:$0.51"],
              ["Run test suite", "done", "time:0:09"],
              ["Open pull request", "done", "pr:#1284"],
            ],
          },
        ] as const;
        let phase = 0;
        const advance = () => {
          const p = phases[phase];
          const stepsEl = q("[data-hero-steps]");
          if (stepsEl)
            stepsEl.innerHTML = p.rows
              .map((r) => heroRow(r as unknown as [string, string, string, string?]))
              .join("");
          const spend = q("[data-hero-spend]");
          if (spend) spend.textContent = "$" + p.spend.toFixed(2);
          const leash = q<HTMLElement>("[data-hero-leash]");
          if (leash) leash.style.width = ((p.spend / 5) * 100).toFixed(1) + "%";
          setStatus(q("[data-hero-status]"), p.done);
          const last = phase === phases.length - 1;
          phase = last ? 0 : phase + 1;
          const nt = setTimeout(advance, last ? 2900 : 1900);
          timers.push(nt);
        };
        advance();
      }, 1400);
      timers.push(t);
    }

    const countUp = (el: HTMLElement) => {
      if ((el as HTMLElement & { __counted?: boolean }).__counted) return;
      (el as HTMLElement & { __counted?: boolean }).__counted = true;
      const to = parseFloat(el.getAttribute("data-to") || "");
      const fmt = el.getAttribute("data-fmt");
      if (reduceMotion || isNaN(to)) return;
      const render = (v: number) => {
        if (fmt === "hm") {
          const m = Math.round(v);
          return Math.floor(m / 60) + "h " + (m % 60) + "m";
        }
        if (fmt === "perwk") return Math.round(v) + " / wk";
        if (fmt === "pct") return Math.round(v) + "%";
        if (fmt === "min") return Math.round(v) + "m";
        return String(Math.round(v));
      };
      const dur = 1100,
        start = performance.now();
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const step = (now: number) => {
        if (unmounted) return;
        const t = Math.min(1, (now - start) / dur);
        el.textContent = render(to * ease(t));
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = render(to);
      };
      requestAnimationFrame(step);
    };

    const streamTrace = (card: HTMLElement) => {
      const rows = [...card.querySelectorAll<HTMLElement>("[data-trace-row]")];
      rows.forEach((row, i) => {
        const grow = () => {
          const bar = row.querySelector<HTMLElement>("[data-grow]");
          if (!bar) return;
          const w = bar.getAttribute("data-w") || "";
          if (reduceMotion) {
            bar.style.width = w;
            return;
          }
          bar.style.transition = "width 0.55s cubic-bezier(.3,.85,.3,1)";
          void bar.offsetWidth;
          bar.style.width = w;
        };
        if (reduceMotion) {
          row.style.opacity = "1";
          row.style.transform = "none";
          grow();
          return;
        }
        const delay = 240 + i * 380;
        const t = setTimeout(() => {
          row.style.transform = "translateY(7px)";
          void row.offsetWidth;
          row.style.transition =
            "opacity 0.4s ease, transform 0.42s cubic-bezier(.2,.7,.2,1)";
          row.style.opacity = "1";
          row.style.transform = "none";
          grow();
        }, delay);
        timers.push(t);
      });
    };

    const reveal = (el: HTMLElement) => {
      const marked = el as HTMLElement & { __shown?: boolean };
      if (marked.__shown) return;
      marked.__shown = true;
      const delay = parseInt(el.getAttribute("data-delay") || "0", 10);
      if (el.animate) {
        el.animate(
          [
            { opacity: 0, transform: "translateY(22px)" },
            { opacity: 1, transform: "none" },
          ],
          {
            duration: reduceMotion ? 0 : 680,
            delay: reduceMotion ? 0 : delay,
            easing: "cubic-bezier(.2,.7,.2,1)",
            fill: "both",
          },
        );
      } else {
        el.style.opacity = "1";
        el.style.transform = "none";
      }
      el.querySelectorAll<HTMLElement>("[data-countup]").forEach((c) => countUp(c));
      if (el.hasAttribute("data-trace")) {
        streamTrace(el);
        return;
      }
      el.querySelectorAll<HTMLElement>("[data-grow]").forEach((b, i) => {
        const w = b.getAttribute("data-w");
        if (!w) return;
        if (b.animate) {
          b.animate([{ width: "0" }, { width: w }], {
            duration: reduceMotion ? 0 : 900,
            delay: reduceMotion ? 0 : 160 + i * 90,
            easing: "cubic-bezier(.3,.85,.3,1)",
            fill: "both",
          });
        } else {
          b.style.width = w;
        }
      });
    };

    const revealInit = setTimeout(() => {
      const els = qa("[data-reveal]");
      if (!els.length) return;
      if (reduceMotion || !("IntersectionObserver" in window)) {
        els.forEach((e) => reveal(e));
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              reveal(e.target as HTMLElement);
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
      );
      els.forEach((e) => io.observe(e));
      cleanups.push(() => io.disconnect());
      // failsafe: reveal everything even if the observer never fires
      const fs = setTimeout(() => els.forEach((e) => reveal(e)), 4000);
      timers.push(fs);
    }, 220);
    timers.push(revealInit);

    if (!reduceMotion) {
      const bg = q<HTMLElement>("[data-hero-bg]");
      if (bg) {
        let raf: number | null = null,
          tx = 0,
          ty = 0;
        const onMove = (e: PointerEvent) => {
          tx = (e.clientX / window.innerWidth - 0.5) * 22;
          ty = (e.clientY / window.innerHeight - 0.5) * 22;
          if (raf) return;
          raf = requestAnimationFrame(() => {
            bg.style.transform =
              "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px)";
            raf = null;
          });
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        cleanups.push(() => {
          window.removeEventListener("pointermove", onMove);
          if (raf) cancelAnimationFrame(raf);
        });
      }
    }

    const spyInit = setTimeout(() => {
      const nav = q("[data-spy-nav]");
      if (!nav) return;
      const indicator = nav.querySelector<HTMLElement>("[data-spy-indicator]");
      const startBtn = q<HTMLElement>("[data-nav-start]");
      if (reduceMotion && indicator)
        indicator.style.transition = "opacity 0.2s ease";
      const ids = ["observability", "guardrails", "telemetry"];
      const navLinks: Record<string, HTMLElement | null> = {};
      ids.forEach((id) => {
        navLinks[id] = nav.querySelector<HTMLElement>('[data-spy-link="' + id + '"]');
      });
      const sections = ids
        .map((id) => ({ id, el: root.querySelector<HTMLElement>("#" + id) }))
        .filter((s): s is { id: string; el: HTMLElement } => !!s.el);
      if (!sections.length) return;

      let navTarget: string | null | undefined;
      let pillTimer: ReturnType<typeof setTimeout> | undefined;

      const positionPill = (el: HTMLElement | null, glow: boolean) => {
        if (!indicator || !el) {
          if (indicator) indicator.style.opacity = "0";
          return;
        }
        const navR = nav.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        const pad = glow ? 4 : 0;
        indicator.style.opacity = "1";
        indicator.style.width = r.width + pad * 2 + "px";
        indicator.style.height = r.height + pad * 2 + "px";
        indicator.style.top = r.top - navR.top - pad + "px";
        indicator.style.transform =
          "translateX(" + (r.left - navR.left - pad) + "px)";
        if (glow) {
          indicator.style.background = "transparent";
          indicator.style.boxShadow =
            "0 0 0 1.5px var(--blue), 0 0 22px 3px rgba(76,141,255,0.5)";
        } else {
          indicator.style.background = "rgba(76,141,255,0.16)";
          indicator.style.boxShadow = "none";
        }
      };
      const setStartGlow = (on: boolean) => {
        if (!startBtn) return;
        if (on) {
          startBtn.style.animation = reduceMotion
            ? ""
            : "roomba-landing-cta-glow 2s ease-in-out infinite";
          if (!reduceMotion) startBtn.style.transform = "scale(1.04)";
        } else {
          startBtn.style.animation = "";
          startBtn.style.transform = "";
        }
      };
      const applyNav = (target: string | null) => {
        if (target === navTarget) return;
        navTarget = target;
        clearTimeout(pillTimer);
        Object.keys(navLinks).forEach((k) => {
          const a = navLinks[k];
          if (a) a.style.color = k === target ? "var(--blue-dim)" : "var(--muted)";
        });
        if (target === "cta") {
          positionPill(startBtn, true);
          setStartGlow(true);
          if (indicator && !reduceMotion)
            pillTimer = setTimeout(() => {
              if (navTarget === "cta") indicator.style.opacity = "0";
            }, 480);
          else if (indicator) indicator.style.opacity = "0";
        } else {
          setStartGlow(false);
          const link = target ? navLinks[target] : null;
          if (link) positionPill(link, false);
          else if (indicator) indicator.style.opacity = "0";
        }
      };
      const compute = () => {
        const line = window.innerHeight * 0.4;
        let target: string | null = null;
        for (const { id, el } of sections) {
          const r = el.getBoundingClientRect();
          if (r.top <= line && r.bottom > line) {
            target = id;
            break;
          }
        }
        if (!target) {
          const startEl = root.querySelector("#start");
          if (startEl) {
            const r = startEl.getBoundingClientRect();
            if (r.top <= line && r.bottom > line) target = "cta";
          }
        }
        applyNav(target);
      };
      let raf: number | null = null;
      const tick = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          compute();
        });
      };
      const onResize = () => {
        navTarget = undefined;
        tick();
      };
      window.addEventListener("scroll", tick, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
      cleanups.push(() => {
        window.removeEventListener("scroll", tick);
        window.removeEventListener("resize", onResize);
        if (raf) cancelAnimationFrame(raf);
        clearTimeout(pillTimer);
      });
      compute();
    }, 260);
    timers.push(spyInit);

    let ctaRunning = false;
    let ctaDone = false;
    const renderCtaPhase = (p: {
      spend: number;
      done?: boolean;
      rows: readonly (readonly [string, string, string, string?])[];
    }) => {
      const steps = q("[data-cta-steps]");
      if (steps)
        steps.innerHTML = p.rows
          .map((r) => heroRow(r as unknown as [string, string, string, string?]))
          .join("");
      const spend = q("[data-cta-spend]");
      if (spend) spend.textContent = "$" + p.spend.toFixed(2);
      const leash = q<HTMLElement>("[data-cta-leash]");
      if (leash) leash.style.width = ((p.spend / 5) * 100).toFixed(1) + "%";
      setStatus(q("[data-cta-status]"), !!p.done);
    };
    const finishCta = () => {
      ctaDone = true;
      ctaRunning = false;
      const btn = q("[data-cta-run]");
      if (btn) {
        btn.textContent = "Authorized ✓";
        btn.style.opacity = "1";
        btn.style.background = "var(--green-fg)";
      }
      const card = q<HTMLElement>("[data-cta-card]");
      if (card)
        card.style.boxShadow =
          "0 0 0 1px rgba(63,182,125,0.5), 0 40px 90px rgba(63,182,125,0.16)";
      const note = q("[data-cta-note]");
      if (note) {
        note.textContent = "PR #1 opened · $1.18 of $5.00 spent";
        note.style.color = "var(--green-fg)";
      }
    };
    const authorizeRun = () => {
      if (ctaRunning || ctaDone) return;
      const email = q<HTMLInputElement>("[data-cta-email]");
      if (email && !email.value.trim()) {
        email.focus();
        if (email.animate)
          email.animate(
            [
              { transform: "translateX(0)" },
              { transform: "translateX(-5px)" },
              { transform: "translateX(5px)" },
              { transform: "translateX(0)" },
            ],
            { duration: 280, easing: "ease-in-out" },
          );
        const note = q("[data-cta-note]");
        if (note) {
          note.textContent = "enter an email to authorize the run";
          note.style.color = "var(--amber)";
        }
        return;
      }
      ctaRunning = true;
      const btn = q("[data-cta-run]");
      const card = q<HTMLElement>("[data-cta-card]");
      const iso = q("[data-cta-iso]");
      const note = q("[data-cta-note]");
      if (btn) {
        btn.textContent = "Running…";
        btn.style.opacity = "0.7";
        btn.style.pointerEvents = "none";
      }
      if (card) {
        card.style.borderColor = "var(--blue)";
        card.style.boxShadow =
          "0 0 0 1px rgba(76,141,255,0.55), 0 40px 90px rgba(76,141,255,0.18)";
      }
      if (iso) iso.textContent = "iso-9c2";
      if (note) {
        note.textContent = "authorized · agent spawned → iso-9c2";
        note.style.color = "var(--blue-dim)";
      }
      const phases = [
        { spend: 0.0, rows: [["Clone repository", "current", "dots"], ["Plan changes", "pending", ""], ["Apply fix", "pending", ""], ["Run test suite", "pending", ""], ["Open pull request", "pending", ""]] },
        { spend: 0.46, rows: [["Clone repository", "done", "time:0:03"], ["Plan changes", "current", "dots", "gpt-4o"], ["Apply fix", "pending", ""], ["Run test suite", "pending", ""], ["Open pull request", "pending", ""]] },
        { spend: 0.62, rows: [["Clone repository", "done", "time:0:03"], ["Plan changes", "done", "chip:$0.46"], ["Apply fix", "current", "dots", "gpt-4o"], ["Run test suite", "pending", ""], ["Open pull request", "pending", ""]] },
        { spend: 1.13, rows: [["Clone repository", "done", "time:0:03"], ["Plan changes", "done", "chip:$0.46"], ["Apply fix", "done", "chip:$0.51"], ["Run test suite", "current", "dots"], ["Open pull request", "pending", ""]] },
        { spend: 1.18, rows: [["Clone repository", "done", "time:0:03"], ["Plan changes", "done", "chip:$0.46"], ["Apply fix", "done", "chip:$0.51"], ["Run test suite", "done", "time:0:08"], ["Open pull request", "current", "dots"]] },
        { spend: 1.18, done: true, rows: [["Clone repository", "done", "time:0:03"], ["Plan changes", "done", "chip:$0.46"], ["Apply fix", "done", "chip:$0.51"], ["Run test suite", "done", "time:0:08"], ["Open pull request", "done", "pr:#1"]] },
      ] as const;
      if (reduceMotion) {
        renderCtaPhase(phases[phases.length - 1]);
        finishCta();
        return;
      }
      let i = 0;
      const run = () => {
        renderCtaPhase(phases[i]);
        if (i === phases.length - 1) {
          finishCta();
          return;
        }
        i++;
        const t = setTimeout(run, 780);
        timers.push(t);
      };
      run();
    };
    const runBtn = q("[data-cta-run]");
    if (runBtn) {
      const onClick = (e: Event) => {
        e.preventDefault();
        authorizeRun();
      };
      runBtn.addEventListener("click", onClick);
      cleanups.push(() => runBtn.removeEventListener("click", onClick));
    }

    const menuToggle = q("[data-menu-toggle]");
    const menuPanel = q("[data-mobile-menu]");
    if (menuToggle && menuPanel) {
      const setOpen = (open: boolean) => {
        menuToggle.setAttribute("aria-expanded", String(open));
        menuPanel.setAttribute("data-open", String(open));
      };
      const onToggle = () => setOpen(menuPanel.getAttribute("data-open") !== "true");
      const onPanelClick = (e: Event) => {
        if ((e.target as HTMLElement).closest("a")) setOpen(false);
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      const onResizeClose = () => {
        if (window.innerWidth > 760) setOpen(false);
      };
      menuToggle.addEventListener("click", onToggle);
      menuPanel.addEventListener("click", onPanelClick);
      window.addEventListener("keydown", onKey);
      window.addEventListener("resize", onResizeClose);
      cleanups.push(() => {
        menuToggle.removeEventListener("click", onToggle);
        menuPanel.removeEventListener("click", onPanelClick);
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", onResizeClose);
      });
    }

    return () => {
      timers.forEach(clearTimeout);
      cleanups.forEach((fn) => fn());
    };
  }, [accent, animate]);

  const label: CSS = {
    fontSize: "12px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "var(--blue-dim)",
    marginBottom: "16px",
  };
  const bullet = (text: string) => (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
      <span style={{ color: "var(--blue)", marginTop: "2px" }}>▪</span>
      <span style={{ fontSize: "14.5px", lineHeight: 1.55, color: "var(--paper)" }}>
        {text}
      </span>
    </div>
  );

  return (
    <div ref={rootRef} id="roomba-landing" className="roomba-landing">
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: "64px",
          borderBottom: "1px solid var(--slate)",
          background: "rgba(7,10,16,0.72)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
            <svg viewBox="0 0 120 120" width="24" height="24" fill="none" aria-label="roomba">
              {mark}
            </svg>
            <span style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.03em" }}>
              roomba
            </span>
          </div>
          <nav
            data-spy-nav
            data-nav-links
            style={{ position: "relative", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <span
              data-spy-indicator
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 0,
                height: 0,
                background: "rgba(76,141,255,0.16)",
                borderRadius: "8px",
                opacity: 0,
                pointerEvents: "none",
                zIndex: 0,
                transition:
                  "transform 0.34s cubic-bezier(.4,.8,.3,1), width 0.34s cubic-bezier(.4,.8,.3,1), height 0.2s ease, top 0.2s ease, opacity 0.25s ease",
              }}
            />
            {[
              ["observability", "Observability"],
              ["guardrails", "Guardrails"],
              ["telemetry", "Telemetry"],
            ].map(([id, text]) => (
              <a
                key={id}
                href={"#" + id}
                data-spy-link={id}
                className="rl-navlink"
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontSize: "14px",
                  color: "var(--muted)",
                  textDecoration: "none",
                  padding: "7px 13px",
                  borderRadius: "8px",
                }}
              >
                {text}
              </a>
            ))}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div className="rl-header-actions" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <Link
                href="/auth/sign-in"
                className="rl-btn-outline"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  color: "var(--paper)",
                  background: "transparent",
                  border: "1px solid var(--border2)",
                  borderRadius: "8px",
                  padding: "8px 15px",
                  textDecoration: "none",
                  transition: "border-color 0.2s ease",
                }}
              >
                Sign in
              </Link>
              <a
                href="#start"
                data-nav-start
                className="rl-btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "var(--void)",
                  background: "var(--blue)",
                  borderRadius: "8px",
                  padding: "9px 16px",
                  textDecoration: "none",
                  boxShadow: "0 0 0 1px rgba(76,141,255,0.4)",
                  transition: "transform 0.4s cubic-bezier(.2,.7,.2,1), background 0.2s ease",
                }}
              >
                Start free
              </a>
            </div>
            <button
              type="button"
              data-menu-toggle
              className="rl-hamburger"
              aria-label="Open menu"
              aria-expanded="false"
              style={{
                width: "40px",
                height: "40px",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "1px solid var(--border2)",
                borderRadius: "8px",
                color: "var(--paper)",
                cursor: "pointer",
                padding: 0,
                transition: "border-color 0.2s ease",
              }}
            >
              <svg
                className="rl-ic-menu"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <svg
                className="rl-ic-close"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>

          <div
            data-mobile-menu
            className="rl-mobile-menu"
            style={{
              position: "absolute",
              top: "64px",
              left: 0,
              right: 0,
              background: "var(--ink)",
              borderTop: "1px solid var(--slate)",
              borderBottom: "1px solid var(--slate)",
              padding: "10px 20px 18px",
              flexDirection: "column",
              gap: "2px",
              boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
              zIndex: 60,
            }}
          >
            {[
              ["observability", "Observability"],
              ["guardrails", "Guardrails"],
              ["telemetry", "Telemetry"],
            ].map(([id, text]) => (
              <a
                key={id}
                href={"#" + id}
                className="rl-navlink"
                style={{
                  fontSize: "15px",
                  color: "var(--muted)",
                  textDecoration: "none",
                  padding: "13px 6px",
                  borderBottom: "1px solid var(--slate)",
                }}
              >
                {text}
              </a>
            ))}
            <Link
              href="/auth/sign-in"
              className="rl-btn-outline"
              style={{
                marginTop: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                fontWeight: 500,
                color: "var(--paper)",
                background: "transparent",
                border: "1px solid var(--border2)",
                borderRadius: "10px",
                padding: "13px",
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
            <a
              href="#start"
              className="rl-btn-primary"
              style={{
                marginTop: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--void)",
                background: "var(--blue)",
                borderRadius: "10px",
                padding: "13px",
                textDecoration: "none",
                boxShadow: "0 10px 30px rgba(76,141,255,0.25)",
              }}
            >
              Start free
            </a>
          </div>
        </div>
      </header>

      <section
        style={{
          position: "relative",
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "108px 28px 92px",
        }}
      >
        <div
          data-hero-bg
          style={{
            position: "absolute",
            inset: "-48px",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            WebkitMaskImage: "radial-gradient(circle at 30% 28%, #000, transparent 78%)",
            maskImage: "radial-gradient(circle at 30% 28%, #000, transparent 78%)",
            pointerEvents: "none",
            transition: "transform 0.4s cubic-bezier(.2,.7,.2,1)",
            willChange: "transform",
          }}
        />
        <div
          data-hero-grid
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "1.02fr 0.98fr",
            gap: "56px",
            alignItems: "center",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              data-hero
              data-delay="0"
              className="rl-mono"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                fontSize: "12px",
                letterSpacing: "0.04em",
                color: "var(--muted)",
                border: "1px solid var(--slate)",
                borderRadius: "30px",
                padding: "6px 14px",
                marginBottom: "28px",
              }}
            >
              <span
                className="rl-pulse"
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--blue)",
                }}
              />
              autonomous SWE agents · Linear-native
            </div>
            <h1
              data-hero
              data-delay="70"
              style={{
                fontSize: "clamp(44px,5vw,72px)",
                lineHeight: 1.03,
                letterSpacing: "-0.035em",
                fontWeight: 600,
                margin: "0 0 24px",
              }}
            >
              Close the <span style={{ color: "var(--blue)" }}>loop</span> on your backlog.
            </h1>
            <p
              data-hero
              data-delay="140"
              style={{
                fontSize: "clamp(16.5px,1.4vw,19px)",
                lineHeight: 1.62,
                color: "var(--muted)",
                maxWidth: "520px",
                margin: "0 0 34px",
              }}
            >
              Roomba runs autonomous agents that pick up Linear issues, work in isolated
              Docker containers, and open pull requests — every run costed, fully traced,
              and on a leash you set.
            </p>
            <div
              data-hero
              data-delay="210"
              style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px" }}
            >
              <a
                href="#start"
                className="rl-btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--void)",
                  background: "var(--blue)",
                  borderRadius: "10px",
                  padding: "14px 24px",
                  textDecoration: "none",
                  boxShadow: "0 10px 30px rgba(76,141,255,0.25)",
                  transition: "background 0.2s ease",
                }}
              >
                Start free
              </a>
              <a
                href="#observability"
                className="rl-btn-outline"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "var(--paper)",
                  background: "transparent",
                  border: "1px solid var(--border2)",
                  borderRadius: "10px",
                  padding: "14px 22px",
                  textDecoration: "none",
                  transition: "border-color 0.2s ease",
                }}
              >
                See a live trace ↓
              </a>
            </div>
          </div>

          <div
            data-hero
            data-hero-visual
            data-delay="180"
            style={{
              border: "1px solid var(--slate)",
              borderRadius: "16px",
              background: "var(--ink)",
              boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "15px 18px",
                borderBottom: "1px solid var(--slate)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  data-hero-status
                  className="rl-mono"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    color: "var(--blue-dim)",
                    background: "rgba(76,141,255,0.13)",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--blue)",
                      animation: "roomba-landing-pulse 1.3s ease-in-out infinite",
                    }}
                  />
                  running
                </span>
                <span className="rl-mono" style={{ fontSize: "12px", color: "var(--blue-dim)" }}>
                  ROO-2287
                </span>
              </div>
              <span className="rl-mono" style={{ fontSize: "11.5px", color: "var(--muteddim)" }}>
                iso-3f9a
              </span>
            </div>
            <div style={{ padding: "16px 18px 6px" }}>
              <div style={{ fontSize: "13.5px", color: "var(--paper)", marginBottom: "16px" }}>
                Add rate-limit backoff to API client
              </div>
              <div
                data-hero-steps
                style={{ display: "flex", flexDirection: "column", gap: "12px" }}
              >
                <StepRow state="done" label="Clone repository" meta={{ time: "0:04" }} />
                <StepRow state="done" label="Plan changes" meta={{ chip: "$0.46" }} />
                <StepRow state="current" label="Apply fix" tag="gpt-4o" meta={{ chip: "$0.16" }} />
                <StepRow state="pending" label="Run test suite" />
                <StepRow state="pending" label="Open pull request" />
              </div>
            </div>
            <div
              style={{
                padding: "14px 18px 16px",
                borderTop: "1px solid var(--slate)",
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span
                  className="rl-mono"
                  style={{
                    fontSize: "10.5px",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--muteddim)",
                  }}
                >
                  Spend leash
                </span>
                <span className="rl-mono" style={{ fontSize: "12px", color: "var(--paper)" }}>
                  <span data-hero-spend>$0.62</span>{" "}
                  <span style={{ color: "var(--muteddim)" }}>/ $5.00</span>
                </span>
              </div>
              <div
                style={{
                  height: "8px",
                  borderRadius: "6px",
                  background: "var(--void)",
                  overflow: "hidden",
                }}
              >
                <div
                  data-hero-leash
                  style={{
                    width: "12.4%",
                    height: "100%",
                    background: "var(--blue)",
                    borderRadius: "6px",
                    transition: "width 0.6s cubic-bezier(.3,.85,.3,1)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        data-reveal
        style={{
          borderTop: "1px solid var(--slate)",
          borderBottom: "1px solid var(--slate)",
          background: "var(--ink)",
        }}
      >
        <div
          className="rl-mono"
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "22px 28px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "18px",
            fontSize: "12px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--muteddim)",
          }}
        >
          <span>Isolated containers</span>
          <span style={{ color: "var(--slate)" }}>/</span>
          <span>Per-run cost ceilings</span>
          <span style={{ color: "var(--slate)" }}>/</span>
          <span>Provider fallback chains</span>
          <span style={{ color: "var(--slate)" }}>/</span>
          <span>DORA from real timestamps</span>
        </div>
      </section>

      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "104px 28px 64px" }}>
        <div data-reveal style={{ maxWidth: "620px", marginBottom: "52px" }}>
          <div className="rl-mono" style={label}>
            How it works
          </div>
          <h2
            style={{
              fontSize: "clamp(30px,3.4vw,42px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              fontWeight: 600,
              margin: 0,
            }}
          >
            From assigned issue to open PR — without a human in the loop.
          </h2>
        </div>
        <div
          data-reveal
          data-steps-grid
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            border: "1px solid var(--slate)",
            borderRadius: "16px",
            overflow: "hidden",
            background: "var(--ink)",
          }}
        >
          {[
            ["01", "Assign in Linear", "Tag an issue for Roomba. It picks up the spec, labels, and acceptance criteria."],
            ["02", "Spawn a clean room", "A fresh, egress-only Docker container per run. No shared state, no surprises."],
            ["03", "Work on a leash", "Plan, edit, and test within cost, iteration, and timeout bounds you authorize."],
            ["04", "Open a costed PR", "A pull request, backed by a replayable trace of every step and its cost."],
          ].map(([n, title, desc], i) => (
            <div
              key={n}
              data-step
              style={{ padding: "26px 24px", borderLeft: i === 0 ? undefined : "1px solid var(--slate)" }}
            >
              <div className="rl-mono" style={{ fontSize: "13px", color: "var(--blue)", marginBottom: "18px" }}>
                {n}
              </div>
              <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>{title}</div>
              <div style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--muted)" }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="observability"
        data-split-grid
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "80px 28px",
          display: "grid",
          gridTemplateColumns: "0.85fr 1.15fr",
          gap: "64px",
          alignItems: "center",
        }}
      >
        <div data-reveal data-split-copy>
          <div className="rl-mono" style={label}>
            Observability
          </div>
          <h2
            style={{
              fontSize: "clamp(28px,3.2vw,40px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              fontWeight: 600,
              margin: "0 0 20px",
            }}
          >
            Every run, replayable to the cent.
          </h2>
          <p style={{ fontSize: "16.5px", lineHeight: 1.65, color: "var(--muted)", margin: "0 0 28px" }}>
            Not a black box. Each run is a trace of artifacts — clone, every LLM call, each
            test, the PR — on one timeline. Open any node for the raw diff, prompt, or test
            output.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {bullet("Per-call cost chips, so you see exactly where spend goes.")}
            {bullet("Fallbacks flagged inline — know when model B stepped in.")}
            {bullet("A running total that ticks up as the trace grows.")}
          </div>
        </div>

        <div
          data-reveal
          data-trace
          data-split-visual
          style={{
            border: "1px solid var(--slate)",
            borderRadius: "16px",
            background: "var(--ink)",
            overflow: "hidden",
            boxShadow: "0 30px 70px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid var(--slate)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <span
                className="rl-mono"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  color: "var(--green-fg)",
                  background: "rgba(63,182,125,0.13)",
                  flex: "none",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green-fg)" }} />
                succeeded
              </span>
              <span className="rl-mono" style={{ fontSize: "12px", color: "var(--blue-dim)", flex: "none" }}>
                ROO-238
              </span>
              <span
                className="rl-trace-title"
                style={{
                  fontSize: "13.5px",
                  color: "var(--paper)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Fix flaky container teardown
              </span>
            </div>
            <span className="rl-mono" style={{ fontSize: "13px", color: "var(--signal)", flex: "none" }}>
              $1.18
            </span>
          </div>
          <div
            className="rl-mono rl-trace-grid"
            style={{
              padding: "10px 20px",
              borderBottom: "1px solid var(--slate)",
              display: "grid",
              gridTemplateColumns: "24px minmax(0,1fr) 150px 76px",
              gap: "10px",
              fontSize: "9.5px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--muteddim)",
            }}
          >
            <div />
            <div>Span</div>
            <div className="rl-trace-timeline" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>0:00</span>
              <span>2:06</span>
              <span>4:12</span>
            </div>
            <div style={{ textAlign: "right" }}>Cost</div>
          </div>
          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: "9px" }}>
            <TraceRow tag="GIT" tagColor="var(--muted)" title="Clone repository" barColor="#33415A" left="0%" width="3%" />
            <TraceRow tag="LLM" tagColor="var(--blue-dim)" title="Plan changes" barColor="#4C8DFF" left="3%" width="15%" cost="$0.46" />
            <TraceRow tag="RUN" tagColor="var(--muted)" title="Run test suite" barColor="#33415A" left="18%" width="11%" />
            <TraceRow tag="LLM" tagColor="var(--blue-dim)" title="Apply fix" fallback="gpt-4o" barColor="#4C8DFF" left="29%" width="30%" cost="$0.51" />
            <TraceRow tag="PR" tagColor="var(--green-fg)" tagBorder="var(--green-fg)" title="Open pull request #1284" barColor="#33415A" left="96%" width="4%" />
          </div>
        </div>
      </section>

      <section
        id="guardrails"
        data-split-grid
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "80px 28px",
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          gap: "64px",
          alignItems: "center",
        }}
      >
        <div data-reveal data-split-visual style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              border: "1px solid var(--slate)",
              borderRadius: "16px",
              background: "var(--ink)",
              padding: "24px",
              boxShadow: "0 30px 70px rgba(0,0,0,0.4)",
            }}
          >
            <LeashRow name="Spend leash" value="$1.18 / $5.00 · authorized" width="24%" color="var(--blue)" />
            <div style={{ height: "22px" }} />
            <LeashRow name="Iteration leash" value="14 / 25" width="56%" color="var(--blue)" />
          </div>
          <div
            style={{
              border: "1px solid rgba(255,92,106,0.3)",
              borderRadius: "16px",
              background: "var(--ink)",
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "7px",
              }}
            >
              <span className="rl-mono" style={{ fontSize: "11px", color: "var(--danger-fg)" }}>
                ROO-230 · ceiling reached
              </span>
              <span className="rl-mono" style={{ fontSize: "13px", color: "var(--paper)" }}>
                $1.00 / $1.00
              </span>
            </div>
            <div style={{ height: "9px", borderRadius: "6px", background: "var(--void)", overflow: "hidden" }}>
              <div
                data-grow
                data-w="100%"
                style={s({ "--w": "100%", height: "100%", background: "var(--danger)", borderRadius: "6px" })}
              />
            </div>
            <div style={{ fontSize: "12.5px", color: "var(--muted)", marginTop: "12px" }}>
              Agent halted at the bound you set. No surprise invoice.
            </div>
          </div>
        </div>

        <div data-reveal data-split-copy>
          <div className="rl-mono" style={label}>
            Guardrails
          </div>
          <h2
            style={{
              fontSize: "clamp(28px,3.2vw,40px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              fontWeight: 600,
              margin: "0 0 20px",
            }}
          >
            Autonomy, on a leash you can see.
          </h2>
          <p style={{ fontSize: "16.5px", lineHeight: 1.65, color: "var(--muted)", margin: "0 0 28px" }}>
            Set a max spend, iteration count, and timeout before every run. Roomba shows the
            exact ceiling it&apos;s authorized to reach — and stops there, naming the bound it
            hit.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {bullet("Cost, iteration, and timeout bounds.")}
            {bullet('A live "max spend $X" readout before you authorize.')}
            {bullet("When a bound trips, the terminal node says which one.")}
          </div>
        </div>
      </section>

      <section
        id="telemetry"
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "80px 28px",
          display: "flex",
          flexDirection: "column",
          gap: "44px",
        }}
      >
        <div data-reveal style={{ maxWidth: "620px" }}>
          <div className="rl-mono" style={label}>
            Telemetry
          </div>
          <h2
            style={{
              fontSize: "clamp(28px,3.2vw,40px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              fontWeight: 600,
              margin: "0 0 20px",
            }}
          >
            DORA.
          </h2>
          <p style={{ fontSize: "16.5px", lineHeight: 1.65, color: "var(--muted)", margin: 0, maxWidth: "540px" }}>
            Lead time, deploy frequency, change-failure rate, and MTTR — computed from the run
            timestamps Roomba already records. Measured against the prior period.
          </p>
        </div>

        <div
          data-reveal
          style={{
            border: "1px solid var(--slate)",
            borderRadius: "16px",
            background: "var(--ink)",
            overflow: "hidden",
            boxShadow: "0 30px 70px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 22px",
              borderBottom: "1px solid var(--slate)",
            }}
          >
            <span
              className="rl-mono"
              style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muteddim)" }}
            >
              DORA · last 30 days
            </span>
            <div
              style={{
                display: "flex",
                gap: "3px",
                background: "var(--void)",
                border: "1px solid var(--slate)",
                borderRadius: "7px",
                padding: "2px",
              }}
            >
              {["7d", "30d", "90d"].map((r) => (
                <span
                  key={r}
                  className="rl-mono"
                  style={{
                    fontSize: "10.5px",
                    padding: "4px 9px",
                    borderRadius: "5px",
                    color: r === "30d" ? "var(--void)" : "var(--muteddim)",
                    background: r === "30d" ? "var(--blue)" : "transparent",
                  }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div data-tele-grid style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
            <TeleStat
              first
              name="Lead time"
              to="252"
              fmt="hm"
              display="4h 12m"
              trend="↓ 18% vs prior"
              path="M0 7 L20 9 L40 13 L60 16 L80 19 L100 21 L120 24"
              baseY={15}
            />
            <TeleStat
              name="Deploy frequency"
              to="23"
              fmt="perwk"
              display="23 / wk"
              trend="↑ 12% vs prior"
              path="M0 22 L20 19 L40 20 L60 15 L80 11 L100 9 L120 5"
              baseY={14}
            />
            <TeleStat
              name="Change failure rate"
              to="9"
              fmt="pct"
              display="9%"
              trend="↓ 3 pts vs prior"
              path="M0 6 L20 8 L40 10 L60 14 L80 16 L100 19 L120 21"
              baseY={13}
            />
            <TeleStat
              name="MTTR"
              to="38"
              fmt="min"
              display="38m"
              trend="↓ 22% vs prior"
              path="M0 5 L20 8 L40 11 L60 14 L80 17 L100 20 L120 23"
              baseY={15}
            />
          </div>
        </div>
      </section>

      <section
        data-reveal
        style={{
          borderTop: "1px solid var(--slate)",
          borderBottom: "1px solid var(--slate)",
          background: "var(--ink)",
        }}
      >
        <div
          data-iso-grid
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "56px 28px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "48px",
          }}
        >
          {[
            ["A clean room per run", "Every agent runs in a fresh, isolated Docker container. Nothing persists between runs."],
            ["Egress-only by default", "Containers reach out, never in. Your repos and secrets stay scoped to the run."],
            ["Auth that fails closed", "Expired credentials redirect to sign-in."],
          ].map(([title, desc]) => (
            <div key={title}>
              <div style={{ fontSize: "17px", fontWeight: 600, marginBottom: "9px" }}>{title}</div>
              <div style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--muted)" }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="start"
        style={{ position: "relative", maxWidth: "1180px", margin: "0 auto", padding: "120px 28px" }}
      >
        <div data-reveal style={{ maxWidth: "600px", margin: "0 auto 40px", textAlign: "center" }}>
          <svg viewBox="0 0 120 120" width="56" height="56" fill="none" style={{ display: "block", margin: "0 auto 24px" }} aria-hidden="true">
            {mark}
          </svg>
          <h2
            style={{
              fontSize: "clamp(34px,4.4vw,56px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              fontWeight: 600,
              margin: "0 0 18px",
            }}
          >
            Authorize your first run.
          </h2>
          <p style={{ fontSize: "17px", lineHeight: 1.6, color: "var(--muted)", margin: 0 }}>
            Connect Linear and GitHub, set a leash — then authorize.
          </p>
        </div>

        <div data-reveal style={{ maxWidth: "540px", margin: "0 auto" }}>
          <div
            data-cta-card
            style={{
              border: "1px solid var(--slate)",
              borderRadius: "16px",
              background: "var(--ink)",
              boxShadow: "0 40px 90px rgba(0,0,0,0.5)",
              overflow: "hidden",
              textAlign: "left",
              transition: "border-color 0.5s ease, box-shadow 0.5s ease",
            }}
          >
            <div
              style={{
                padding: "15px 18px",
                borderBottom: "1px solid var(--slate)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  data-cta-status
                  className="rl-mono"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    color: "var(--amber)",
                    background: "rgba(232,177,76,0.13)",
                  }}
                >
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--amber)" }} />
                  waiting for authorization
                </span>
                <span className="rl-mono" style={{ fontSize: "12px", color: "var(--blue-dim)" }}>
                  YOUR-1
                </span>
              </div>
              <span data-cta-iso className="rl-mono" style={{ fontSize: "11.5px", color: "var(--muteddim)" }}>
                iso-pending
              </span>
            </div>
            <div style={{ padding: "16px 18px 6px" }}>
              <div style={{ fontSize: "13.5px", color: "var(--paper)", marginBottom: "16px" }}>
                Your first issue
              </div>
              <div data-cta-steps style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <StepRow state="pending" label="Clone repository" />
                <StepRow state="pending" label="Plan changes" />
                <StepRow state="pending" label="Apply fix" />
                <StepRow state="pending" label="Run test suite" />
                <StepRow state="pending" label="Open pull request" />
              </div>
            </div>
            <div style={{ padding: "14px 18px 16px", borderTop: "1px solid var(--slate)", marginTop: "8px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span
                  className="rl-mono"
                  style={{ fontSize: "10.5px", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muteddim)" }}
                >
                  Spend leash
                </span>
                <span className="rl-mono" style={{ fontSize: "12px", color: "var(--paper)" }}>
                  <span data-cta-spend>$0.00</span> <span style={{ color: "var(--muteddim)" }}>/ $5.00</span>
                </span>
              </div>
              <div style={{ height: "8px", borderRadius: "6px", background: "var(--void)", overflow: "hidden" }}>
                <div
                  data-cta-leash
                  style={{
                    width: "0%",
                    height: "100%",
                    background: "var(--blue)",
                    borderRadius: "6px",
                    transition: "width 0.6s cubic-bezier(.3,.85,.3,1)",
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "18px", justifyContent: "center" }}>
            <input
              data-cta-email
              type="email"
              placeholder="you@company.com"
              className="rl-mono rl-email"
              style={{
                flex: 1,
                minWidth: "240px",
                fontSize: "14px",
                color: "var(--paper)",
                background: "var(--ink)",
                border: "1px solid var(--border2)",
                borderRadius: "10px",
                padding: "14px 16px",
                outline: "none",
              }}
            />
            <button
              data-cta-run
              type="button"
              className="rl-run"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "inherit",
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--void)",
                background: "var(--blue)",
                border: "none",
                borderRadius: "10px",
                padding: "14px 24px",
                cursor: "pointer",
                boxShadow: "0 10px 30px rgba(76,141,255,0.25)",
                transition: "background 0.3s ease, opacity 0.3s ease",
              }}
            >
              Authorize &amp; run →
            </button>
          </div>
          <div
            data-cta-note
            className="rl-mono"
            style={{
              textAlign: "center",
              marginTop: "14px",
              fontSize: "12px",
              color: "var(--muteddim)",
              minHeight: "16px",
            }}
          >
            free to start · no agent runs until you authorize
          </div>
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid var(--slate)",
          background: "var(--ink)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox="0 0 120 120"
          width="420"
          height="420"
          fill="none"
          aria-hidden="true"
          style={{ position: "absolute", right: "-70px", bottom: "-150px", opacity: 0.04, pointerEvents: "none" }}
        >
          <path d="M73 24.3 A38 38 0 1 1 47 24.3" stroke="var(--paper)" strokeWidth={10} strokeLinecap="round" />
          <circle cx="60" cy="22" r="8" fill="var(--paper)" />
        </svg>

        <div style={{ position: "relative", maxWidth: "1180px", margin: "0 auto", padding: "62px 28px 0" }}>
          <div
            className="rl-mono"
            style={{ fontSize: "13px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "9px", marginBottom: "9px" }}
          >
            <span style={{ color: "var(--green-fg)" }}>~/roomba</span>
            <span style={{ color: "var(--muteddim)" }}>$</span>
            <span style={{ color: "var(--paper)" }}>roomba --help</span>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "15px",
                background: "var(--blue)",
                marginLeft: "1px",
                animation: "roomba-landing-pulse 1.1s steps(1) infinite",
              }}
            />
          </div>
          <div className="rl-mono" style={{ fontSize: "12.5px", color: "var(--muteddim)", marginBottom: "46px" }}>
            # autonomous agents that close the loop — Linear issue to isolated container
          </div>

          <div
            data-footer-grid
            style={{ display: "grid", gridTemplateColumns: "1.15fr 1.25fr 0.9fr", gap: "48px", alignItems: "start" }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <svg viewBox="0 0 120 120" width="22" height="22" fill="none" aria-label="roomba">
                  {mark}
                </svg>
                <span style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-0.03em" }}>roomba</span>
              </div>
              <div style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--muted)", maxWidth: "240px" }}>
                Set a leash, assign an issue, and watch the run resolve itself — every step
                costed and traced.
              </div>
            </div>

            <div>
              <div
                className="rl-mono"
                style={{ fontSize: "10.5px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muteddim)", marginBottom: "16px" }}
              >
                Commands
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
                {[
                  ["#start", "roomba run", "assign an issue, open a PR"],
                  ["#observability", "roomba trace", "replay any run to the cent"],
                  ["#guardrails", "roomba leash", "bound cost, iters, timeout"],
                  ["#telemetry", "roomba report", "DORA from real timestamps"],
                ].map(([href, cmd, desc]) => (
                  <a
                    key={cmd}
                    href={href}
                    className="rl-cmd"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "118px 1fr",
                      gap: "14px",
                      alignItems: "baseline",
                      textDecoration: "none",
                    }}
                  >
                    <span className="rl-mono" style={{ fontSize: "13px", color: "var(--blue-dim)" }}>
                      {cmd}
                    </span>
                    <span style={{ fontSize: "12.5px", color: "var(--muted)" }}>{desc}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div
                className="rl-mono"
                style={{ fontSize: "10.5px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muteddim)", marginBottom: "16px" }}
              >
                Resources
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
                {["--docs", "--api", "--changelog", "--status"].map((r) => (
                  <a
                    key={r}
                    href="#"
                    className="rl-mono rl-footlink"
                    style={{ fontSize: "13px", color: "var(--muted)", textDecoration: "none" }}
                  >
                    {r}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div
            className="rl-mono"
            style={{
              marginTop: "54px",
              borderTop: "1px solid var(--slate)",
              padding: "18px 0",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              fontSize: "11.5px",
              letterSpacing: "0.04em",
              color: "var(--muteddim)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", color: "var(--green-fg)" }}>
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "var(--green-fg)",
                    animation: "roomba-landing-pulse 1.8s ease-in-out infinite",
                  }}
                />
                all systems operational
              </span>
            </div>
            <span>© 2026 roomba</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepRow({
  state,
  label,
  meta,
  tag,
}: {
  state: "done" | "current" | "pending";
  label: string;
  meta?: { chip?: string; time?: string; pr?: string };
  tag?: string;
}) {
  let icon: React.ReactNode;
  let labelColor = "var(--muteddim)";
  if (state === "done") {
    labelColor = "var(--muted)";
    icon = (
      <span
        style={{
          flex: "none",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "rgba(79,208,140,0.15)",
          color: "var(--green-fg)",
          display: "grid",
          placeItems: "center",
          fontSize: "9px",
          fontWeight: 700,
        }}
      >
        ✓
      </span>
    );
  } else if (state === "current") {
    labelColor = "var(--paper)";
    icon = (
      <span
        style={{
          flex: "none",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          border: "2px solid var(--blue)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <span
          className="rl-pulse"
          style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--blue)" }}
        />
      </span>
    );
  } else {
    icon = (
      <span
        style={{ flex: "none", width: "16px", height: "16px", borderRadius: "50%", border: "1px solid var(--border2)" }}
      />
    );
  }
  const chip = meta?.chip;
  const time = meta?.time;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
      {icon}
      <span
        style={{
          fontSize: "13px",
          color: labelColor,
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: "7px",
        }}
      >
        {label}
        {tag && state === "current" && (
          <span
            className="rl-mono"
            style={{
              fontSize: "9px",
              color: "var(--amber)",
              background: "rgba(232,177,76,0.12)",
              borderRadius: "4px",
              padding: "1px 5px",
            }}
          >
            ↳ {tag}
          </span>
        )}
      </span>
      {chip && (
        <span
          className="rl-mono"
          style={{
            fontSize: "10.5px",
            color: "var(--signal)",
            background: "rgba(155,194,255,0.1)",
            borderRadius: "5px",
            padding: "2px 6px",
          }}
        >
          {chip}
        </span>
      )}
      {time && (
        <span className="rl-mono" style={{ fontSize: "11px", color: "var(--muteddim)" }}>
          {time}
        </span>
      )}
    </div>
  );
}

function TraceRow({
  tag,
  tagColor,
  tagBorder,
  title,
  fallback,
  barColor,
  left,
  width,
  cost,
}: {
  tag: string;
  tagColor: string;
  tagBorder?: string;
  title: string;
  fallback?: string;
  barColor: string;
  left: string;
  width: string;
  cost?: string;
}) {
  return (
    <div
      data-trace-row
      className="rl-trace-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "24px minmax(0,1fr) 150px 76px",
        gap: "10px",
        alignItems: "center",
      }}
    >
      <div
        className="rl-mono"
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "6px",
          background: "var(--surface2)",
          border: "1px solid " + (tagBorder || "var(--slate)"),
          display: "grid",
          placeItems: "center",
          fontSize: "8px",
          fontWeight: 700,
          color: tagColor,
        }}
      >
        {tag}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <span style={{ fontSize: "12.5px", color: "var(--paper)" }}>{title}</span>
          {fallback && (
            <span
              className="rl-mono"
              style={{
                fontSize: "9px",
                color: "var(--amber)",
                background: "rgba(232,177,76,0.12)",
                borderRadius: "4px",
                padding: "1px 5px",
              }}
            >
              ↳ {fallback}
            </span>
          )}
        </div>
      </div>
      <div
        className="rl-trace-timeline"
        style={{
          position: "relative",
          height: "18px",
          background: "var(--void)",
          borderRadius: "5px",
          border: "1px solid var(--slate)",
        }}
      >
        <div
          data-grow
          data-w={width}
          style={s({
            "--w": width,
            position: "absolute",
            top: "3px",
            bottom: "3px",
            left,
            background: barColor,
            borderRadius: "3px",
          })}
        />
      </div>
      {cost ? (
        <div style={{ textAlign: "right" }}>
          <span
            className="rl-mono"
            style={{
              fontSize: "10.5px",
              color: "var(--signal)",
              background: "rgba(155,194,255,0.1)",
              borderRadius: "5px",
              padding: "2px 6px",
            }}
          >
            {cost}
          </span>
        </div>
      ) : (
        <div className="rl-mono" style={{ textAlign: "right", fontSize: "11px", color: "var(--muteddim)" }}>
          —
        </div>
      )}
    </div>
  );
}

function LeashRow({
  name,
  value,
  width,
  color,
}: {
  name: string;
  value: string;
  width: string;
  color: string;
}) {
  return (
    <>
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "7px" }}
      >
        <span
          className="rl-mono"
          style={{ fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muteddim)" }}
        >
          {name}
        </span>
        <span className="rl-mono" style={{ fontSize: "13px", color: "var(--paper)" }}>
          {value}
        </span>
      </div>
      <div style={{ height: "9px", borderRadius: "6px", background: "var(--void)", overflow: "hidden" }}>
        <div data-grow data-w={width} style={s({ "--w": width, height: "100%", background: color, borderRadius: "6px" })} />
      </div>
    </>
  );
}

function TeleStat({
  first,
  name,
  to,
  fmt,
  display,
  trend,
  path,
  baseY,
}: {
  first?: boolean;
  name: string;
  to: string;
  fmt: string;
  display: string;
  trend: string;
  path: string;
  baseY: number;
}) {
  return (
    <div style={{ padding: "24px 22px", borderLeft: first ? undefined : "1px solid var(--slate)" }}>
      <div className="rl-mono" style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "11px" }}>
        {name}
      </div>
      <div data-countup data-to={to} data-fmt={fmt} style={{ fontSize: "28px", fontWeight: 600, letterSpacing: "-0.02em" }}>
        {display}
      </div>
      <div className="rl-mono" style={{ fontSize: "10.5px", color: "var(--green-fg)", margin: "6px 0 14px" }}>
        {trend}
      </div>
      <svg viewBox="0 0 120 28" preserveAspectRatio="none" style={{ width: "100%", height: "30px", display: "block" }}>
        <line x1="0" y1={baseY} x2="120" y2={baseY} stroke="#3A4456" strokeWidth="1" strokeDasharray="3 3" />
        <path d={path} fill="none" stroke="#4FD08C" strokeWidth="1.6" />
      </svg>
    </div>
  );
}
