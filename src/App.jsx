import { useEffect, useState } from "react";
import { DEFAULT_PROFILE, DEFAULT_PROGRESS, NAV_ITEMS } from "./data.js";
import AgentIntro from "./components/AgentIntro.jsx";
import MissionControl from "./components/MissionControl.jsx";
import StorySections from "./components/StorySections.jsx";

const PROFILE_KEY = "secret-agent-gf-profile-v1";
const PROGRESS_KEY = "secret-agent-gf-progress-v1";

function readSaved(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value && typeof value === "object" ? value : fallback;
  } catch {
    return fallback;
  }
}

function useSavedState(key, fallback) {
  const [value, setValue] = useState(() => readSaved(key, fallback));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The app remains usable if browser storage is unavailable or full.
    }
  }, [key, value]);
  return [value, setValue];
}

function makeAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  return AudioContextClass ? new AudioContextClass() : null;
}

function playEffect(enabled, type) {
  if (!enabled) return;
  const context = makeAudioContext();
  if (!context) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const frequencies = type === "success" ? [523, 659, 784] : type === "error" ? [210, 170] : [440];
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequencies[0], context.currentTime);
  frequencies.slice(1).forEach((frequency, index) => {
    oscillator.frequency.setValueAtTime(frequency, context.currentTime + (index + 1) * 0.09);
  });
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.42);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.45);
  oscillator.onended = () => context.close();
}

function ParticleField() {
  return (
    <div className="particle-field" aria-hidden="true">
      {Array.from({ length: 28 }, (_, index) => (
        <i key={index} style={{
          "--particle-left": `${(index * 43 + 11) % 100}%`,
          "--particle-size": `${7 + (index % 4) * 3}px`,
          "--particle-duration": `${13 + (index % 8) * 2}s`,
          "--particle-delay": `${index * -1.13}s`,
        }}>✦</i>
      ))}
    </div>
  );
}

function SectionNav({ active, onNavigate }) {
  return (
    <nav className="section-nav" aria-label="Dossier sections">
      {NAV_ITEMS.map(([id, label, number]) => (
        <a className={active === id ? "active" : ""} href={`#${id}`} key={id} onClick={() => onNavigate(id)}>
          <span>{number}</span>{label}
        </a>
      ))}
    </nav>
  );
}

export default function App() {
  const [profile, setProfile] = useSavedState(PROFILE_KEY, DEFAULT_PROFILE);
  const [progress, setProgress] = useSavedState(PROGRESS_KEY, DEFAULT_PROGRESS);
  const [activeSection, setActiveSection] = useState("home");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const ids = NAV_ITEMS.map(([id]) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: "-20% 0px -62% 0px", threshold: [0, 0.15, 0.4] });
    ids.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [progress.accepted]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function updateProfile(field, value) {
    setProfile((saved) => ({ ...saved, [field]: value }));
  }

  function updateProgress(update) {
    setProgress((saved) => typeof update === "function" ? update(saved) : { ...saved, ...update });
  }

  function acceptMission() {
    updateProgress((saved) => ({ ...saved, accepted: true, declined: false }));
    playEffect(soundEnabled, "success");
    document.body.classList.add("mission-entered");
  }

  function declineMission() {
    updateProgress((saved) => ({ ...saved, declined: true }));
    playEffect(soundEnabled, "error");
  }

  function resetMissions() {
    if (!window.confirm("Restart the secret-agent missions? Your profile, calendar, garden, and letters will stay saved.")) return;
    updateProgress((saved) => ({
      ...saved,
      accepted: false,
      declined: false,
      completed: 0,
      evidence: [],
      memoryStep: 0,
      openedGifts: [],
      treasureOpened: false,
    }));
    setNotice("Mission file reset. Your other keepsakes are safe.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <ParticleField />
      {!progress.accepted && (
        <AgentIntro
          name={profile.girlfriend || DEFAULT_PROFILE.girlfriend}
          declined={progress.declined}
          onAccept={acceptMission}
          onDecline={declineMission}
        />
      )}
      <div className={`app-shell ${progress.accepted ? "is-active" : "is-locked"}`}>
        <header className="topbar">
          <a className="brand-lockup" href="#home" onClick={() => setActiveSection("home")} aria-label="Romantic Intelligence Agency home">
            <span className="brand-seal">R<span>♥</span></span>
            <span><b>R.I.A.</b><small>ROMANTIC INTELLIGENCE AGENCY</small></span>
          </a>
          <div className="topbar-status"><i /> ENCRYPTED CONNECTION <span>·</span> FILE 0143</div>
          <div className="topbar-actions">
            <button className={`sound-toggle ${soundEnabled ? "enabled" : ""}`} onClick={() => setSoundEnabled((value) => !value)} aria-pressed={soundEnabled}>
              <span>{soundEnabled ? "◖))" : "◖×"}</span> SFX {soundEnabled ? "ON" : "OFF"}
            </button>
            <button className="restart-button" onClick={resetMissions} title="Restart missions">↻ <span>RESTART</span></button>
          </div>
        </header>

        <SectionNav active={activeSection} onNavigate={setActiveSection} />

        <main>
          <section className="home-section page-section" id="home">
            <div className="hero-copy">
              <p className="eyebrow"><span className="status-dot" /> PERSONAL FILE · CLEARANCE: HEART</p>
              <h1>Welcome to the<br /><em>World of {profile.boyfriend || DEFAULT_PROFILE.boyfriend} and {profile.girlfriend || DEFAULT_PROFILE.girlfriend}</em></h1>
              <p className="hero-description">A top-secret little corner of the universe, made for one very special agent. Follow the clues, open the memories, and take your time. There is no pressure and no wrong way to explore.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#games">ENTER FIELD OPERATIONS <span>↗</span></a>
                <a className="text-link" href="#memories">Browse the evidence <span>↓</span></a>
              </div>
              <div className="hero-stats">
                <div><strong>{String(progress.completed).padStart(2, "0")}<small>/05</small></strong><span>MISSIONS SECURED</span></div>
                <div><strong>{String(progress.evidence.length).padStart(2, "0")}<small>/05</small></strong><span>CLUES RECOVERED</span></div>
                <div><strong>{String(progress.calendar.length).padStart(2, "0")}</strong><span>SPECIAL DATES</span></div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="orbit orbit-one" /><div className="orbit orbit-two" />
              <div className="hero-photo-frame">
                <img src="/photos/lakshita.jpeg" alt={`${profile.girlfriend}, the lead agent`} />
                <span className="photo-corner corner-a" /><span className="photo-corner corner-b" />
                <div className="photo-caption"><span>SUBJECT: {profile.girlfriend.toUpperCase()}</span><b>the heart of the operation</b></div>
              </div>
              <span className="floating-stamp">TOP<br />SECRET</span>
              <span className="hero-spark">✦</span>
              <span className="hero-serial">RIA / 14.03 / ALWAYS</span>
            </div>
            <div className="scroll-cue"><span /> SCROLL TO DECLASSIFY</div>
          </section>

          <StorySections
            profile={profile}
            progress={progress}
            updateProfile={updateProfile}
            updateProgress={updateProgress}
            onSfx={(type) => playEffect(soundEnabled, type)}
            onNotice={setNotice}
            gamesContent={
              <MissionControl
                profile={{ ...profile, girlfriend: profile.girlfriend || DEFAULT_PROFILE.girlfriend, boyfriend: profile.boyfriend || DEFAULT_PROFILE.boyfriend }}
                progress={progress}
                onAccept={acceptMission}
                onDecline={declineMission}
                onUpdate={updateProgress}
                onComplete={(number) => updateProgress((saved) => ({ ...saved, completed: Math.max(saved.completed, number) }))}
                onSfx={(type) => playEffect(soundEnabled, type)}
                onOpenTreasure={() => {
                  updateProgress((saved) => ({ ...saved, treasureOpened: true }));
                  playEffect(soundEnabled, "success");
                }}
              />
            }
          />
        </main>
        <footer className="site-footer">
          <span>ROMANTIC INTELLIGENCE AGENCY</span>
          <span>FILE CLOSED? NEVER. <i>♥</i></span>
          <span>MADE WITH CARE BY {profile.boyfriend.toUpperCase()}</span>
        </footer>
        {notice && <div className="toast-message" role="status">{notice}</div>}
      </div>
    </>
  );
}
