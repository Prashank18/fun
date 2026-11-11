import { useEffect, useState } from "react";

const BRIEFING = [
  "Your identity has been verified.",
  "Your mission is waiting.",
  "Someone has left secret messages specifically for you.",
  "Are you ready to discover the truth?",
];

export default function AgentIntro({ name, declined, onAccept, onDecline }) {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisibleLines((visible) => Math.min(BRIEFING.length, visible + 1));
    }, 720);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="briefing-screen">
      <div className="briefing-grid" aria-hidden="true" />
      <div className="briefing-scanline" aria-hidden="true" />
      <div className="briefing-document">
        <div className="document-topline">
          <span>ROMANTIC INTELLIGENCE AGENCY</span>
          <span className="redacted">TOP SECRET // 001</span>
        </div>
        <div className="agency-mark"><span className="agency-heart">♥</span><span>R.I.A.</span></div>
        <p className="eyebrow terminal-eyebrow">INCOMING TRANSMISSION · {new Date().getFullYear()}</p>
        <h1 className="briefing-title"><span>ATTENTION,</span><em>AGENT!</em></h1>
        <div className="briefing-copy" aria-live="polite">
          {declined ? (
            <p className="briefing-line is-visible">Mission paused. No pressure, Agent {name}. Your briefing will be here whenever you feel ready.</p>
          ) : (
            BRIEFING.slice(0, visibleLines).map((line, index) => (
              <p className="briefing-line is-visible" key={line} style={{ "--line-delay": `${index * 120}ms` }}>{line}</p>
            ))
          )}
        </div>
        {declined ? (
          <button className="button button-primary" onClick={onAccept}>REOPEN THE BRIEFING <span>↗</span></button>
        ) : (
          <div className="briefing-actions">
            <button className="button button-primary" onClick={onAccept}>ACCEPT MISSION <span>↗</span></button>
            <button className="button button-quiet" onClick={onDecline}>DECLINE MISSION <span>×</span></button>
          </div>
        )}
        <div className="document-footer"><span>AGENT: {name.toUpperCase()}</span><span>ENCRYPTION: HEART-2-HEART</span></div>
        <span className="document-stamp">CLASSIFIED</span>
      </div>
      <div className="briefing-orbit orbit-top" aria-hidden="true">✳</div>
      <div className="briefing-orbit orbit-bottom" aria-hidden="true">✦</div>
      <div className="briefing-coordinates">23° 10' 12.8&quot; N<br />LOVE / FOREVER</div>
    </div>
  );
}
