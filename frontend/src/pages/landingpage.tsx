import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    motion, useScroll, useTransform, useSpring,
    useInView, useMotionValue, useAnimationFrame, animate,
    Variants
} from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   MORPHEUS  ·  Enterprise SaaS — Unique Editorial Direction
   
   Concept : "The Verification Layer" — dark, authoritative, precise.
             Light cream on near-black. Strong typographic hierarchy.
             Generous white space. Surgical teal accents only where earned.
   Fonts   : Cormorant Garamond (headline — luxury serif)
             + Outfit (body — clean geometric)
   Motion  : Framer Motion — magnetic buttons, parallax, letter reveals,
             scroll-scrubbed lines, viewport stagger
───────────────────────────────────────────────────────────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --ink:    #07080f;
  --ink2:   #0e1020;
  --ink3:   #151829;
  --cream:  #eeeae3;
  --cream2: #c8c4bc;
  --dim:    #4a4d60;
  --dim2:   #6b6f85;
  --teal:   #19e3c0;
  --teal2:  #0cbfa0;
  --teal-g: rgba(25,227,192,.18);
  --line:   rgba(255,255,255,.065);
  --line2:  rgba(255,255,255,.11);
}

html{ scroll-behavior:smooth }

body{
  background: var(--ink);
  color: var(--cream);
  font-family:'Outfit','DM Sans',sans-serif;
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
}

.display{ font-family:'Cormorant Garamond',Georgia,serif }

/* scrollbar */
::-webkit-scrollbar{width:2px}
::-webkit-scrollbar-track{background:var(--ink)}
::-webkit-scrollbar-thumb{background:#1e2238}

/* noise layer */
.noise{
  position:fixed;inset:0;pointer-events:none;z-index:998;
  opacity:.025;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")
}

/* ticker */
.ticker-wrap{overflow:hidden;width:100%;mask-image:linear-gradient(90deg,transparent,black 8%,black 92%,transparent)}
.ticker-track{
  display:flex;width:max-content;
  animation:tick 36s linear infinite;
}
@keyframes tick{
  from{transform:translateX(0)}
  to{transform:translateX(-50%)}
}

/* grid bg */
.grid-ink{
  background-image:
    linear-gradient(rgba(25,227,192,.018) 1px,transparent 1px),
    linear-gradient(90deg,rgba(25,227,192,.018) 1px,transparent 1px);
  background-size:90px 90px;
}

/* scan line */
@keyframes scan{
  0%{top:-30%;opacity:0}10%{opacity:1}90%{opacity:1}100%{top:130%;opacity:0}
}

/* float */
@keyframes flt{0%,100%{transform:translateY(0)}50%{transform:translateY(-11px)}}
@keyframes flt2{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
.flt{animation:flt 5.5s ease-in-out infinite}
.flt2{animation:flt2 7s ease-in-out infinite 1.6s}

/* glow */
@keyframes glow{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.55;transform:scale(1.06)}}

/* marquee mask */
.marquee-mask{
  mask-image:linear-gradient(90deg,transparent 0%,black 12%,black 88%,transparent 100%);
}

/* line draw */
@keyframes drawLine{from{scaleX:0}to{scaleX:1}}

/* blink */
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
`;

/* ── Spring configs ── */
const SP = { stiffness: 90, damping: 24, mass: 1 };
const SP_FAST = { stiffness: 160, damping: 30 };

/* ── Viewport reveal ── */
function FadeUp({ children, delay = 0, y = 32, once = true, style = {} }: any) {
    const ref = useRef(null);
    const inView = useInView(ref, { once, margin: "-70px" });
    return (
        <motion.div ref={ref}
            initial={{ opacity: 0, y }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
            style={style}
        >{children}</motion.div>
    );
}

/* ── Stagger container ── */
function Stagger({ children, delay = 0, gap = 0.1 }: any) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div ref={ref}
            initial="h" animate={inView ? "v" : "h"}
            variants={{ h: {}, v: { transition: { staggerChildren: gap, delayChildren: delay } } }}
        >{children}</motion.div>
    );
}
const V: Variants = {
    h: { opacity: 0, y: 26 },
    v: { opacity: 1, y: 0, transition: { duration: 0.78, ease: [0.16, 1, 0.3, 1] } },
};

/* ── Magnetic button ── */
function MagBtn({ children, primary = false, style = {}, onClick, ...props }: any) {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, SP_FAST);
    const sy = useSpring(y, SP_FAST);

    const handleMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        x.set((e.clientX - cx) * 0.28);
        y.set((e.clientY - cy) * 0.28);
    };
    const reset = () => { x.set(0); y.set(0); };

    return (
        <motion.button ref={ref}
            onMouseMove={handleMove} onMouseLeave={reset}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            style={{
                x: sx, y: sy,
                padding: primary ? "13px 32px" : "12px 28px",
                borderRadius: 10,
                fontSize: 13.5, fontWeight: 500, fontFamily: "Outfit, sans-serif",
                letterSpacing: "-.01em", cursor: "pointer", border: "none",
                background: primary ? "var(--teal)" : "transparent",
                color: primary ? "var(--ink)" : "var(--dim2)",
                outline: primary ? "none" : "1px solid var(--line2)",
                boxShadow: primary ? "0 4px 28px var(--teal-g)" : "none",
                transition: "background .2s, color .2s, outline-color .2s, box-shadow .2s",
                ...style,
            }}
            onMouseEnter={(e) => {
                if (!primary) {
                    e.currentTarget.style.color = "var(--cream)";
                    e.currentTarget.style.outlineColor = "rgba(25,227,192,.3)";
                } else {
                    e.currentTarget.style.background = "#3fffd8";
                    e.currentTarget.style.boxShadow = "0 6px 36px var(--teal-g)";
                }
            }}
            {...props}
        >{children}</motion.button>
    );
}

/* ── Animated counter ── */
function Num({ to, suffix = "" }: { to: number; suffix?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const [v, setV] = useState(0);
    useEffect(() => {
        if (!inView) return;
        const c = animate(0, to, { duration: 1.9, ease: [0.25, 0.46, 0.45, 0.94], onUpdate: (n) => setV(Math.round(n)) });
        return c.stop;
    }, [inView, to]);
    return <span ref={ref}>{v}{suffix}</span>;
}

/* ─── Nav ──────────────────────────────────────────────────────────────────── */
function Nav() {
    const [sc, setSc] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const fn = () => setSc(window.scrollY > 40);
        window.addEventListener("scroll", fn);
        return () => window.removeEventListener("scroll", fn);
    }, []);

    return (
        <motion.nav
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 500, height: 62,
                display: "flex", alignItems: "center", padding: "0 3rem",
                background: sc ? "rgba(7,8,15,.92)" : "transparent",
                backdropFilter: sc ? "blur(22px) saturate(160%)" : "none",
                borderBottom: sc ? "1px solid var(--line)" : "none",
                transition: "all .4s cubic-bezier(.4,0,.2,1)",
            }}
        >
            <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {/* Logo */}
                <motion.div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} whileHover={{ opacity: .85 }}>
                    <svg width="26" height="26" viewBox="0 0 26 26">
                        <rect width="26" height="26" rx="7" fill="var(--teal)" />
                        <circle cx="13" cy="13" r="4.5" fill="var(--ink)" />
                        <circle cx="13" cy="13" r="2" fill="var(--teal)" />
                    </svg>
                    <span className="display" style={{ fontSize: 20, fontWeight: 500, color: "var(--cream)", letterSpacing: "-.01em" }}>Morpheus</span>
                </motion.div>

                {/* Links */}
                <div style={{ display: "flex", gap: 2 }}>
                    {["Platform", "How it works", "Tutors", "Pricing"].map(l => (
                        <motion.button key={l} whileHover={{ color: "var(--cream)" }}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "7px 15px", fontSize: 13.5, color: "var(--dim2)", fontFamily: "Outfit, sans-serif", fontWeight: 400, letterSpacing: "-.01em" }}
                        >{l}</motion.button>
                    ))}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <motion.button whileHover={{ color: "var(--cream)" }}
                        onClick={() => navigate("/login")}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13.5, color: "var(--dim2)", padding: "7px 14px", fontFamily: "Outfit, sans-serif" }}
                    >Sign in</motion.button>
                    <MagBtn primary onClick={() => navigate("/signup")}>Get started</MagBtn>
                </div>
            </div>
        </motion.nav>
    );
}

/* ─── Hero ────────────────────────────────────────────────────────────────── */
function Hero() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, -80]);
    const op = useTransform(scrollY, [0, 380], [1, 0]);
    const navigate = useNavigate();

    /* Animated score counter */
    const [score, setScore] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => {
            const c = animate(0, 87, { duration: 2.4, ease: [0.25, 0.46, 0.45, 0.94], onUpdate: n => setScore(Math.round(n)) });
            return c.stop;
        }, 900);
        return () => clearTimeout(t);
    }, []);

    return (
        <motion.section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "110px 3rem 80px" }}>
            {/* Grid */}
            <div className="grid-ink" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

            {/* Radial spotlight */}
            <div style={{ position: "absolute", top: "38%", right: "22%", transform: "translate(50%,-50%)", width: 760, height: 760, borderRadius: "50%", background: "radial-gradient(circle,rgba(25,227,192,.07) 0%,transparent 60%)", animation: "glow 5s ease-in-out infinite", pointerEvents: "none" }} />

            {/* Thin horizontal rules */}
            {[28, 56].map(pct => (
                <motion.div key={pct}
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                    transition={{ duration: 1.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ position: "absolute", top: `${pct}%`, left: 0, right: 0, height: 1, background: `rgba(25,227,192,${pct === 28 ? .05 : .03})`, transformOrigin: "left" }}
                />
            ))}

            <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
                <motion.div style={{ y: y1, opacity: op }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
                        {/* Left */}
                        <div>
                            {/* Eyebrow */}
                            <motion.div
                                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 36 }}
                            >
                                <motion.span
                                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                                    style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", display: "block", boxShadow: "0 0 8px var(--teal)" }}
                                />
                                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--teal)", letterSpacing: ".1em", textTransform: "uppercase" }}>
                                    AI-Verified Tutoring Platform
                                </span>
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                className="display"
                                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                style={{ fontSize: "clamp(52px,5.8vw,88px)", fontWeight: 300, lineHeight: 1.02, letterSpacing: "-.03em", marginBottom: 28, color: "var(--cream)" }}
                            >
                                The tutoring<br />
                                platform that<br />
                                <em style={{ fontStyle: "italic", color: "var(--teal)", fontWeight: 400 }}>verifies first.</em>
                            </motion.h1>

                            {/* Body */}
                            <motion.p
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.75, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                style={{ fontSize: 16, color: "var(--dim2)", lineHeight: 1.8, maxWidth: 420, marginBottom: 44, fontWeight: 300 }}
                            >
                                Every tutor on Morpheus has passed a Groq AI competence test and manual admin review. No shortcuts. Just qualified educators.
                            </motion.p>

                            {/* Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65, delay: 0.33, ease: [0.16, 1, 0.3, 1] }}
                                style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
                            >
                                <MagBtn primary onClick={() => navigate("/signup")}>Start learning free</MagBtn>
                                <MagBtn onClick={() => navigate("/signup")}>Apply as tutor →</MagBtn>
                            </motion.div>

                            {/* Proof row */}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.55 }}
                                style={{ marginTop: 52, display: "flex", gap: 40, alignItems: "center" }}
                            >
                                {[["500+", "Verified tutors"], ["10k+", "Sessions"], ["4.9", "Avg rating"]].map(([v, l]) => (
                                    <div key={l}>
                                        <div className="display" style={{ fontSize: 26, fontWeight: 400, color: "var(--cream)", lineHeight: 1 }}>{v}</div>
                                        <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 4, letterSpacing: ".03em" }}>{l}</div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Right — Dashboard card cluster */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            style={{ position: "relative", height: 480 }}
                        >
                            {/* Glow */}
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(25,227,192,.1) 0%,transparent 65%)", animation: "glow 4.5s ease-in-out infinite", pointerEvents: "none" }} />

                            {/* Main card */}
                            <div className="flt" style={{
                                position: "absolute", top: "50%", left: "50%", transform: "translate(-46%,-50%)",
                                width: 294, padding: "22px", borderRadius: 20,
                                background: "var(--ink3)", border: "1px solid var(--line2)",
                                boxShadow: "0 40px 100px rgba(0,0,0,.7), 0 0 0 1px rgba(25,227,192,.07)",
                                overflow: "hidden",
                            }}>
                                <div style={{ position: "absolute", left: 0, right: 0, height: 70, background: "linear-gradient(180deg,transparent,rgba(25,227,192,.04),transparent)", animation: "scan 3.8s ease-in-out infinite 1s", pointerEvents: "none" }} />

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--dim)", letterSpacing: ".1em", textTransform: "uppercase" }}>Competence Score</div>
                                    {score >= 70 && (
                                        <motion.div initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }}
                                            style={{ fontSize: 9.5, fontWeight: 700, color: "var(--teal)", background: "rgba(25,227,192,.08)", border: "1px solid rgba(25,227,192,.18)", padding: "3px 9px", borderRadius: 5, letterSpacing: ".07em" }}
                                        >PASSED</motion.div>
                                    )}
                                </div>

                                <div className="display" style={{ fontSize: 64, lineHeight: 1, color: "var(--cream)", marginBottom: 4 }}>
                                    {score}<span style={{ fontSize: 22, color: "var(--dim)" }}>/100</span>
                                </div>

                                <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,.05)", marginBottom: 20, overflow: "hidden" }}>
                                    <motion.div
                                        initial={{ width: 0 }} animate={{ width: `${score}%` }}
                                        transition={{ duration: 2.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.9 }}
                                        style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg,var(--teal2),var(--teal))", boxShadow: "0 0 12px rgba(25,227,192,.5)" }}
                                    />
                                </div>

                                {[["Physics", 92], ["Mathematics", 85], ["Chemistry", 78]].map(([s, v], i) => (
                                    <div key={s as string} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                                        <span style={{ fontSize: 11.5, color: "var(--dim2)", width: 90 }}>{s}</span>
                                        <div style={{ flex: 1, height: 2.5, borderRadius: 2, background: "rgba(255,255,255,.05)", overflow: "hidden" }}>
                                            <motion.div
                                                initial={{ width: 0 }} animate={{ width: `${v}%` }}
                                                transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 1 + i * 0.1 }}
                                                style={{ height: "100%", borderRadius: 2, background: (v as number) >= 85 ? "var(--teal)" : "#4d7fff" }}
                                            />
                                        </div>
                                        <span style={{ fontSize: 10.5, color: "var(--dim)", width: 22, textAlign: "right" }}>{v}</span>
                                    </div>
                                ))}

                                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--dim)" }}>
                                    <span>Morpheus AI</span>
                                    <span style={{ color: "var(--teal)", cursor: "pointer" }}>View report →</span>
                                </div>
                            </div>

                            {/* Card — Connection */}
                            <div className="flt2" style={{ position: "absolute", top: 38, right: 0, width: 172, padding: "14px 16px", borderRadius: 14, background: "var(--ink2)", border: "1px solid var(--line2)", boxShadow: "0 20px 50px rgba(0,0,0,.55)" }}>
                                <div style={{ fontSize: 9.5, color: "var(--dim)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>New match</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#0d2a3e,#082b20)", border: "1px solid rgba(25,227,192,.14)", display: "grid", placeItems: "center" }}>
                                        <div className="display" style={{ fontSize: 14, color: "var(--teal)", fontStyle: "italic" }}>P</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--cream)" }}>Priya S.</div>
                                        <div style={{ fontSize: 10, color: "var(--teal)", marginTop: 1 }}>★ 4.9 · Physics</div>
                                    </div>
                                </div>
                            </div>

                            {/* Card — Live session */}
                            <div className="flt" style={{ position: "absolute", bottom: 52, left: 0, width: 160, padding: "14px 16px", borderRadius: 14, background: "var(--ink2)", border: "1px solid var(--line2)", boxShadow: "0 20px 50px rgba(0,0,0,.55)", animationDelay: ".9s" }}>
                                <div style={{ fontSize: 9.5, color: "var(--dim)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 9, fontWeight: 600 }}>Live now</div>
                                <div className="display" style={{ fontSize: 15, color: "var(--cream)", lineHeight: 1.3 }}>Quantum<br />Mechanics</div>
                                <div style={{ marginTop: 9, display: "flex", alignItems: "center", gap: 6 }}>
                                    <motion.div animate={{ opacity: [1, .25, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                                        style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--teal)" }}
                                    />
                                    <span style={{ fontSize: 10, color: "var(--teal)" }}>Today 5:00 PM</span>
                                </div>
                            </div>

                            {/* Corner dot grid */}
                            <div style={{ position: "absolute", bottom: 16, right: 4, display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 5, opacity: .25 }}>
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div key={i} style={{ width: 2.5, height: 2.5, borderRadius: "50%", background: "var(--teal)" }} />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );
}

/* ─── Ticker ─────────────────────────────────────────────────────────────────── */
function Ticker() {
    const items = ["AI Competence Testing", "Groq-Powered Verification", "Real-time Sessions", "Admin Review Layer", "Live Chat", "Subject Discovery", "Video Calls", "Connection Management", "Progress Analytics", "Secure Platform"];
    const d = [...items, ...items];
    return (
        <div style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "14px 0" }}>
            <div className="ticker-wrap">
                <div className="ticker-track">
                    {d.map((it, i) => (
                        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 24, marginRight: 52 }}>
                            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--dim)", letterSpacing: ".08em", textTransform: "uppercase" }}>{it}</span>
                            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--teal)", display: "inline-block", opacity: .45 }} />
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Bento Features ────────────────────────────────────────────────────────── */
function BentoFeatures() {
    const bigCards = [
        { tag: "Verification", title: "AI tests every tutor before you see them", body: "Groq powers a subject-specific MCQ assessment. Only educators scoring 70%+ reach the platform. Followed by manual admin review.", span: 2 },
        { tag: "Discovery", title: "Find your perfect match", body: "Filter by subject, level, city, and verified rating.", span: 1 },
    ];

    const smCards = [
        { tag: "Trust", title: "Dual-layer verification", body: "AI test + human review. Two gates, not one." },
        { tag: "Communication", title: "Real-time chat", body: "Socket-powered messaging, no third-party apps." },
        { tag: "Sessions", title: "Integrated video", body: "Schedule, join, and replay sessions in one click." },
        { tag: "Platform", title: "Connection management", body: "Structured request and acceptance flow." },
    ];

    return (
        <section style={{ padding: "120px 3rem", background: "var(--ink2)" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <Stagger gap={0.08}>
                    <motion.div variants={V} style={{ fontSize: 11, fontWeight: 600, color: "var(--teal)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 18 }}>Platform</motion.div>
                    <motion.h2 variants={V} className="display" style={{ fontSize: "clamp(38px,4.2vw,62px)", lineHeight: 1.05, letterSpacing: "-.025em", maxWidth: 580, marginBottom: 72, fontWeight: 300 }}>
                        Every feature built<br />around <em style={{ fontStyle: "italic", color: "var(--teal)", fontWeight: 400 }}>verified quality.</em>
                    </motion.h2>
                </Stagger>

                {/* Top row — 2+1 */}
                <Stagger gap={0.09}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12 }}>
                        {bigCards.map(c => (
                            <motion.div key={c.title} variants={V}
                                whileHover={{ borderColor: "rgba(25,227,192,.2)", background: "rgba(25,227,192,.022)" }}
                                style={{ padding: "40px 38px", borderRadius: 18, background: "var(--ink3)", border: "1px solid var(--line)", transition: "all .3s", cursor: "default" }}
                            >
                                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--teal)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 18, opacity: .7 }}>{c.tag}</div>
                                <div className="display" style={{ fontSize: 22, lineHeight: 1.25, marginBottom: 12, fontWeight: 400, letterSpacing: "-.01em" }}>{c.title}</div>
                                <p style={{ fontSize: 14, color: "var(--dim2)", lineHeight: 1.7, fontWeight: 300 }}>{c.body}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom row — 4 equal */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                        {smCards.map(c => (
                            <motion.div key={c.title} variants={V}
                                whileHover={{ borderColor: "rgba(25,227,192,.2)", y: -3 }}
                                style={{ padding: "30px 26px", borderRadius: 16, background: "var(--ink3)", border: "1px solid var(--line)", transition: "all .28s", cursor: "default" }}
                            >
                                <div style={{ fontSize: 9.5, fontWeight: 700, color: "var(--teal)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 14, opacity: .65 }}>{c.tag}</div>
                                <div className="display" style={{ fontSize: 18, marginBottom: 8, fontWeight: 400 }}>{c.title}</div>
                                <p style={{ fontSize: 13, color: "var(--dim2)", lineHeight: 1.65, fontWeight: 300 }}>{c.body}</p>
                            </motion.div>
                        ))}
                    </div>
                </Stagger>
            </div>
        </section>
    );
}

/* ─── Process ─────────────────────────────────────────────────────────────────── */
function Process() {
    const steps = [
        { n: "01", title: "Create your account", body: "Sign up as student or tutor. Verify your email to unlock the platform." },
        { n: "02", title: "Complete your profile", body: "Add subjects, education, and upload credentials for admin review." },
        { n: "03", title: "Pass the AI test", body: "Tutors take a Groq-powered subject test. Score 70%+ to proceed." },
        { n: "04", title: "Go live instantly", body: "Admin approves your profile. Start accepting students the same day." },
    ];

    return (
        <section style={{ padding: "130px 3rem" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 100, alignItems: "start" }}>
                    {/* Left */}
                    <div style={{ position: "sticky", top: 100 }}>
                        <FadeUp>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--teal)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 20 }}>Process</div>
                            <h2 className="display" style={{ fontSize: "clamp(34px,3.5vw,56px)", lineHeight: 1.08, letterSpacing: "-.025em", marginBottom: 20, fontWeight: 300 }}>
                                Live in<br /><em style={{ color: "var(--teal)", fontWeight: 400 }}>four steps.</em>
                            </h2>
                            <p style={{ fontSize: 15, color: "var(--dim2)", lineHeight: 1.78, maxWidth: 300, fontWeight: 300 }}>
                                Morpheus is built for speed without sacrificing quality. Tutors go from signup to first student in under 48 hours.
                            </p>
                        </FadeUp>

                        {/* Stat grid */}
                        <Stagger delay={0.15} gap={0.09}>
                            <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                {[["500+", "Verified tutors"], ["10k+", "Sessions"], ["4.9", "Avg rating"], ["< 48h", "Approval"]].map(([v, l]) => (
                                    <motion.div key={l} variants={V}
                                        whileHover={{ borderColor: "rgba(25,227,192,.2)", y: -2 }}
                                        style={{ padding: "18px 20px", borderRadius: 13, background: "var(--ink2)", border: "1px solid var(--line)", transition: "all .25s" }}
                                    >
                                        <div className="display" style={{ fontSize: 26, fontWeight: 400, color: "var(--cream)", lineHeight: 1 }}>{v}</div>
                                        <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 5 }}>{l}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </Stagger>
                    </div>

                    {/* Right steps */}
                    <Stagger gap={0.12}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {steps.map((s, i) => (
                                <motion.div key={s.n} variants={V}
                                    whileHover={{ x: 8, borderColor: "rgba(25,227,192,.15)", background: "rgba(25,227,192,.02)" }}
                                    style={{ display: "flex", gap: 28, padding: "32px 28px", borderRadius: 16, border: "1px solid transparent", transition: "all .25s", cursor: "default", position: "relative" }}
                                >
                                    {/* Vertical connector */}
                                    {i < steps.length - 1 && (
                                        <div style={{ position: "absolute", left: 43, bottom: -20, width: 1, height: 40, background: "linear-gradient(180deg,var(--line2),transparent)" }} />
                                    )}
                                    <div className="display" style={{ fontSize: 13, color: "var(--dim)", fontStyle: "italic", paddingTop: 3, minWidth: 26, flexShrink: 0 }}>{s.n}</div>
                                    <div>
                                        <div className="display" style={{ fontSize: 21, marginBottom: 9, fontWeight: 400, letterSpacing: "-.01em" }}>{s.title}</div>
                                        <p style={{ fontSize: 14, color: "var(--dim2)", lineHeight: 1.7, fontWeight: 300 }}>{s.body}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Stagger>
                </div>
            </div>
        </section>
    );
}

/* ─── Testimonials ─────────────────────────────────────────────────────────── */
function Wall() {
    const quotes = [
        { name: "Arjun M.", role: "B.Tech, IIT Bombay", q: "Found a Physics tutor in 10 minutes. The AI-tested quality gave me confidence from day one." },
        { name: "Neha R.", role: "Tutor — Mathematics", q: "The AI test made me take my expertise seriously. The platform is exceptional." },
        { name: "Rohit P.", role: "Parent, Pune", q: "My son went from failing to scoring 88% in Chemistry in two months." },
        { name: "Anjali K.", role: "B.Sc, Mumbai University", q: "Seamless sessions and in-platform chat. No more WhatsApp chaos." },
    ];

    return (
        <section style={{ padding: "120px 3rem", background: "var(--ink2)" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <Stagger gap={0.07}>
                    <motion.div variants={V} style={{ textAlign: "center", marginBottom: 18 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--teal)", letterSpacing: ".14em", textTransform: "uppercase" }}>Testimonials</span>
                    </motion.div>
                    <motion.h2 variants={V} className="display" style={{ fontSize: "clamp(34px,3.8vw,58px)", textAlign: "center", lineHeight: 1.08, letterSpacing: "-.025em", marginBottom: 72, fontWeight: 300 }}>
                        Trusted by students<br />and tutors alike.
                    </motion.h2>
                </Stagger>

                <Stagger gap={0.1}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
                        {quotes.map((q) => (
                            <motion.div key={q.name} variants={V}
                                whileHover={{ borderColor: "rgba(25,227,192,.18)", y: -3, boxShadow: "0 28px 70px rgba(0,0,0,.45)" }}
                                style={{ padding: "34px 32px", borderRadius: 18, background: "var(--ink3)", border: "1px solid var(--line)", transition: "all .28s", cursor: "default" }}
                            >
                                {/* Quote mark */}
                                <div className="display" style={{ fontSize: 52, color: "rgba(25,227,192,.15)", lineHeight: 1, marginBottom: 4, fontStyle: "italic" }}>"</div>
                                <p className="display" style={{ fontSize: 17, color: "var(--cream)", lineHeight: 1.72, marginBottom: 28, fontStyle: "italic", fontWeight: 300 }}>
                                    {q.q}
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,var(--ink3),var(--ink2))", border: "1px solid var(--line2)", display: "grid", placeItems: "center" }}>
                                        <div className="display" style={{ fontSize: 15, color: "var(--teal)", fontStyle: "italic" }}>{q.name[0]}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--cream)" }}>{q.name}</div>
                                        <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 2 }}>{q.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Stagger>
            </div>
        </section>
    );
}

/* ─── CTA Section ─────────────────────────────────────────────────────────── */
function CTASection() {
    const navigate = useNavigate();
    return (
        <section style={{ padding: "0 3rem 120px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <FadeUp y={20}>
                    <div style={{
                        borderRadius: 24, position: "relative", overflow: "hidden",
                        background: "var(--ink2)", border: "1px solid var(--line2)",
                        padding: "100px 90px",
                        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center",
                    }}>
                        {/* Mesh glow */}
                        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 50%,rgba(25,227,192,.07) 0%,transparent 55%)", pointerEvents: "none" }} />
                        {/* Top accent line */}
                        <motion.div
                            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                            style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(25,227,192,.3),transparent)", transformOrigin: "left" }}
                        />

                        <div style={{ position: "relative" }}>
                            <h2 className="display" style={{ fontSize: "clamp(36px,3.8vw,58px)", lineHeight: 1.07, letterSpacing: "-.025em", marginBottom: 18, fontWeight: 300 }}>
                                Ready to learn from<br />the <em style={{ color: "var(--teal)", fontWeight: 400 }}>verified best?</em>
                            </h2>
                            <p style={{ fontSize: 15.5, color: "var(--dim2)", lineHeight: 1.78, fontWeight: 300 }}>
                                Join thousands of students learning with AI-tested, admin-verified tutors. No credit card needed to start.
                            </p>
                        </div>

                        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12, maxWidth: 240, marginLeft: "auto" }}>
                            <MagBtn primary style={{ textAlign: "center" }} onClick={() => navigate("/signup")}>Start learning — it's free</MagBtn>
                            <MagBtn style={{ textAlign: "center" }} onClick={() => navigate("/signup")}>Apply as a tutor</MagBtn>
                            <p style={{ fontSize: 11.5, color: "var(--dim)", textAlign: "center", marginTop: 4 }}>No credit card required</p>
                        </div>
                    </div>
                </FadeUp>
            </div>
        </section>
    );
}

/* ─── Footer ─────────────────────────────────────────────────────────────────── */
function Footer() {
    return (
        <footer style={{ borderTop: "1px solid var(--line)", padding: "38px 3rem" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <svg width="22" height="22" viewBox="0 0 26 26"><rect width="26" height="26" rx="6" fill="var(--teal)" /><circle cx="13" cy="13" r="4.5" fill="var(--ink)" /><circle cx="13" cy="13" r="2" fill="var(--teal)" /></svg>
                    <span className="display" style={{ fontSize: 17, fontWeight: 400, color: "var(--cream)" }}>Morpheus</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--dim)", letterSpacing: ".02em" }}>© 2026 Morpheus Technologies. AI-powered tutoring.</p>
                <div style={{ display: "flex", gap: 26 }}>
                    {["Privacy", "Terms", "Contact", "Blog"].map(l => (
                        <motion.span key={l} whileHover={{ color: "var(--cream2)" }}
                            style={{ fontSize: 12, color: "var(--dim)", cursor: "pointer", transition: "color .2s" }}
                        >{l}</motion.span>
                    ))}
                </div>
            </div>
        </footer>
    );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 32 });

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />
            <div className="noise" />

            {/* Progress bar */}
            <motion.div style={{
                position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 600,
                background: "linear-gradient(90deg,var(--teal2),var(--teal))",
                transformOrigin: "0%", scaleX,
                boxShadow: "0 0 10px rgba(25,227,192,.6)",
            }} />

            <Nav />
            <Hero />
            <Ticker />
            <BentoFeatures />

            {/* thin divider */}
            <div style={{ maxWidth: 1200, margin: "0 auto", height: 1, background: "linear-gradient(90deg,transparent,var(--line2) 30%,var(--line2) 70%,transparent)" }} />

            <Process />
            <Wall />
            <CTASection />
            <Footer />
        </>
    );
}