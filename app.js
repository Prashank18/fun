const photos = [
  { src: "photo-01.jpeg", label: "Dhoop, hawa aur tum", note: "Us din ki dhoop se zyada warm tumhari smile thi." },
  { src: "photo-02.jpeg", label: "Bas yunhi saath", note: "Jab tum paas hoti ho toh duniya thodi aur achhi lagti hai." },
  { src: "photo-03.jpeg", label: "Ek pyaari si selfie", note: "Tumhari smile dekh ke meri smile automatic aa jaati hai." },
  { src: "photo-04.jpeg", label: "Purani yaadein", note: "School wali yeh photo dekh ke dil karta hai us pal ko phir se jee loon." },
  { src: "photo-05.jpeg", label: "Hamari shaam", note: "Tum aur main, aur ek aisi shaam jo yaad ban gayi." },
  { src: "photo-06.jpeg", label: "Mera favourite moment", note: "Tumhari khushi dekhna, honestly, meri favourite cheez hai." },
  { src: "photo-07.jpeg", label: "Close to my heart", note: "Tumhare paas aake sab kuch apni jagah par lagta hai." },
  { src: "photo-08.jpeg", label: "Ek aur favourite", note: "Photo chhoti si, par ismein meri poori duniya aa gayi." },
  { src: "lakshita.jpeg", label: "Meri roshni", note: "Tum apni roshni se har jagah ko khoobsurat bana deti ho." },
];

const grid = document.querySelector("#photo-grid");
const modal = document.querySelector("#modal");
const modalContent = document.querySelector("#modal-content");
const toast = document.querySelector("#toast");
const musicToggle = document.querySelector("#music-toggle");
let toastTimer;
let cleanupActiveGame = () => {};
let lastFocused = null;
let musicContext = null;
let musicMaster = null;
let musicTimer = null;
let musicPlaying = false;

function setMusicButton(playing) {
  musicToggle.setAttribute("aria-pressed", String(playing));
  musicToggle.setAttribute("aria-label", playing ? "Pause gentle background music" : "Play gentle background music");
  musicToggle.querySelector(".music-label").textContent = playing ? "music on" : "music off";
}

function scheduleMusicTone(frequency, startAt, duration, volume, attack = 0.04) {
  const oscillator = musicContext.createOscillator();
  const envelope = musicContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startAt);
  envelope.gain.setValueAtTime(0.0001, startAt);
  envelope.gain.exponentialRampToValueAtTime(volume, startAt + attack);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(envelope);
  envelope.connect(musicMaster);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.03);
}

function playAmbientPhrase() {
  if (!musicPlaying || !musicContext) return;
  const startAt = musicContext.currentTime + 0.06;
  const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 523.25, 659.25, 783.99, 987.77, 880, 698.46, 587.33, 523.25];
  const chords = [
    [130.81, 164.81, 196],
    [110, 130.81, 164.81],
    [87.31, 110, 130.81],
    [98, 123.47, 146.83],
  ];
  melody.forEach((frequency, index) => scheduleMusicTone(frequency, startAt + index * 0.52, 1.1, 0.055));
  chords.forEach((chord, chordIndex) => {
    chord.forEach((frequency) => scheduleMusicTone(frequency, startAt + chordIndex * 2.2, 2.25, 0.018, 0.35));
  });
}

musicToggle.addEventListener("click", async () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    showToast("Is browser mein background music available nahi hai.");
    return;
  }
  if (!musicContext) {
    musicContext = new AudioContextClass();
    musicMaster = musicContext.createGain();
    musicMaster.gain.value = 0.0001;
    musicMaster.connect(musicContext.destination);
  }
  if (musicPlaying) {
    musicPlaying = false;
    clearInterval(musicTimer);
    musicMaster.gain.setTargetAtTime(0.0001, musicContext.currentTime, 0.12);
    setMusicButton(false);
    window.setTimeout(() => {
      if (!musicPlaying && musicContext.state === "running") musicContext.suspend();
    }, 450);
    return;
  }
  try {
    await musicContext.resume();
    musicPlaying = true;
    musicMaster.gain.setTargetAtTime(0.22, musicContext.currentTime, 0.3);
    setMusicButton(true);
    playAmbientPhrase();
    musicTimer = window.setInterval(playAmbientPhrase, 9000);
  } catch {
    showToast("Music start nahi ho paaya. Ek baar phir try karo.");
  }
});

photos.forEach((photo, index) => {
  const button = document.createElement("button");
  button.className = "photo-card";
  button.style.setProperty("--tilt", `${[-2, 1.5, -1, 2, -1.5, 1, -2, 1.5, -1][index]}deg`);
  button.style.setProperty("--delay", `${index * 65}ms`);
  button.setAttribute("aria-label", `Photo ${index + 1}: ${photo.label}. Open photo.`);
  button.innerHTML = `<img src="public/photos/${photo.src}" alt="${photo.label}" loading="lazy"><span class="photo-card-label">${photo.label}</span>`;
  button.addEventListener("click", () => openPhoto(index));
  grid.append(button);
});

document.querySelector("#enter-button").addEventListener("click", () => {
  const intro = document.querySelector("#intro");
  intro.classList.add("is-leaving");
  window.setTimeout(() => intro.remove(), 850);
  burstHearts(12);
});

function openModal(content, label = "A little surprise") {
  cleanupActiveGame();
  cleanupActiveGame = () => {};
  lastFocused = document.activeElement;
  modalContent.innerHTML = content;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modal.querySelector(".modal-close").focus();
  modal.querySelector(".modal-panel").setAttribute("aria-label", label);
}

function closeModal() {
  cleanupActiveGame();
  cleanupActiveGame = () => {};
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  window.setTimeout(() => {
    if (!modal.classList.contains("is-open")) modalContent.innerHTML = "";
  }, 350);
  if (lastFocused?.focus) lastFocused.focus();
}

modal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-modal]")) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
});

function openPhoto(index) {
  const photo = photos[index];
  openModal(`
    <div class="photo-view">
      <div class="photo-view-image"><img src="public/photos/${photo.src}" alt="${photo.label}"></div>
      <div class="photo-view-copy">
        <p class="eyebrow"><span class="eyebrow-line"></span> yaad number ${String(index + 1).padStart(2, "0")}</p>
        <h2 id="modal-title">${photo.label}</h2>
        <p>${photo.note}</p>
        <span class="photo-heart" aria-hidden="true">♥</span>
      </div>
    </div>`, photo.label);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function burstHearts(count = 8) {
  const symbols = ["♥", "♡", "✳", "✦"];
  for (let index = 0; index < count; index += 1) {
    const bit = document.createElement("span");
    bit.className = "firework";
    bit.textContent = symbols[index % symbols.length];
    bit.style.left = `${8 + Math.random() * 84}vw`;
    bit.style.top = `${45 + Math.random() * 45}vh`;
    bit.style.color = ["#9d3f56", "#dc8f91", "#bd8156", "#f4c49e"][index % 4];
    bit.style.animationDelay = `${Math.random() * 300}ms`;
    document.body.append(bit);
    window.setTimeout(() => bit.remove(), 1700);
  }
}

function shell(title, intro, body) {
  return `<section class="game-modal">
    <p class="eyebrow"><span class="eyebrow-line"></span> ek chhoti si game, sirf tumhare liye</p>
    <h2 id="modal-title">${title}</h2>
    <p class="game-intro">${intro}</p>
    ${body}
  </section>`;
}

function openCatchGame() {
  openModal(shell("Catch My Heart", "Dil pakadne ke liye 15 seconds hain! Pink hearts par tap karo, broken hearts ko chhod do. Ready?", `
    <div class="runner-hud"><span id="catch-score">dil: 0 / 8</span><span id="catch-time">15 sec</span></div>
    <div class="catch-field" id="catch-field"><button class="button button-dark" id="catch-start">shuru karein ♥</button></div>
    <p class="runner-hint">Tip: dil jitni baar dikhe, tap karna. Toota hua dil trap hai!</p>
    <div id="catch-result" aria-live="polite"></div>`), "Catch My Heart");
  const field = document.querySelector("#catch-field");
  const start = document.querySelector("#catch-start");
  const result = document.querySelector("#catch-result");
  let score = 0;
  let seconds = 15;
  let finished = false;
  let spawnTimer;
  let clockTimer;
  const style = document.createElement("style");
  style.textContent = `.catch-field{position:relative;height:270px;display:grid;place-items:center;overflow:hidden;border:1px solid #ddc8b8;background:radial-gradient(ellipse at bottom,#f2d8c8,#f8eee2 70%)}.catch-item{position:absolute;top:-45px;border:0;background:none;font-size:34px;cursor:pointer;animation:catch-fall 3.2s linear forwards}.catch-item.broken{font-size:30px}@keyframes catch-fall{to{top:110%;transform:rotate(30deg)}}`;
  document.head.append(style);
  function finish(won) {
    if (finished) return;
    finished = true;
    clearInterval(spawnTimer);
    clearInterval(clockTimer);
    field.querySelectorAll(".catch-item").forEach((item) => item.remove());
    result.innerHTML = `<div class="game-result">${won ? "Saare dil pakad liye! Mera dil toh waise bhi tumhare paas hi hai. ♥" : `Tumne ${score} dil pakde — jitne bhi pakde, sab tumhare hi toh hain. ♥`}<small>${won ? "Officially: meri favourite heart-catcher." : "Ek aur round? Is baar tum jeetogi!"}</small></div><div class="game-controls"><button class="button button-dark" id="catch-again">phir se khelo ↻</button></div>`;
    document.querySelector("#catch-again").addEventListener("click", openCatchGame);
    if (won) burstHearts(14);
  }
  function spawn() {
    if (finished) return;
    const item = document.createElement("button");
    const broken = Math.random() < 0.22;
    item.className = `catch-item${broken ? " broken" : ""}`;
    item.textContent = broken ? "💔" : "💗";
    item.setAttribute("aria-label", broken ? "Broken heart, avoid" : "Catch this heart");
    item.style.left = `${4 + Math.random() * 88}%`;
    item.style.animationDuration = `${2.3 + Math.random() * 1.2}s`;
    item.addEventListener("click", () => {
      if (finished) return;
      if (broken) {
        score = Math.max(0, score - 1);
        showToast("Toota dil chhod do, asli wala tumhare paas hai!");
      } else score += 1;
      document.querySelector("#catch-score").textContent = `dil: ${score} / 8`;
      item.remove();
      if (score >= 8) finish(true);
    });
    field.append(item);
    window.setTimeout(() => item.remove(), 3800);
  }
  start.addEventListener("click", () => {
    score = 0;
    seconds = 15;
    finished = false;
    start.remove();
    document.querySelector("#catch-score").textContent = "dil: 0 / 8";
    spawnTimer = window.setInterval(spawn, 640);
    clockTimer = window.setInterval(() => {
      seconds -= 1;
      document.querySelector("#catch-time").textContent = `${seconds} sec`;
      if (seconds <= 0) finish(false);
    }, 1000);
  });
  cleanupActiveGame = () => {
    clearInterval(spawnTimer);
    clearInterval(clockTimer);
    style.remove();
  };
}

function openDateGame() {
  const dates = [
    ["🌅", "Sunset walk", "Haath mein haath, aur koi jaldi nahi."],
    ["☕", "Chai aur baatein", "Ek cozy cafe, do cups chai, aur tumhari saari stories."],
    ["🎬", "Movie night", "Blanket, popcorn, aur movie ke beech mein commentary."],
    ["🌧️", "Rainy drive", "Favourite gaane, halki baarish, aur lambi si drive."],
  ];
  openModal(shell("Choose Your Date", "Aaj ki shaam tumhari. Jo plan dil ko sabse zyada achha lage, uspe tap karo.", `
    <div class="choice-grid">${dates.map((item, index) => `<button class="choice-button" data-date="${index}">${item[0]} ${item[1]}<small>${item[2]}</small></button>`).join("")}</div>
    <div id="date-result" aria-live="polite"></div>`), "Choose Your Date");
  document.querySelectorAll("[data-date]").forEach((button) => button.addEventListener("click", () => {
    const [icon, title, description] = dates[Number(button.dataset.date)];
    document.querySelectorAll("[data-date]").forEach((choice) => choice.classList.remove("selected"));
    button.classList.add("selected");
    document.querySelector("#date-result").innerHTML = `<div class="game-result">${icon} ${title?` ${title}`:""} — done! Main tumhare saath yeh date kabhi bhi plan karunga.<small>${description} Bas tum haan keh dena, baaki chai meri taraf se. ♥</small></div>`;
    burstHearts(5);
  }));
}

function openQuiz() {
  const questions = [
    { question: "Mera perfect free day kaisa hota hai?", choices: ["Tumhare saath, bina kisi plan ke", "Bas lambi si neend", "Movie marathon aur snacks"], answer: 0 },
    { question: "Tumhari smile dekh ke mera reaction?", choices: ["Main bhi smile kar deta hoon", "Photo kheenchta hoon", "Dono — aur phir photo ko dekhta rehta hoon"], answer: 2 },
    { question: "Humari favourite cheez kya hai?", choices: ["Ek doosre ko tang karna", "Saath mein waqt bitana", "Yeh dono, obviously!"], answer: 2 },
    { question: "Jab tum naraz hoti ho, mujhe kya karna chahiye?", choices: ["Pehle dhyaan se sunna", "Thoda waqt aur space dena", "Poochhna ki tumhe kya chahiye"], answer: 0 },
  ];
  let index = 0;
  let points = 0;
  function renderQuestion() {
    if (index >= questions.length) {
      const msg = points === questions.length ? "Full marks! Tum mujhe mujhse bhi zyada jaanti ho." : points >= 2 ? "Kaafi achhi team hain hum, hai na?" : "Koi baat nahi — ab aur stories banayenge, phir dobara quiz!";
      modalContent.innerHTML = shell("Quiz complete!", "Ek chhoti si quiz, bahut saari humari baatein.", `<div class="game-result">${msg}<small>${points} / ${questions.length} sahi. Waise mere dil ka answer har sawaal mein tum hi ho. ♥</small></div><div class="game-controls"><button class="button button-dark" id="quiz-again">phir se khelo ↻</button></div>`);
      document.querySelector("#quiz-again").addEventListener("click", openQuiz);
      return;
    }
    const current = questions[index];
    modalContent.innerHTML = shell("Who Knows Whom Better?", "Koi pressure nahi — bas dil se answer dena.", `<div class="quiz-progress">sawaal ${index + 1} / ${questions.length}</div><div class="meter"><span style="width:${(index / questions.length) * 100}%"></span></div><h3 class="date-step">${current.question}</h3><div class="quiz-options">${current.choices.map((choice, choiceIndex) => `<button class="choice-button" data-answer="${choiceIndex}">${choice}</button>`).join("")}</div>`);
    document.querySelectorAll("[data-answer]").forEach((button) => button.addEventListener("click", () => {
      const isRight = Number(button.dataset.answer) === current.answer;
      if (isRight) points += 1;
      button.classList.add("selected");
      document.querySelectorAll("[data-answer]").forEach((choice) => choice.disabled = true);
      window.setTimeout(() => { index += 1; renderQuestion(); }, 850);
    }));
  }
  openModal("");
  renderQuestion();
}

function openVirtualDate() {
  const steps = [
    { key: "place", title: "Pehle, kahan chalein?", options: ["🌊 Beach sunset", "🌿 Pahaadon mein", "🏙️ Sheher ki lights", "🏡 Cozy ghar par"] },
    { key: "food", title: "Phir, kya khaayein?", options: ["🍕 Pizza, obviously", "🍜 Tumhara favourite", "🍰 Dessert pehle", "☕ Chai aur snacks"] },
    { key: "activity", title: "Saath mein kya karein?", options: ["🎶 Gaane sunke baatein", "🎲 Koi silly game", "🚶 Lambi si walk", "📸 Cute photos"] },
    { key: "movie", title: "Aur movie kaunsi?", options: ["💕 Koi rom-com", "😂 Comedy, hansi ke liye", "🎬 Tumhari favourite", "🌙 Movie chhodo, baatein karein"] },
  ];
  const selected = {};
  openModal(shell("Virtual Date Night", "Apni dream date tum khud plan karo. Har step pe ek option chuno!", `<div class="date-builder" id="date-builder"></div><div id="virtual-result"></div>`), "Virtual Date Night");
  const builder = document.querySelector("#date-builder");
  function renderBuilder() {
    builder.innerHTML = steps.map((step, index) => `<div class="date-step"><h3>${index + 1}. ${step.title}</h3><div class="date-options">${step.options.map((option) => `<button class="date-pill ${selected[step.key] === option ? "selected" : ""}" data-step="${step.key}" data-option="${option}">${option}</button>`).join("")}</div></div>`).join("");
    builder.querySelectorAll("[data-step]").forEach((button) => button.addEventListener("click", () => {
      selected[button.dataset.step] = button.dataset.option;
      renderBuilder();
      const complete = steps.every((step) => selected[step.key]);
      if (complete) {
        const scene = selected.place.includes("Beach") ? "scene-beach"
          : selected.place.includes("Pahaadon") ? "scene-mountains"
            : selected.place.includes("Sheher") ? "scene-city"
              : "scene-home";
        document.querySelector("#virtual-result").innerHTML = `<div class="invite-card">
          <div class="date-film ${scene}" role="img" aria-label="Lakshita aur Prashank ki animated date invitation">
            <span class="film-kicker">a little date film · just for you</span>
            <span class="film-moon" aria-hidden="true"></span>
            <span class="film-star film-star-one" aria-hidden="true">✦</span>
            <span class="film-star film-star-two" aria-hidden="true">✧</span>
            <span class="film-star film-star-three" aria-hidden="true">✦</span>
            <span class="film-hill film-hill-back" aria-hidden="true"></span>
            <span class="film-hill film-hill-front" aria-hidden="true"></span>
            <span class="film-path" aria-hidden="true"></span>
            <span class="film-heart film-heart-one" aria-hidden="true">♥</span>
            <span class="film-heart film-heart-two" aria-hidden="true">♥</span>
            <span class="film-heart film-heart-three" aria-hidden="true">♡</span>
            <div class="film-photo"><img src="public/photos/lakshita.jpeg" alt="Lakshita, date film mein"></div>
            <div class="film-title"><span>${selected.place} · tum + main</span><strong>Ek shaam, tumhare naam</strong></div>
            <div class="film-progress" aria-hidden="true"><span></span></div>
          </div>
          <div class="invite-copy"><span class="invite-title">You’re invited, Lakshita! ♥</span><p>Ek perfect date: ${selected.place}, ${selected.food}, ${selected.activity.toLowerCase()}, aur phir ${selected.movie.toLowerCase()}.<br>Company: tum + main. Date: jab tum kaho. RSVP: ek cute si smile ke saath?</p></div>
        </div>`;
        burstHearts(8);
      }
    }));
  }
  renderBuilder();
}

function openFutureGame() {
  const prompts = [
    { key: "trip", question: "Sabse pehle saath kahan chalein?", options: ["🏔️ Pahaadon mein", "🌊 Samandar ke paas", "🏰 Kisi naye sheher mein"] },
    { key: "home", question: "Humara dream home kaisa ho?", options: ["🌿 Plants aur dhoop wala", "📚 Cozy books aur chai wala", "🐾 Pets aur hansi se bhara"] },
    { key: "life", question: "Future mein sabse zaroori kya ho?", options: ["💬 Hamesha khul ke baat", "😂 Saath mein bahut hansi", "🤝 Ek doosre ka support"] },
  ];
  const answers = {};
  let step = 0;
  function renderFuture() {
    if (step === prompts.length) {
      const story = `Ek din ${answers.trip.replace(/^[^ ]+ /, "")} jaane ka plan bana. Humare ghar mein ${answers.home.replace(/^[^ ]+ /, "").toLowerCase()} tha, aur hum dono ne decide kiya ki ${answers.life.replace(/^[^ ]+ /, "").toLowerCase()} hamesha yaad rakhenge. Yeh koi prediction nahi, bas humara ek pyaara sa khwaab hai — jo hum milke, ek din ek din karke, likh sakte hain.`;
      modalContent.innerHTML = shell("Humara ek khwaab", "Tumhare answers se bani ek chhoti si future story.", `<div class="game-result">${story}<small>Future ka pressure nahi. Bas ek khoobsurat possibility, tumhare saath. ♥</small></div><div class="game-controls"><button class="button button-dark" id="future-again">naya khwaab buno ↻</button></div>`);
      document.querySelector("#future-again").addEventListener("click", openFutureGame);
      burstHearts(10);
      return;
    }
    const prompt = prompts[step];
    modalContent.innerHTML = shell("Our Future Together", "Bas imagination hai, future ke liye koi pressure bilkul nahi. ♥", `<div class="quiz-progress">khwaab ${step + 1} / ${prompts.length}</div><div class="meter"><span style="width:${(step / prompts.length) * 100}%"></span></div><h3 class="date-step">${prompt.question}</h3><div class="quiz-options">${prompt.options.map((option) => `<button class="choice-button" data-future="${option}">${option}</button>`).join("")}</div>`);
    document.querySelectorAll("[data-future]").forEach((button) => button.addEventListener("click", () => {
      answers[prompt.key] = button.dataset.future;
      step += 1;
      renderFuture();
    }));
  }
  openModal("");
  renderFuture();
}

function openRunner() {
  openModal(shell("Reach Prashank’s Heart", "Lakshita ko dilon tak pahunchao! Space / ↑ dabao ya screen tap karke jump karo. 5 hearts collect karo aur obstacles se bacho.", `
    <div class="runner-hud"><span id="runner-score">dil: 0 / 5</span><span id="runner-lives">hearts: ♥ ♥ ♥</span></div>
    <div class="runner-wrap">
      <canvas class="runner-canvas" id="runner-canvas" width="760" height="310" aria-label="Runner game"></canvas>
      <div class="runner-overlay" id="runner-overlay"><div class="runner-overlay-inner"><p>Ready, Lakshita?</p><button class="button button-dark" id="runner-start">Prashank tak daudo ♥</button></div></div>
    </div>
    <p class="runner-hint">Space / ↑ / tap = jump. 5 dil ikattha karke mere paas aao!</p>
    <div id="runner-result" aria-live="polite"></div>`), "Reach Prashank's Heart");
  const canvas = document.querySelector("#runner-canvas");
  const ctx = canvas.getContext("2d");
  const avatar = new Image();
  avatar.src = "public/photos/lakshita.jpeg";
  let running = false;
  let raf;
  let score = 0;
  let lives = 3;
  let frame = 0;
  let jump = 0;
  let obstacles = [];
  let hearts = [];
  let finished = false;

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#f6e8d8");
    sky.addColorStop(1, "#e9c9bc");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#d9b49e";
    ctx.beginPath();
    ctx.ellipse(625, 205, 135, 85, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#b98177";
    ctx.fillRect(0, 258, w, 52);
    ctx.strokeStyle = "#f9e9d4";
    ctx.lineWidth = 3;
    ctx.setLineDash([18, 16]);
    ctx.beginPath();
    ctx.moveTo(0, 285);
    ctx.lineTo(w, 285);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "23px sans-serif";
    ctx.fillStyle = "#fff0e8";
    ctx.fillText("♥", 638, 180);
    ctx.fillText("♥", 677, 201);
    const playerY = 185 - jump;
    if (avatar.complete && avatar.naturalWidth) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(72, playerY, 58, 73, 16);
      ctx.clip();
      ctx.drawImage(avatar, 265, 40, 400, 590, 72, playerY, 58, 73);
      ctx.restore();
      ctx.strokeStyle = "#fff8ee";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(72, playerY, 58, 73, 16);
      ctx.stroke();
    } else {
      ctx.font = "55px sans-serif";
      ctx.fillText("🏃🏻‍♀️", 69, playerY + 60);
    }
    ctx.font = "24px sans-serif";
    hearts.forEach((item) => ctx.fillText("💗", item.x, item.y));
    obstacles.forEach((item) => ctx.fillText(item.type, item.x, 248));
    if (running) {
      frame += 1;
      jump = Math.max(0, jump - 3.2);
      obstacles.forEach((item) => { item.x -= 5; });
      hearts.forEach((item) => { item.x -= 5; });
      obstacles = obstacles.filter((item) => item.x > -40);
      hearts = hearts.filter((item) => item.x > -40);
      if (frame % 77 === 0) obstacles.push({ x: w + 20, type: Math.random() > .5 ? "🌵" : "🪨" });
      if (frame % 58 === 0) hearts.push({ x: w + 20, y: 165 + Math.random() * 35 });
      const playerBox = { left: 82, right: 123, top: playerY + 7, bottom: playerY + 68 };
      obstacles = obstacles.filter((item) => {
        const hit = item.x < playerBox.right && item.x + 30 > playerBox.left && playerBox.bottom > 208;
        if (hit) {
          lives -= 1;
          updateHud();
          showToast("Koi baat nahi, Lakshita. Phir se try karo! ♥");
        }
        return !hit;
      });
      hearts = hearts.filter((item) => {
        const hit = item.x < playerBox.right && item.x + 25 > playerBox.left && item.y > playerBox.top - 10 && item.y < playerBox.bottom + 15;
        if (hit) { score += 1; updateHud(); }
        return !hit;
      });
      if (score >= 5) endRunner(true);
      else if (lives <= 0) endRunner(false);
    }
    ctx.fillStyle = "#6b293c";
    ctx.font = "600 13px 'DM Sans', sans-serif";
    ctx.fillText("Prashank", 632, 238);
    if (running) raf = requestAnimationFrame(draw);
  }
  function updateHud() {
    document.querySelector("#runner-score").textContent = `dil: ${score} / 5`;
    document.querySelector("#runner-lives").textContent = `hearts: ${"♥ ".repeat(lives)}`;
  }
  function jumpAction() {
    if (!running) return;
    if (jump < 4) jump = 75;
  }
  function onKey(event) {
    if (["Space", "ArrowUp"].includes(event.code)) { event.preventDefault(); jumpAction(); }
  }
  function endRunner(won) {
    if (finished) return;
    finished = true;
    running = false;
    cancelAnimationFrame(raf);
    document.querySelector("#runner-overlay").hidden = true;
    document.querySelector("#runner-result").innerHTML = `<div class="game-result">${won ? "Lakshita mere dil tak pahunch gayi! ♥" : "Thak gayi? Koi baat nahi — mera dil kahin nahi ja raha."}<small>${won ? "Fireworks sirf tumhare liye. I love you, Lakshita!" : "Ek aur try? Is baar obstacles ko dikha dena!"}</small></div><div class="game-controls"><button class="button button-dark" id="runner-again">phir se khelo ↻</button></div>`;
    document.querySelector("#runner-again").addEventListener("click", openRunner);
    if (won) burstHearts(28);
    draw();
  }
  function startRunner() {
    score = 0; lives = 3; frame = 0; jump = 0; obstacles = []; hearts = []; finished = false; running = true;
    document.querySelector("#runner-result").innerHTML = "";
    document.querySelector("#runner-overlay").hidden = true;
    updateHud();
    draw();
  }
  document.querySelector("#runner-start").addEventListener("click", startRunner);
  canvas.addEventListener("pointerdown", jumpAction);
  document.addEventListener("keydown", onKey);
  draw();
  cleanupActiveGame = () => {
    running = false;
    cancelAnimationFrame(raf);
    document.removeEventListener("keydown", onKey);
    canvas.removeEventListener("pointerdown", jumpAction);
  };
}

const gameLaunchers = {
  catch: openCatchGame,
  date: openDateGame,
  quiz: openQuiz,
  virtual: openVirtualDate,
  future: openFutureGame,
  runner: openRunner,
};
document.querySelectorAll("[data-game]").forEach((button) => button.addEventListener("click", () => gameLaunchers[button.dataset.game]()));

const revealSections = document.querySelectorAll("main > section:not(.hero)");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });
  revealSections.forEach((section) => {
    section.classList.add("will-reveal");
    revealObserver.observe(section);
  });
} else {
  revealSections.forEach((section) => section.classList.add("is-revealed"));
}
