export const GIRLFRIEND_PHOTO = "/photos/lakshita.jpeg";

export const PHOTOS = [
  { src: "/photos/photo-01.jpeg", title: "Dhoop, hawa aur tum", note: "Us din ki dhoop se zyada warm tumhari smile thi." },
  { src: "/photos/photo-02.jpeg", title: "Bas yunhi saath", note: "Jab tum paas hoti ho toh duniya thodi aur achhi lagti hai." },
  { src: "/photos/photo-03.jpeg", title: "Ek pyaari si selfie", note: "Tumhari smile dekh ke meri smile automatic aa jaati hai." },
  { src: "/photos/photo-04.jpeg", title: "Purani yaadein", note: "School wali yeh photo dekh ke dil karta hai us pal ko phir se jee loon." },
  { src: "/photos/photo-05.jpeg", title: "Hamari shaam", note: "Tum aur main, aur ek aisi shaam jo yaad ban gayi." },
  { src: "/photos/photo-06.jpeg", title: "Mera favourite moment", note: "Tumhari khushi dekhna, honestly, meri favourite cheez hai." },
  { src: "/photos/photo-07.jpeg", title: "Close to my heart", note: "Tumhare paas aake sab kuch apni jagah par lagta hai." },
  { src: "/photos/photo-08.jpeg", title: "Ek aur favourite", note: "Photo chhoti si, par ismein meri poori duniya aa gayi." },
  { src: "/photos/lakshita.jpeg", title: "Meri roshni", note: "Tum apni roshni se har jagah ko khoobsurat bana deti ho." },
];

export const DEFAULT_PROFILE = {
  girlfriend: "Lakshita",
  boyfriend: "Prashank",
  about: "Tumhari kindness, tumhari hasi, aur jis tarah tum chhoti chhoti baaton ko special bana deti ho — yahi tumhe meri favourite person banata hai. Tum jaisi ho, bilkul waisi hi bahut pyaari ho.",
  letter: "Tumhare saath ki simple si moments — ek photo, ek hasi, ek random si baat — mere liye bahut precious hain. Main perfect nahi hoon, par tumhare liye better banne ki koshish hamesha karunga. Jab tum ready ho, main tumhari baat sunne ke liye yahin hoon.",
  questions: [
    { question: "Meri favourite agent ka naam kya hai?", answer: "Lakshita", hint: "Yeh mission usi ke naam hai." },
    { question: "Mere dil ka secret password kya hai?", answer: "love", hint: "Woh chhoti si cheez jo is poore mission ke peeche hai." },
    { question: "Humari sabse achhi team ka naam kya hai?", answer: "together", hint: "Do log, ek team." },
    { question: "Main tumhe hamesha kya feel karana chahta hoon?", answer: "loved", hint: "Ek warm feeling, jo tum deserve karti ho." },
  ],
};

export const DEFAULT_PROGRESS = {
  accepted: false,
  declined: false,
  completed: 0,
  evidence: [],
  memoryStep: 0,
  openedGifts: [],
  treasureOpened: false,
  plantedFlowers: [],
  gardenCount: 0,
  future: { destination: "", promise: "" },
  calendar: [],
};

export const EVIDENCE = [
  { id: "heart", emoji: "💗", name: "The Heart", message: "Clue secured: tumhara dil hi mera favourite place hai." },
  { id: "letter", emoji: "💌", name: "The Letter", message: "Clue secured: har unsent letter mein tumhara naam tha." },
  { id: "photo", emoji: "📸", name: "The Photograph", message: "Clue secured: meri favourite memories mein tum ho." },
  { id: "flower", emoji: "🌷", name: "The Flower", message: "Clue secured: tumhare aane se har din bloom karta hai." },
  { id: "key", emoji: "🗝️", name: "The Key", message: "Clue secured: mere dil ki key tumhare paas hai." },
];

export const GIFT_MESSAGES = [
  { title: "A tiny reminder", message: "Tumhari ek smile mere poore din ka plot twist badal sakti hai." },
  { title: "Secret evidence", message: "Har photo mein ek hi clue milta hai: main tumhare saath lucky hoon." },
  { title: "For your pocket", message: "Jab kabhi din heavy lage, yaad rakhna: tum bahut loved ho." },
];

export const FLOWERS = ["🌷", "🌻", "🌼", "🌸", "💐", "🌺", "🪻", "🌹"];

export const NAV_ITEMS = [
  ["home", "Home", "01"],
  ["about", "❤️ About Her", "02"],
  ["memories", "Memories", "03"],
  ["letters", "Letters", "04"],
  ["games", "Games", "05"],
  ["garden", "Garden", "06"],
  ["music", "Music", "07"],
  ["surprises", "Surprises", "08"],
  ["future", "Our Future", "09"],
  ["calendar", "Calendar", "10"],
];
