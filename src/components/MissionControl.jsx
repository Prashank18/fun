import { useEffect, useState } from "react";
import { EVIDENCE, GIRLFRIEND_PHOTO } from "../data.js";

const MISSION_NAMES = [
  "Decode the message",
  "Password hacker",
  "Hidden evidence",
  "Memory investigation",
  "The final mystery",
];

function normalize(value) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}

function MissionHeader({ completed, stage }) {
  const active = Math.min(stage, MISSION_NAMES.length);
  return (
    <div className="mission-progress">
      <div className="mission-progress-top">
        <span className="eyebrow">MISSION TRACKER</span>
        <span className="mono muted">{completed} / 5 SECURED</span>
      </div>
      <div className="progress-rail">
        {MISSION_NAMES.map((mission, index) => {
          const number = index + 1;
          const status = number <= completed ? "complete" : number === active ? "active" : "";
          return (
            <div className={`progress-stop ${status}`} key={mission}>
              <span className="stop-dot">{number <= completed ? "✓" : `0${number}`}</span>
              <span className="stop-label">{mission}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MissionShell({ number, title, description, children }) {
  return (
    <article className="mission-shell">
      <div className="mission-shell-top">
        <span className="mission-index">MISSION {String(number).padStart(2, "0")}</span>
        <span className="live-indicator"><i /> LIVE</span>
      </div>
      <h3>{title}</h3>
      <p className="mission-description">{description}</p>
      {children}
    </article>
  );
}

function Feedback({ type, children }) {
  if (!children) return null;
  return <div className={`mission-feedback feedback-${type}`} role="status" key={children}>{children}</div>;
}

export default function MissionControl({ profile, progress, onAccept, onDecline, onUpdate, onComplete, onSfx, onOpenTreasure }) {
  const [message, setMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("info");
  const [cipherAnswer, setCipherAnswer] = useState("");
  const [cipherHints, setCipherHints] = useState(0);
  const [password, setPassword] = useState("");
  const [passwordTries, setPasswordTries] = useState(5);
  const [passwordHints, setPasswordHints] = useState(0);
  const [memoryAnswer, setMemoryAnswer] = useState("");
  const [finalAnswer, setFinalAnswer] = useState("");
  const [finalHints, setFinalHints] = useState(0);
  const [remaining, setRemaining] = useState(90);
  const [bonusOpen, setBonusOpen] = useState(false);
  const [bonusAnswer, setBonusAnswer] = useState("");

  const stage = Math.min(progress.completed + 1, 6);
  const question = profile.questions[progress.memoryStep] ?? profile.questions[0];
  const evidenceFound = progress.evidence.length;

  useEffect(() => {
    if (!progress.accepted || progress.completed !== 4 || remaining <= 0) return undefined;
    const timer = window.setInterval(() => setRemaining((time) => Math.max(0, time - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [progress.accepted, progress.completed, remaining <= 0]);

  function announce(text, type = "info") {
    setMessage(text);
    setFeedbackType(type);
    if (type === "success") onSfx("success");
    if (type === "error") onSfx("error");
  }

  function completeMission(number, note) {
    announce(note, "success");
    window.setTimeout(() => onComplete(number), 950);
  }

  function submitCipher(event) {
    event.preventDefault();
    if (normalize(cipherAnswer) === "iloveyou") {
      completeMission(1, "MESSAGE DECODED. Agent, the truth was hiding in plain sight. ♥");
    } else announce("Not quite, Agent. The letters are shuffled, not encrypted.", "error");
  }

  function submitPassword(event) {
    event.preventDefault();
    if (normalize(password) === normalize(profile.girlfriend)) {
      completeMission(2, `ACCESS GRANTED. Of course the password was ${profile.girlfriend.toUpperCase()}. ♥`);
    } else if (passwordTries > 1) {
      setPasswordTries((tries) => tries - 1);
      announce(`ACCESS DENIED. ${passwordTries - 1} attempts left. Check the clues, Agent.`, "error");
    } else {
      setPasswordTries(0);
      announce("TERMINAL LOCKED. Take a breath, read the clues, then reset your attempts.", "error");
    }
  }

  function findEvidence(item) {
    if (progress.evidence.includes(item.id)) return;
    const evidence = [...progress.evidence, item.id];
    onUpdate((saved) => ({ ...saved, evidence }));
    announce(item.message, "success");
  }

  function submitMemory(event) {
    event.preventDefault();
    const acceptedAnswers = question.answer.split("|").map(normalize);
    if (normalize(memoryAnswer) && acceptedAnswers.includes(normalize(memoryAnswer))) {
      setMemoryAnswer("");
      if (progress.memoryStep + 1 >= profile.questions.length) {
        completeMission(4, "MEMORY FILE COMPLETE. Tum dono ki story ka best part abhi likhna baaki hai. ♥");
      } else {
        onUpdate((saved) => ({ ...saved, memoryStep: saved.memoryStep + 1 }));
        announce("Memory verified. Agent, you know us pretty well. ♥", "success");
      }
    } else announce("Memory mismatch! Koi baat nahi, clue maango ya apne dil se phir socho.", "error");
  }

  function submitFinal(event) {
    event.preventDefault();
    if (remaining <= 0) {
      announce("Signal lost! Reset the countdown and try again.", "error");
      return;
    }
    if (normalize(finalAnswer) === "myheart") {
      completeMission(5, "DECRYPTION COMPLETE. Final password accepted: MY HEART. ♥");
    } else announce("Wrong sequence. The first clue is waiting below.", "error");
  }

  if (!progress.accepted) {
    return (
      <section className="section-shell mission-dashboard" id="games">
        <div className="section-heading">
          <div><p className="eyebrow">FIELD OPERATIONS</p><h2>Mission control<span className="accent-pink">.</span></h2></div>
          <p className="section-note">Your story is waiting in the signal.</p>
        </div>
        <div className="idle-console">
          <span className="console-heart">♥</span>
          <div><span className="mono muted">INCOMING SIGNAL · ENCRYPTED</span><h3>{progress.declined ? "Briefing paused." : "No active mission."}</h3><p>{progress.declined ? "Jab tum ready ho, briefing dobara shuru kar sakti ho." : "Home screen se mission accept karo, Agent. No pressure. ♥"}</p></div>
          {progress.declined && <button className="button button-outline" onClick={onAccept}>REOPEN BRIEFING</button>}
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell mission-dashboard" id="games">
      <div className="section-heading">
        <div><p className="eyebrow">FIELD OPERATIONS · AGENT {profile.girlfriend.toUpperCase()}</p><h2>Mission control<span className="accent-pink">.</span></h2></div>
        <p className="section-note">Five secrets. One very important heart.</p>
      </div>
      <div className="dashboard-card">
        <MissionHeader completed={progress.completed} stage={stage} />

        {progress.completed === 0 && (
          <MissionShell number={1} title="Decode the secret message" description="We intercepted a scrambled transmission. Rearrange the letters to reveal the three words hidden inside.">
            <div className="cipher-paper">
              <span className="mono muted">INTERCEPTED MESSAGE // ENCRYPTION: ANAGRAM</span>
              <strong className="cipher-message">IL OYVE UOY</strong>
              <span className="cipher-foot">one planted decoy · three words · all heart</span>
            </div>
            <form className="mission-form" onSubmit={submitCipher}>
              <label htmlFor="cipher-answer" className="mono">DECODED MESSAGE</label>
              <div className="input-row"><input id="cipher-answer" autoComplete="off" value={cipherAnswer} onChange={(event) => setCipherAnswer(event.target.value)} placeholder="Type the secret message..." /><button className="button button-primary">DECODE <span>↗</span></button></div>
            </form>
            <button className="hint-link" onClick={() => setCipherHints((count) => Math.min(3, count + 1))}>REQUEST A HINT <span>({cipherHints}/3)</span></button>
            {cipherHints > 0 && <div className="hint-stack">{["It's a rearrangement, not a substitution cipher.", "One extra Y is a decoy. Remove it before rearranging.", "Three words: I / LOVE / YOU."][cipherHints - 1]}</div>}
            <Feedback type={feedbackType}>{message}</Feedback>
          </MissionShell>
        )}

        {progress.completed === 1 && (
          <MissionShell number={2} title="Password hacker" description="The next file is behind a password. You have five attempts and three clues. No pressure, Agent.">
            <div className="hacker-terminal">
              <div className="terminal-bar"><span /><span /><span /><em>SECURE SHELL // AUTH REQUIRED</em></div>
              <p><b>root@ria:~$</b> identify the one person this mission is about</p>
              <p><b>system:</b> password length: {profile.girlfriend.length} characters</p>
              <p><b>system:</b> first letter: {profile.girlfriend[0]?.toUpperCase()} · last letter: {profile.girlfriend.slice(-1).toUpperCase()}</p>
              <p className="terminal-cursor">root@ria:~$ <i>_</i></p>
            </div>
            <form className="mission-form" onSubmit={submitPassword}>
              <label htmlFor="password" className="mono">PASSWORD <span className="attempt-count">{passwordTries} ATTEMPTS LEFT</span></label>
              <div className="input-row"><input id="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={`Enter the ${profile.girlfriend.length}-letter password...`} disabled={passwordTries === 0} /><button className="button button-primary" disabled={passwordTries === 0}>HACK IN <span>↗</span></button></div>
            </form>
            <div className="mission-actions">
              <button className="hint-link" onClick={() => setPasswordHints((count) => Math.min(3, count + 1))}>REVEAL A CLUE <span>({passwordHints}/3)</span></button>
              {passwordTries === 0 && <button className="hint-link" onClick={() => { setPasswordTries(5); setPassword(""); announce("Fresh attempts loaded. You’ve got this.", "info"); }}>RESET ATTEMPTS ↻</button>}
            </div>
              {passwordHints > 0 && <div className="hint-stack">{[`The password is the name at the top of the welcome message.`, `It has ${profile.girlfriend.length} letters and makes this mission yours.`, `${profile.girlfriend.toUpperCase()} — enter it just like that.`][passwordHints - 1]}</div>}
            <Feedback type={feedbackType}>{message}</Feedback>
          </MissionShell>
        )}

        {progress.completed === 2 && (
          <MissionShell number={3} title="Find the hidden evidence" description="Scan the investigation room. Find all five objects to piece together what this case is really about.">
            <div className="evidence-status"><span className="mono">EVIDENCE SECURED</span><strong>{String(evidenceFound).padStart(2, "0")} <i>/</i> 05</strong><div className="evidence-meter"><span style={{ width: `${evidenceFound * 20}%` }} /></div></div>
            <div className="investigation-room">
              <div className="room-label mono">SCENE 01 · A ROOM FULL OF CLUES</div>
              <div className="room-window"><span>✦</span><span>✧</span><span>✦</span></div>
              <div className="room-desk" />
              {EVIDENCE.map((item, index) => (
                <button
                  className={`evidence-object evidence-${item.id} ${progress.evidence.includes(item.id) ? "found" : ""}`}
                  key={item.id}
                  onClick={() => findEvidence(item)}
                  style={{ "--object-delay": `${index * 70}ms` }}
                  aria-label={progress.evidence.includes(item.id) ? `${item.name} found` : `Search for ${item.name}`}
                  disabled={progress.evidence.includes(item.id)}
                >
                  <span>{progress.evidence.includes(item.id) ? "✓" : item.emoji}</span>
                  <small>{progress.evidence.includes(item.id) ? "SECURED" : "?"}</small>
                </button>
              ))}
              <span className="room-stamp">DO NOT<br />DISTURB</span>
            </div>
            <div className="evidence-list">{EVIDENCE.map((item) => <span className={progress.evidence.includes(item.id) ? "found" : ""} key={item.id}>{progress.evidence.includes(item.id) ? "✓" : "○"} {item.name}</span>)}</div>
            <Feedback type={feedbackType}>{message}</Feedback>
            {evidenceFound === EVIDENCE.length && <button className="button button-primary" onClick={() => completeMission(3, "ALL FIVE CLUES SECURED. Case file says: she is loved beyond words. ♥")}>SECURE THE EVIDENCE <span>↗</span></button>}
          </MissionShell>
        )}

        {progress.completed === 3 && question && (
          <MissionShell number={4} title="The memory investigation" description="Answer four little questions to prove you know the heart behind this mission. Wrong answers are safe; ask for a hint any time.">
            <div className="question-progress"><span className="mono">MEMORY FILE {String(progress.memoryStep + 1).padStart(2, "0")} / {String(profile.questions.length).padStart(2, "0")}</span><div className="evidence-meter"><span style={{ width: `${(progress.memoryStep / profile.questions.length) * 100}%` }} /></div></div>
            <div className="memory-question"><span className="question-mark">?</span><h4>{question.question}</h4></div>
            <form className="mission-form" onSubmit={submitMemory}>
              <label htmlFor="memory-answer" className="mono">YOUR ANSWER</label>
              <div className="input-row"><input id="memory-answer" value={memoryAnswer} onChange={(event) => setMemoryAnswer(event.target.value)} placeholder="Type what you remember..." /><button className="button button-primary">VERIFY <span>↗</span></button></div>
            </form>
            <button className="hint-link" onClick={() => announce(question.hint, "info")}>ASK FOR A HINT ♡</button>
            <Feedback type={feedbackType}>{message}</Feedback>
          </MissionShell>
        )}

        {progress.completed === 4 && (
          <MissionShell number={5} title="The final mystery" description="One last encrypted signal. Decode the number cipher before the clock runs out. The countdown is just for drama—reset whenever you like.">
            <div className={`countdown ${remaining < 20 ? "countdown-low" : ""}`}><span className="mono">SIGNAL WINDOW</span><strong>00:{String(remaining).padStart(2, "0")}</strong></div>
            <div className="cipher-paper final-cipher">
              <span className="mono muted">FINAL TRANSMISSION // A1Z26</span>
              <strong className="cipher-message">13 — 25 — 8 — 5 — 1 — 18 — 20</strong>
              <span className="cipher-foot">every number is a letter · 1 begins the alphabet</span>
            </div>
            {remaining === 0 ? (
              <div className="failure-panel"><h4>Signal window closed.</h4><p>Take your time, Agent. Restart the timer when you’re ready.</p><button className="button button-outline" onClick={() => { setRemaining(90); setFinalAnswer(""); setMessage(""); }}>RESET COUNTDOWN ↻</button></div>
            ) : (
              <>
                <form className="mission-form" onSubmit={submitFinal}>
                  <label htmlFor="final-answer" className="mono">FINAL PASSWORD</label>
                  <div className="input-row"><input id="final-answer" value={finalAnswer} onChange={(event) => setFinalAnswer(event.target.value)} placeholder="Decode the seven letters..." /><button className="button button-primary">UNLOCK <span>↗</span></button></div>
                </form>
                <button className="hint-link" onClick={() => setFinalHints((count) => Math.min(3, count + 1))}>REQUEST A HINT <span>({finalHints}/3)</span></button>
                {finalHints > 0 && <div className="hint-stack">{["Use A = 1, B = 2, C = 3, and keep going.", "The first three letters read M / Y / H.", "The answer has two words: MY HEART."][finalHints - 1]}</div>}
              </>
            )}
            <Feedback type={feedbackType}>{message}</Feedback>
          </MissionShell>
        )}

        {progress.completed >= 5 && (
          <div className="mission-complete">
            <div className="complete-glitch" data-text="MISSION COMPLETED, AGENT!">MISSION COMPLETED, AGENT!</div>
            <p className="mono">ALL SECRETS HAVE BEEN UNCOVERED.</p>
            <p>One final message is waiting for you, Agent {profile.girlfriend}.</p>
            {!progress.treasureOpened ? (
              <button className="treasure-box" onClick={onOpenTreasure} aria-label="Open the locked romantic gift">
                <span className="gift-glow" />
                <span className="gift-lid">TOP SECRET</span>
                <span className="gift-bow">♡</span>
                <span className="gift-base"><i>♥</i></span>
                <small>TAP TO DECLASSIFY</small>
              </button>
            ) : (
              <div className="treasure-reveal">
                <div className="confetti-field" aria-hidden="true">{Array.from({ length: 34 }, (_, index) => <i key={index} style={{ "--confetti-left": `${(index * 37 + 9) % 100}%`, "--confetti-duration": `${2.2 + (index % 6) * 0.4}s`, "--confetti-delay": `${index * 0.06}s` }}>✦</i>)}</div>
                <p className="eyebrow">CONGRATULATIONS, AGENT {profile.girlfriend.toUpperCase()}! ♥</p>
                <h3>All secrets have been uncovered.<br /><em>Except this one.</em></h3>
                <p className="final-love-note">You never need to decode this: my love for you is real, and you are my favourite person in this entire universe.</p>
                <div className="treasure-photo"><img src={GIRLFRIEND_PHOTO} alt={`${profile.girlfriend}, the heart of this mission`} /><span>THE HEART OF THE OPERATION</span></div>
                <p className="signed">Always yours,<br /><strong>{profile.boyfriend}</strong></p>
                {!bonusOpen ? <button className="button button-outline" onClick={() => setBonusOpen(true)}>OPEN BONUS MISSION <span>↗</span></button> : (
                  <form className="mission-form bonus-form" onSubmit={(event) => { event.preventDefault(); if (normalize(bonusAnswer) === "143") announce("BONUS UNLOCKED: 1 letter, 4 letters, 3 letters. I love you. ♥", "success"); else announce("Hint: count the letters in each word of the secret phrase.", "error"); }}>
                    <label htmlFor="bonus-answer" className="mono">BONUS CODE · 3 DIGITS</label>
                    <div className="input-row"><input id="bonus-answer" value={bonusAnswer} onChange={(event) => setBonusAnswer(event.target.value)} placeholder="Enter the secret number..." /><button className="button button-primary">DECRYPT</button></div>
                    <Feedback type={feedbackType}>{message}</Feedback>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <p className="mission-footnote mono">LOCAL SAVE ACTIVE · YOUR PROGRESS STAYS ON THIS DEVICE</p>
    </section>
  );
}
