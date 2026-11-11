import { useEffect, useRef, useState } from "react";
import { FLOWERS, GIFT_MESSAGES, PHOTOS } from "../data.js";

const REVEALS = ["flip", "burst", "curtain", "swing", "glow"];

function SectionHeading({ code, title, subtitle }) {
  return (
    <div className="section-heading">
      <div><p className="eyebrow"><span className="eyebrow-line" /> {code} · DECLASSIFIED</p><h2>{title}</h2></div>
      {subtitle && <p className="section-note">{subtitle}</p>}
    </div>
  );
}

function RevealModal({ item, onClose }) {
  useEffect(() => {
    if (!item) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.classList.remove("modal-open");
    };
  }, [item, onClose]);

  if (!item) return null;
  return (
    <div className="photo-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="photo-modal" role="dialog" aria-modal="true" aria-label={item.title}>
        <button className="modal-close" onClick={onClose} aria-label="Close photo">×</button>
        <div className={`photo-reveal reveal-${item.animation}`} key={item.key}>
          {item.type === "video" ? <video src={item.src} controls autoPlay playsInline /> : <img src={item.src} alt={item.title} />}
        </div>
        <div className="modal-caption"><span className="eyebrow">MEMORY FILE · {item.type === "video" ? "MOTION EVIDENCE" : "PHOTO EVIDENCE"}</span><h3>{item.title}</h3><p>{item.note || "A little moment, kept close."}</p></div>
      </div>
    </div>
  );
}

export default function StorySections({ profile, progress, updateProfile, updateProgress, onSfx, onNotice, gamesContent }) {
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [extraPhotos, setExtraPhotos] = useState([]);
  const [videoSrc, setVideoSrc] = useState("");
  const [videoName, setVideoName] = useState("");
  const [audioTracks, setAudioTracks] = useState([]);
  const [activeTrack, setActiveTrack] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [giftAnimations, setGiftAnimations] = useState({});
  const [datePlan, setDatePlan] = useState({ location: "", food: "", outfit: "", activity: "", movie: "" });
  const [dateInviteReady, setDateInviteReady] = useState(false);
  const [dateQuizAnswer, setDateQuizAnswer] = useState("");
  const [newDate, setNewDate] = useState({ title: "", date: "", note: "" });
  const [gardenMessage, setGardenMessage] = useState("");
  const audioRef = useRef(null);
  const revealIndex = useRef(-1);
  const animationSerial = useRef(0);

  const memories = [...PHOTOS, ...extraPhotos];
  const audioTrack = audioTracks.find((track) => track.url === activeTrack);

  const objectUrls = useRef([]);
  useEffect(() => () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  function nextReveal() {
    let index = Math.floor(Math.random() * REVEALS.length);
    if (REVEALS.length > 1 && index === revealIndex.current) index = (index + 1 + Math.floor(Math.random() * (REVEALS.length - 1))) % REVEALS.length;
    revealIndex.current = index;
    animationSerial.current += 1;
    return { animation: REVEALS[index], key: animationSerial.current };
  }

  function openMemory(item, type = "photo") {
    setSelectedMemory({ ...item, type, ...nextReveal() });
    onSfx("success");
  }

  function addPhotos(event) {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
    const added = files.map((file) => {
      const src = URL.createObjectURL(file);
      objectUrls.current.push(src);
      return { src, title: file.name.replace(/\.[^.]+$/, ""), note: "A memory added to this private case file." };
    });
    setExtraPhotos((saved) => [...saved, ...added]);
    event.target.value = "";
    if (added.length) onNotice(`${added.length} photo${added.length === 1 ? "" : "s"} added to this session.`);
  }

  function addVideo(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const src = URL.createObjectURL(file);
    objectUrls.current.push(src);
    setVideoSrc(src);
    setVideoName(file.name);
    event.target.value = "";
  }

  function addAudio(event) {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("audio/"));
    const tracks = files.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.push(url);
      return { name: file.name, url };
    });
    setAudioTracks((saved) => [...saved, ...tracks]);
    if (!activeTrack && tracks[0]) setActiveTrack(tracks[0].url);
    event.target.value = "";
  }

  function updateFuture(field, value) {
    updateProgress((saved) => ({ ...saved, future: { ...(saved.future || {}), [field]: value } }));
  }

  function plantFlower() {
    const flower = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
    updateProgress((saved) => ({ ...saved, plantedFlowers: [...(saved.plantedFlowers || []), flower] }));
    setGardenMessage(["A little bloom, just for you.", "Love grows here, one flower at a time.", "This one is named after your smile."][Math.floor(Math.random() * 3)]);
    onSfx("success");
  }

  function openGift(id) {
    const animation = nextReveal();
    setGiftAnimations((saved) => ({ ...saved, [id]: animation }));
    updateProgress((saved) => ({ ...saved, openedGifts: saved.openedGifts.includes(id) ? saved.openedGifts : [...saved.openedGifts, id] }));
    onSfx("success");
  }

  function addCalendarDate(event) {
    event.preventDefault();
    if (!newDate.title.trim() || !newDate.date) return;
    updateProgress((saved) => ({ ...saved, calendar: [...saved.calendar, { ...newDate, id: crypto.randomUUID() }].sort((a, b) => a.date.localeCompare(b.date)) }));
    setNewDate({ title: "", date: "", note: "" });
    onNotice("Special date added to the calendar.");
  }

  function removeCalendarDate(id) {
    updateProgress((saved) => ({ ...saved, calendar: saved.calendar.filter((item) => item.id !== id) }));
  }

  return (
    <>
      <section className="page-section section-shell about-section" id="about">
        <SectionHeading code="02 / SUBJECT PROFILE" title={<>About <em>Her.</em></>} subtitle="A file about the person who makes ordinary days feel a little less ordinary." />
        <div className="about-layout">
          <div className="about-portrait">
            <img src="/photos/lakshita.jpeg" alt={profile.girlfriend || "Lakshita"} />
            <span className="portrait-coordinate">SUBJECT 01 · TRUSTED</span>
            <span className="portrait-heart">♥</span>
          </div>
          <div className="about-copy">
            <span className="classified-tag">PERSONAL NOTE · UNREDACTED</span>
            <h3>There is no one quite like <em>{profile.girlfriend || "you"}.</em></h3>
            <p>{profile.about}</p>
            <div className="trait-row"><span>SOFT HEART</span><span>BRIGHT SPIRIT</span><span>FAVOURITE HUMAN</span></div>
            <details className="edit-file">
              <summary>EDIT THIS CASE FILE <span>＋</span></summary>
              <div className="profile-editor">
                <label>Her name<input value={profile.girlfriend} onChange={(event) => updateProfile("girlfriend", event.target.value)} /></label>
                <label>Your name<input value={profile.boyfriend} onChange={(event) => updateProfile("boyfriend", event.target.value)} /></label>
                <label>What makes her special?<textarea value={profile.about} onChange={(event) => updateProfile("about", event.target.value)} rows="3" /></label>
                <div className="editor-divider"><span>MEMORY INVESTIGATION QUESTIONS</span><button type="button" className="small-link" onClick={() => updateProfile("questions", [...profile.questions, { question: "What is one thing we want to do together?", answer: "", hint: "Add a little clue for this memory." }])}>+ ADD QUESTION</button></div>
                {profile.questions.map((item, index) => (
                  <div className="question-editor" key={`question-${index}`}>
                    <label>Question {index + 1}<input value={item.question} onChange={(event) => updateProfile("questions", profile.questions.map((question, current) => current === index ? { ...question, question: event.target.value } : question))} /></label>
                    <label>Accepted answer(s)<input value={item.answer} placeholder="Use | between alternatives" onChange={(event) => updateProfile("questions", profile.questions.map((question, current) => current === index ? { ...question, answer: event.target.value } : question))} /></label>
                    <label>Hint<input value={item.hint} onChange={(event) => updateProfile("questions", profile.questions.map((question, current) => current === index ? { ...question, hint: event.target.value } : question))} /></label>
                    {profile.questions.length > 1 && <button type="button" className="small-link remove-question" onClick={() => updateProfile("questions", profile.questions.filter((_, current) => current !== index))}>REMOVE</button>}
                  </div>
                ))}
                <p className="editor-note">Profile and answers save automatically on this device. Update the answers before starting the memory mission.</p>
              </div>
            </details>
          </div>
        </div>
      </section>

      <section className="page-section section-shell memories-section" id="memories">
        <SectionHeading code="03 / VISUAL EVIDENCE" title={<>Memories, under <em>wraps.</em></>} subtitle="Every photograph is a little gift. Open one to reveal its story." />
        <div className="memory-tools">
          <p><span className="live-indicator"><i /> PRIVATE ARCHIVE</span> · {memories.length} PHOTO FILES</p>
          <label className="upload-control">+ ADD YOUR PHOTOS<input type="file" accept="image/*" multiple onChange={addPhotos} /></label>
        </div>
        <div className="memory-grid">
          {memories.map((photo, index) => (
            <button className={`wrapped-photo gift-color-${index % 6}`} key={`${photo.src}-${index}`} onClick={() => openMemory(photo)} style={{ "--photo-index": index, "--gift-turn": `${[-4, 3, -2, 4, -3, 2][index % 6]}deg` }} aria-label={`Open wrapped memory: ${photo.title}`}>
              <span className="gift-wrap"><span className="gift-ribbon ribbon-vertical" /><span className="gift-ribbon ribbon-horizontal" /><span className="gift-bow">♡</span><span className="gift-seal">{String(index + 1).padStart(2, "0")}</span></span>
              <span className="wrapped-caption"><b>{photo.title}</b><small>SEALED MEMORY · TAP TO OPEN</small></span>
            </button>
          ))}
        </div>
        <div className="video-evidence">
          <div><span className="classified-tag">MOTION EVIDENCE</span><h3>Little moments, in motion.</h3><p>Add a personal video to this memory reel. It stays in this browser session.</p></div>
          <label className="upload-control">{videoSrc ? "CHANGE VIDEO" : "+ ADD A VIDEO"}<input type="file" accept="video/*" onChange={addVideo} /></label>
          {videoSrc && <button className="video-memory-card" onClick={() => openMemory({ src: videoSrc, title: videoName, note: "A little piece of your story, moving." }, "video")}><span>▶</span><b>{videoName}</b><small>PLAY PRIVATE REEL</small></button>}
        </div>
      </section>

      <section className="page-section section-shell letters-section" id="letters">
        <SectionHeading code="04 / UNSENT TRANSMISSION" title={<>Letters for <em>your eyes only.</em></>} subtitle="No perfect words needed. Just the honest ones." />
        <div className="letter-paper">
          <div className="letter-top"><span>PERSONAL TRANSMISSION</span><span>NO. 001 · HEART-TO-HEART</span></div>
          <span className="letter-hello">Dear {profile.girlfriend || "you"},</span>
          <textarea aria-label="Edit your romantic letter" value={profile.letter} onChange={(event) => updateProfile("letter", event.target.value)} rows="6" />
          <div className="letter-signoff"><span>Whenever you're ready,</span><b>{profile.boyfriend || "always yours"} <i>♥</i></b></div>
          <span className="letter-stamp">PRIVATE<br />&amp; PERSONAL</span>
        </div>
        <p className="save-hint">This letter saves automatically on this device. Change the words until they sound like you.</p>
      </section>

      <div className="games-area">
        {gamesContent}
        <section className="page-section section-shell bonus-games-section">
          <SectionHeading code="BONUS / OFF-DUTY" title={<>A tiny date-night <em>simulation.</em></>} subtitle="A small playful extra while you explore the dossier." />
          <div className="date-game-grid">
            <div className="date-game-card">
              <span className="classified-tag">SIMULATION 01 · VIRTUAL DATE NIGHT</span><h3>Plan an evening for two.</h3>
              <div className="date-planner">
                {[
                  ["location", "01 · PICK A PLACE", ["🌙 Rooftop under stars", "🌊 By the sea", "☕ Cosy little café", "🏠 At-home blanket fort"]],
                  ["food", "02 · PICK THE FOOD", ["🍵 Chai & pakoras", "🍝 Pasta night", "🍜 Street-food hunt", "🍰 Chocolate cake"]],
                  ["outfit", "03 · PICK THE VIBE", ["🧸 Comfy & cozy", "✨ Your favourite look", "🎨 Matching colours", "💌 Absolutely no dress code"]],
                  ["activity", "04 · PICK AN ACTIVITY", ["🔭 Stargazing", "📷 A photo walk", "🥣 Cook together", "🎲 Board games"]],
                  ["movie", "05 · PICK A MOVIE", ["🎞️ Comfort rewatch", "😂 Silly comedy", "💗 Gentle romance", "🍿 You choose"]],
                ].map(([field, label, options]) => (
                  <fieldset className="date-choice-group" key={field}>
                    <legend>{label}</legend>
                    <div className="choice-grid">{options.map((choice) => <button type="button" className={datePlan[field] === choice ? "selected" : ""} key={choice} onClick={() => { setDatePlan((saved) => ({ ...saved, [field]: choice })); setDateInviteReady(false); }}>{choice}</button>)}</div>
                  </fieldset>
                ))}
              </div>
              <button className="button button-primary invitation-launch" disabled={Object.values(datePlan).some((value) => !value)} onClick={() => { setDateInviteReady(true); onSfx("success"); }}>MAKE OUR INVITATION <span>↗</span></button>
              {dateInviteReady && (
                <div className="date-invitation-card" key={Object.values(datePlan).join("|")}>
                  <div className="invitation-scene" aria-hidden="true"><span className="invite-moon">☾</span><span className="invite-star star-one">✦</span><span className="invite-star star-two">✧</span><span className="invite-heart heart-one">♥</span><span className="invite-heart heart-two">♥</span><span className="invite-envelope">💌</span></div>
                  <div className="invitation-copy"><span className="classified-tag">A PRIVATE INVITATION · JUST FOR YOU</span><h4>Agent {profile.girlfriend || "Lakshita"},</h4><p>You are officially invited to {datePlan.location.toLowerCase()} for {datePlan.food.toLowerCase()}. Dress {datePlan.outfit.toLowerCase()}, then let's {datePlan.activity.toLowerCase()} and watch {datePlan.movie.toLowerCase()} together.</p><b>When you're ready. No pressure. Just us. <i>♥</i></b><small>ISSUED WITH LOVE BY {(profile.boyfriend || "Prashank").toUpperCase()}</small></div>
                </div>
              )}
            </div>
            <div className="date-game-card quiz-card">
              <span className="classified-tag">SIMULATION 02 · TEAM CHECK</span><h3>What's the best answer?</h3><p>“I had a long day.”</p>
              <div className="choice-grid"><button className={dateQuizAnswer === "listen" ? "selected" : ""} onClick={() => setDateQuizAnswer("listen")}>“Want to tell me about it?”</button><button className={dateQuizAnswer === "fix" ? "selected" : ""} onClick={() => setDateQuizAnswer("fix")}>“Here's what you should do.”</button></div>
              {dateQuizAnswer && <p className="date-invitation">{dateQuizAnswer === "listen" ? "Excellent agent instinct: listen first, ask what she needs, and be there. ♥" : "Plot twist: sometimes the best first move is listening. You can always ask if she'd like advice. ♥"}</p>}
            </div>
          </div>
        </section>
      </div>

      <section className="page-section section-shell garden-section" id="garden">
        <SectionHeading code="06 / LIVING SIGNAL" title={<>A tiny <em>garden.</em></>} subtitle="Plant a flower whenever you need a reminder that care grows with time." />
        <div className="garden-console">
          <div className="garden-copy"><span className="classified-tag">GROWING WITH EVERY VISIT</span><h3>Good things take a little tending.</h3><p>Each tap plants a new flower in your shared virtual garden. Come back and watch it grow.</p><button className="button button-primary" onClick={plantFlower}>PLANT A FLOWER <span>✿</span></button>{gardenMessage && <p className="garden-message" key={gardenMessage}>{gardenMessage}</p>}</div>
          <div className="garden-bed" aria-live="polite">
            <div className="garden-sky">✦ <span>✧</span> ✦</div>
            <div className="garden-cloud cloud-one" /><div className="garden-cloud cloud-two" />
            <div className="garden-flowers">{(progress.plantedFlowers || []).map((flower, index) => <span key={`flower-${index}`} style={{ "--flower-delay": `${index * 80}ms` }}>{flower}</span>)}{!(progress.plantedFlowers || []).length && <p>YOUR GARDEN IS READY<br />FOR ITS FIRST BLOOM</p>}</div>
            <div className="garden-ground" />
            <span className="garden-count">{String((progress.plantedFlowers || []).length).padStart(2, "0")} BLOOMS</span>
          </div>
        </div>
      </section>

      <section className="page-section section-shell music-section" id="music">
        <SectionHeading code="07 / SOUND SIGNAL" title={<>Songs for the <em>quiet moments.</em></>} subtitle="Bring your own favourite songs into the file. Nothing plays until you press play." />
        <div className="music-console">
          <div className="vinyl-record"><span>♥</span></div>
          <div className="music-info"><span className="classified-tag">PRIVATE LISTENING ROOM</span><h3>{audioTrack?.name || "Your song, your memory."}</h3><p>{audioTrack ? "Selected from your personal audio files." : "Upload an audio file to make this soundtrack yours."}</p>
            <div className="music-controls">
              <button className="button button-primary" disabled={!audioTrack} onClick={() => { if (!audioRef.current) return; if (isPlaying) audioRef.current.pause(); else audioRef.current.play().catch(() => onNotice("The selected audio could not be played in this browser.")); }}>{isPlaying ? "PAUSE MUSIC Ⅱ" : "PLAY MUSIC ▶"}</button>
              <label className="upload-control">+ ADD SONGS<input type="file" accept="audio/*" multiple onChange={addAudio} /></label>
            </div>
            <audio ref={audioRef} src={activeTrack || undefined} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />
            {audioTracks.length > 0 && <label className="track-picker">YOUR PLAYLIST<select value={activeTrack} onChange={(event) => { if (audioRef.current) audioRef.current.pause(); setActiveTrack(event.target.value); }}><option value="">Choose a song</option>{audioTracks.map((track) => <option key={track.url} value={track.url}>{track.name}</option>)}</select></label>}
          </div>
          <div className="sound-wave" aria-hidden="true">{Array.from({ length: 21 }, (_, index) => <i key={index} style={{ "--wave-height": `${6 + (index % 5) * 5}px`, "--wave-delay": `${index * -65}ms` }} />)}</div>
        </div>
      </section>

      <section className="page-section section-shell surprises-section" id="surprises">
        <SectionHeading code="08 / DEAD-DROP GIFTS" title={<>A few things, <em>hidden in plain sight.</em></>} subtitle="Open a sealed gift. No passwords, no pressure, just a small reminder." />
        <div className="surprise-grid">
          {GIFT_MESSAGES.map((gift, index) => {
            const opened = progress.openedGifts.includes(`gift-${index}`);
            const animation = giftAnimations[`gift-${index}`];
            return (
              <article className={`surprise-card surprise-${index % 3} ${opened ? "is-open" : ""}`} key={gift.title}>
              {!opened ? <button className="mini-gift" onClick={() => openGift(`gift-${index}`)} aria-label={`Open surprise ${index + 1}`}><span>♥</span><small>SEALED GIFT · 0{index + 1}</small><b>TAP TO UNWRAP</b></button> : <div className={`surprise-message reveal-${animation?.animation || "flip"}`} key={animation?.key || 0}><span className="surprise-spark">✦</span><small>{gift.title}</small><p>{gift.message}</p><button className="small-link" onClick={() => openGift(`gift-${index}`)}>OPEN AGAIN ↻</button></div>}
              </article>
            );
          })}
        </div>
      </section>

      <section className="page-section section-shell future-section" id="future">
        <SectionHeading code="09 / FUTURE SIGNALS" title={<>Our future, <em>one little dream at a time.</em></>} subtitle="No grand promises required. Just a few things you might like to imagine together." />
        <div className="future-panel">
          <div className="future-orbit" aria-hidden="true">∞</div>
          <label>WHERE SHOULD WE GO TOGETHER?<input value={progress.future?.destination || ""} onChange={(event) => updateFuture("destination", event.target.value)} placeholder="A place you've always wanted to see..." /></label>
          <label>WHAT WOULD OUR DREAM HOME FEEL LIKE?<input value={progress.future?.dreamHome || ""} onChange={(event) => updateFuture("dreamHome", event.target.value)} placeholder="Cosy, full of plants, a sunny reading corner..." /></label>
          <label>ONE SMALL PROMISE FOR THE ROAD<textarea value={progress.future?.promise || ""} onChange={(event) => updateFuture("promise", event.target.value)} rows="2" placeholder="Something kind and real, in your own words..." /></label>
          <div className="future-story"><span className="classified-tag">A POSSIBLE LITTLE FUTURE</span><p>{progress.future?.destination || progress.future?.dreamHome || progress.future?.promise ? `${profile.girlfriend || "You"} and ${profile.boyfriend || "I"} save this dream: ${[progress.future.destination, progress.future.dreamHome && `a home that feels ${progress.future.dreamHome}`, progress.future.promise].filter(Boolean).join(". ")}. No rush. Just something lovely to look forward to.` : "One day, you will look back at this little list and smile at how a future began with a dream, a conversation, and the two of you choosing to keep showing up."}</p></div>
        </div>
      </section>

      <section className="page-section section-shell calendar-section" id="calendar">
        <SectionHeading code="10 / DATE ARCHIVE" title={<>The dates that <em>matter.</em></>} subtitle="Add anniversaries, birthdays, or any ordinary day you want to remember." />
        <form className="calendar-form" onSubmit={addCalendarDate}>
          <label>WHAT'S THE OCCASION?<input value={newDate.title} onChange={(event) => setNewDate((date) => ({ ...date, title: event.target.value }))} placeholder="A day worth keeping..." required /></label>
          <label>WHEN?<input type="date" value={newDate.date} onChange={(event) => setNewDate((date) => ({ ...date, date: event.target.value }))} required /></label>
          <label>A LITTLE NOTE<input value={newDate.note} onChange={(event) => setNewDate((date) => ({ ...date, note: event.target.value }))} placeholder="Optional detail" /></label>
          <button className="button button-primary">ADD TO FILE <span>+</span></button>
        </form>
        <div className="calendar-list">
          {progress.calendar.length === 0 ? <div className="empty-calendar"><span>◷</span><p>No dates filed yet. Add one when you're ready.</p></div> : [...progress.calendar].sort((a, b) => a.date.localeCompare(b.date)).map((item) => (
            <article className="calendar-date-card" key={item.id}>
              <div className="date-block"><b>{new Date(`${item.date}T12:00:00`).getDate()}</b><span>{new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span></div>
              <div><span className="classified-tag">SPECIAL DATE</span><h3>{item.title}</h3>{item.note && <p>{item.note}</p>}</div>
              <button className="small-link" onClick={() => removeCalendarDate(item.id)} aria-label={`Remove ${item.title}`}>REMOVE ×</button>
            </article>
          ))}
        </div>
      </section>

      <RevealModal item={selectedMemory} onClose={() => setSelectedMemory(null)} />
    </>
  );
}
