/* ============================================================================
   THE DROP — THE TRADES (src/trades.js)

   WHY THIS FILE EXISTS

   The same link is sent to everyone who accepted the free website offer — a
   multi-sports coach selling a curriculum, a personal trainer in a gym, a
   guesthouse, a reggae bar, a café, a salon, a builder. They do not need the
   same page, the same questions, or the same six shots. They need the SAME
   MACHINE pointed at a different trade.

   So nothing below is a template with words swapped. Each trade is a different
   reading of the same four questions, and the answers change what the desk
   does:

     1. WHAT THE PAGE MUST DO  → `slots`   (the parts a page in this trade needs,
                                           and why this trade needs them)
     2. WHAT TO SHOOT          → `shots`   (a walkthrough is not "walk around";
                                           it is six specific frames with a
                                           reason each)
     3. WHAT TO ANSWER         → `answers` (the questions only the owner can
                                           answer, in the trade's own language)
     4. WHAT A STRANGER MUST
        BE ABLE TO FIND        → `must`    (the channels this trade is bought
                                           through — the desk's OWN reading of
                                           the market, stated as the desk's
                                           opinion, never as industry law)

   FAIL CLOSED, AND SAY SO

   An unknown trade is NOT guessed into the nearest one. `Trades.find` returns
   `other`, which is a real entry that says, in words, that the desk does not
   know this trade yet and asks the two questions that identify it. A wrong
   guess about someone's business is worse than an admitted gap: it produces a
   page that is confidently about the wrong thing.

   `must` is the desk's opinion. `shots` and `answers` are the desk's craft.
   Neither is a number, a price, or a promise — those come from the owner or
   they do not appear (see README.md → the three laws).
   ========================================================================== */
(function(){
"use strict";

const VERSION = "1.0";

/* -------------------------------------------------------------- the offer */
/* One reading, identical for every trade, because the subject is one thing.
   THE VOICE (doctrine): this is an ASSESSMENT, not an advertisement. It states
   what is observed, what it is usually made of, what would be built from what is
   already there, and what it costs — and it argues for nothing. No superlative,
   no urgency, no benefit promised, no "we". Where the desk is giving its own
   opinion it names itself as the reader ("in my reading"), because the opinion
   is the desk's and not a fact about the world. It does not sell; that is the
   point — a thing stated plainly enough to be checked is the whole offer. */
const OFFER = {
  headline: "A reading of what your business shows to someone already looking for it — on a phone, from a link.",
  line: "In my reading it comes to one of three things: nothing findable at all; a page that only really works on a laptop; or a page that never answers the questions people call to ask. What follows is what I would build out of what you already have on your phone — one walk around the place, a few photographs, your links, and your own voice answering five or six questions.",
  cost: "It costs about fifteen minutes with your phone and nothing else. There is no price on the work, nothing to sign up to, and nothing to cancel later — stated because it is a fact about the offer, not a reason to take it.",
  /* THE OTHER HALF OF THE SAME LAW. We do not sell the page — we take the data in
     and hand back the WORK, and the work is what decides it. Everything the desk
     collects exists so that a real artefact can be produced out of it (the reel,
     the sheet, the stills, the brief, and the page), and the owner judges the
     offer on that artefact rather than on any sentence here. So this line states
     the deliverable as a fact and then gets out of the way; it argues for
     nothing, and it is the only place on the page that says what is received. */
  proof: "What comes back is the work itself, not a description of it: the reel rendered from your own footage, the cover frame, a contact sheet in which every tile carries its own second, every still that was pulled, a brief stating what was read and what is missing — and the page built from your material and your words. You judge it on the thing in front of you, not on this page's account of it."
};

/* ============================================================== the trades */
/* Every entry has the same shape, so the desk can be pointed at any of them:

     id       — the slug used in the URL (?t=coach) and in the brief
     label    — how the desk names this trade to the owner
     aka      — the words that route an unparsed answer here
     noun     — how the desk refers to the owner's thing in its own copy
     need     — one line: what this trade is actually bought for
     slots    — the parts a page in this trade needs (and why)
     shots    — the walkthrough, as specific frames with a reason each
     answers  — the questions only the owner can answer
     must     — the channels this trade is found through (the desk's reading)
     proof    — what counts as proof in this trade
     words    — the register: what a page in this trade has to STATE, in the
                trade's own terms. It is written as an assessment, never as a
                pitch: the desk states, it does not sell (see OFFER, above).
     trap     — the one thing pages in this trade always get wrong
*/
const TRADES = [

  /* ------------------------------------------------------------------ 1 --- */
  {
    id: "coach",
    label: "a coach selling a programme",
    aka: ["coach","programme","program","curriculum","academy","lesson","lessons","swimming","sports","multi sports","training course","education","school club","after school","pe ","syllabus"],
    noun: "your programme",
    need: "a buyer deciding, on a phone, whether what you teach is worth putting in front of their child or their class — and being able to find the thing they want without asking you.",
    slots: [
      { id:"what",   name:"What it is",            why:"a coach's page sells a METHOD, not a person. The method has to be legible in one screen." },
      { id:"who",    name:"Who it is for",         why:"age, level, group size, and whether it needs a pool, a hall or a field. Buyers self-select; the wrong ones leave." },
      { id:"see",    name:"A session, watchable",  why:"the walkthrough reel is the argument. Nobody buys a curriculum from a bullet list." },
      { id:"search", name:"The content, searchable", why:"you said clients should be able to search it. So the page carries the index, and each item goes to its own address." },
      { id:"proof",  name:"Proof — who taught it", why:"a school or a parent is trusting you with children. Name the work, the years, the sessions delivered." },
      { id:"start",  name:"How to start",          why:"one action, one channel: a trial session, a sample pack, or a call." }
    ],
    shots: [
      { t:"the first ten seconds of a session, from the side — the ball, the whistle, the group mid-drill", why:"the buyer is buying the room, not the logo" },
      { t:"an overhead wide of the whole group, so the scale is real", why:"'small groups' is a claim; a wide shot is a measurement" },
      { t:"your hands, close, correcting one child's grip or stance", why:"that is the method. It is also the only shot nobody can fake" },
      { t:"the equipment laid out, or the pool, or the hall — empty, before anyone arrives", why:"it answers 'where does this happen, and is it a place I trust'" },
      { t:"a child grinning after doing the thing, and the parent watching", why:"the outcome, unposed. Do not direct it — wait for it" },
      { t:"you, talking to camera for fifteen seconds: what you teach and who it is for", why:"one honest sentence beats any written bio" }
    ],
    answers: [
      "What do you actually teach — in the words you would use to another coach?",
      "Who is it for: what age, what level, what group size?",
      "What does someone have to get to do it — a pool, a hall, a field, a school?"
    ],
    must: [
      { c:"instagram", why:"coaches — parent buyers look here before they message anyone" },
      { c:"whatsapp",  why:"the enquiry arrives as a message, not a form" },
      { c:"youtube",   why:"long session footage has to live somewhere, and buyers watch it" },
      { c:"google",    why:"';swimming lessons' + town' is the search that pays for the page" }
    ],
    proof: "sessions delivered, clubs or schools you have worked with, and a coach's or club's own name on record",
    words: "state what the child can do at the end that they could not do at the start — the sport is the vehicle, not the claim",
    trap: "the page describes the coach's qualifications and never shows a session. The buying decision happens in the footage."
  },

  /* ------------------------------------------------------------------ 2 --- */
  {
    id: "trainer",
    label: "a personal trainer or a small studio",
    aka: ["personal trainer","pt","gym","studio","fitness","crossfit","yoga","pilates","boxing","bootcamp","strength","conditioning"],
    noun: "your training",
    need: "the next person walking in, decided before they ever message you — because at your size every empty slot is the whole margin.",
    slots: [
      { id:"what",   name:"What training is",   why:"one-to-one, small group, or online — the buyer needs to know which of the three they are looking at" },
      { id:"when",   name:"Where and when",     why:"the studio address and the actual hours decide more enquiries than any headline" },
      { id:"see",    name:"A session, watchable", why:"trainers are bought on how a session feels, not on a transformation photo" },
      { id:"who",    name:"Who you train",      why:"weight loss, sport, rehab, first-timers. Say it, or the wrong people book and the right ones do not" },
      { id:"price",  name:"The shape of the cost", why:"you do not have to publish a price; you do have to say whether it is hourly, a block, or a membership" },
      { id:"start",  name:"One way to start",   why:"a first session or a free consultation — one action, one channel" }
    ],
    shots: [
      { t:"the studio empty, lights on — the whole room in one frame", why:"it answers 'is this a place I will feel stupid in'" },
      { t:"three seconds of a real set — the work, not the pose", why:"the argument is the effort, not the physique" },
      { t:"your hand on a barbell or a band, adjusting someone", why:"it is a hands-on trade; show the hands" },
      { t:"a client mid-laugh or mid-grimace with you beside them", why:"the reason people stay is the person, not the programme" },
      { t:"the equipment you actually own, close enough to identify", why:"'full gym' and 'two racks and a sled' are different offers" },
      { t:"you, fifteen seconds, to camera: what a first session looks like", why:"it removes the fear of the unknown, which is the real barrier" }
    ],
    answers: [
      "What training do you actually sell — one-to-one, pairs, small group, online?",
      "Who do you train, and who do you turn away?",
      "How does someone start, and what happens in their first session?"
    ],
    must: [
      { c:"instagram", why:"this trade is bought on sight, on a phone, and it is where the local search happens" },
      { c:"whatsapp",  why:"the enquiry is a message; a form loses it" },
      { c:"google",    why:"';gym near me' is the highest-intent search in the trade" },
      { c:"facebook",  why:"small studios still fill evening classes from local groups and pages" }
    ],
    proof: "clients on record, a first-session description, and any qualification a serious buyer would ask for",
    words: "state the first session in full, hour by hour — the obstacle is walking in, not wanting it",
    trap: "the whole page is before-and-after photos. They are the most-mistrusted image in the trade, and they win nothing."
  },

  /* ------------------------------------------------------------------ 3 --- */
  {
    id: "hotel",
    label: "a hotel or guesthouse",
    aka: ["hotel","guesthouse","guest house","b&b","bed and breakfast","resort","villa","homestay","rooms","inn","lodge"],
    noun: "your rooms",
    need: "a booking made directly, tonight, by someone who is already holding a phone and comparing three places — without going through the commission machine.",
    slots: [
      { id:"rooms",  name:"The rooms, one by one",  why:"a guest does not want 'our rooms'; they want the exact one they will sleep in" },
      { id:"price",  name:"The price, plainly",     why:"a hidden price loses the direct booking to the platform that shows it" },
      { id:"place",  name:"Where it is",            why:"the map, the street, and what is walkable from the door" },
      { id:"see",    name:"The place, at its best hour", why:"the walkthrough reel is the brochure, and it costs nothing" },
      { id:"book",   name:"How to book it",         why:"one action, one channel — WhatsApp, a phone, or a real booking link" },
      { id:"say",    name:"What guests say",        why:"one real quote with a real name outranks any adjective you can write" }
    ],
    shots: [
      { t:"the front door and the sign, from the street, arriving", why:"this is the first thing a guest will try to match to the map" },
      { t:"the walk from the door to the room — unbroken, no cuts", why:"it proves the place is real and the layout is what you say" },
      { t:"each room: the bed, the window, the light at the hour it is best", why:"'clean and quiet' is proven by the window and the made bed, not by the sentence" },
      { t:"the bathroom, honestly lit, tap running", why:"the room where a listing is most often lying, so the one where honesty pays" },
      { t:"breakfast, or the bar, in use — with people, not empty", why:"the empty-room photograph is why nobody books" },
      { t:"the view from the window, standing at the window", why:"the view is the product in half of this trade" }
    ],
    answers: [
      "How many rooms, and what are they — private, twin, dorm, family?",
      "What is the price, and does it change by night or season?",
      "How should someone book, and who answers it — you, or staff?"
    ],
    must: [
      { c:"google",   why:"the listing, the map pin and the reviews; without them the door does not exist to a stranger" },
      { c:"whatsapp", why:"direct booking happens in a message in most of the world" },
      { c:"instagram", why:"the place is chosen on sight, and photos are the listing" },
      { c:"booking",  why:"the platforms are where demand already is, whatever you think of their cut" },
      { c:"email",    why:"confirmations, long stays, and anything with a receipt" }
    ],
    proof: "real reviews with names, the years you have run it, and the actual address",
    words: "state the street and the morning, in the words of the person who lives there — the guest is imagining being there, and the room they can already picture",
    trap: "the landing page leads with a wide lobby or a stock bed. The guest's first question is the room they will sleep in."
  },

  /* ------------------------------------------------------------------ 4 --- */
  {
    id: "hostel",
    label: "a hostel, guesthouse or bar with a crowd",
    aka: ["hostel","dorm","dorms","backpacker","bar","rooftop","music venue","live music","reggae","community","common room","bunk"],
    noun: "the place",
    need: "a traveller deciding, between two hostels at the same price, where the evening will be better — and coming back through the same door next time.",
    slots: [
      { id:"beds",   name:"The beds, room by room",  why:"dorm, private, mixed or female — a traveller rules a place out on this alone" },
      { id:"vibe",   name:"The evening",            why:"this is the actual product. A hostel is bought for the people in the room at 9pm" },
      { id:"music",  name:"What happens here",      why:"live nights, jam nights, the rooftop — dates, not adjectives" },
      { id:"price",  name:"Price and how to book",  why:"both, on the same screen, or the platform takes the booking" },
      { id:"place",  name:"Where it is",            why:"the lane, the district, and what is walkable" },
      { id:"start",  name:"One way in",             why:"a WhatsApp message that a human answers tonight" }
    ],
    shots: [
      { t:"the sign and the door, at night, lit", why:"it is the only landmark a walker has, and the brand lives on it" },
      { t:"the room you are proudest of, made up, lamp on", why:"one honest room beats six staged ones" },
      { t:"the bar or common room with people actually in it", why:"the entire decision, in one frame" },
      { t:"the music: a band, a DJ, or someone's phone on the speaker, playing", why:"'live music' has to be shown or it is a claim" },
      { t:"the staff, doing the thing they do", why:"the people are the reason people come back" },
      { t:"up the stairs and out onto the roof or balcony, in one move", why:"the walk is the promise; the destination is the payoff" }
    ],
    answers: [
      "How many beds, what mix — dorm, private, female-only?",
      "What happens here in a normal week, on which nights?",
      "How does someone book, and what is the price for each room?",
      "What do you want to be known for that no booking site will say for you?"
    ],
    must: [
      { c:"instagram", why:"this trade lives on photograph, tag and story" },
      { c:"whatsapp",  why:"the booking and the questions both arrive there" },
      { c:"google",    why:"the map pin and the reviews decide the walk from the next street" },
      { c:"booking",   why:"the platforms hold the demand, even when you want it direct" },
      { c:"facebook",  why:"events and nights still fill from a local page" }
    ],
    proof: "real guest reviews, a busy night photographed, and the names of the music nights",
    words: "state that the evening is allowed, and what it sounds like — the traveller is arranging a night they will talk about",
    trap: "the page shows empty rooms and calls itself a community. The community is the one thing that cannot be shown empty."
  },

  /* ------------------------------------------------------------------ 5 --- */
  {
    id: "cafe",
    label: "a café or a restaurant",
    aka: ["cafe","café","coffee","restaurant","kitchen","eatery","bistro","diner","food","bakery","brunch","street food"],
    noun: "your food",
    need: "a hungry person, within walking distance, deciding in under a minute — and finding the menu without messaging you to ask what is on it.",
    slots: [
      { id:"menu",   name:"The menu, readable",     why:"the single most requested thing on any food page, and the one most pages hide behind a PDF" },
      { id:"price",  name:"The price of the food",  why:"a price range removes the 'is this place for me' question before it is asked" },
      { id:"when",   name:"Open, and until when",   why:"hours are the second-most asked question in the trade" },
      { id:"place",  name:"Where, and how to sit",  why:"the map, the door, and whether there is a table outside" },
      { id:"see",    name:"The food and the room",  why:"food is photographed or it is not sold" },
      { id:"order",  name:"How to order or book",   why:"one action: a table, a pre-order, or a delivery app" }
    ],
    shots: [
      { t:"the plate the way it is actually served, in daylight, close", why:"food photography is the whole advertisement; bad light is the whole loss" },
      { t:"the room in service — people at tables, half-full", why:"a full room is a claim; a half-full room is believable" },
      { t:"the kitchen, or whoever cooks, in the middle of it", why:"it is the trust shot and it costs nothing to take" },
      { t:"the window seat or the outside tables, from the street", why:"the passer-by is deciding right now, from the pavement" },
      { t:"a hand pouring, plating, or pulling — three seconds", why:"motion makes food look alive in a way a still never will" },
      { t:"the sign, at the hour the place is actually busy", why:"people navigate by the sign, and the sign should be photographed when it matters" }
    ],
    answers: [
      "What do you cook that nobody else nearby does?",
      "What is the range of a meal — from what, to what?",
      "What are the hours, and is there a day you close?",
      "Should people book, pre-order, or just turn up?"
    ],
    must: [
      { c:"google",    why:"';food near me' and the map are how the trade is found, full stop" },
      { c:"instagram", why:"the menu is browsed on a phone before the visit" },
      { c:"whatsapp",  why:"the pre-order and the booking both come as messages" },
      { c:"delivery",  why:"where delivery exists, its absence is simply lost orders" }
    ],
    proof: "a real menu with real prices, the actual hours, and photographs of the actual plates",
    words: "state the plate for someone who has not eaten today: what it is, how it is cooked, what it costs",
    trap: "the menu is a photograph of a laminated card, or a PDF. Neither can be read on the phone the customer is holding."
  },

  /* ------------------------------------------------------------------ 6 --- */
  {
    id: "salon",
    label: "a salon, barber or beauty studio",
    aka: ["salon","barber","hairdresser","hair","beauty","nails","spa","massage","tattoo","waxing","lashes"],
    noun: "your work",
    need: "a booking made by someone who has looked at your prices and your work, and decided on the evidence of both — without a phone call.",
    slots: [
      { id:"services", name:"Services and prices", why:"this is the entire enquiry. Anything else is decoration" },
      { id:"work",     name:"Your work, per service", why:"a cut or a colour is bought on sight; the gallery is the shop window" },
      { id:"book",     name:"Booking, without calling", why:"if they have to ring, you lose the ones who are at work" },
      { id:"when",     name:"Open, and when you are free", why:"hours decide the booking more than the price does" },
      { id:"place",    name:"Where the chair is", why:"the salon address, with the door, so they can find it" },
      { id:"who",      name:"Who does what",       why:"a client books a person, not a salon" }
    ],
    shots: [
      { t:"a finished cut or set, from three angles, in the salon's own light", why:"the work is the product; shoot what you would show a friend" },
      { t:"the chair and the mirror, in use — hands mid-work", why:"the craft is what justifies the price" },
      { t:"the room: how many chairs, what it smells like, what the light is", why:"the room is the atmosphere the client is buying time in" },
      { t:"before and after of one real client who agreed", why:"the single most effective image in the trade, when it is real" },
      { t:"the products used, named", why:"buyers in this trade know brands and ask" },
      { t:"you, ten seconds, on your own work", why:"the personality sells the appointment" }
    ],
    answers: [
      "List the services and the price of each, as you would say them out loud.",
      "How long does each one take?",
      "Do people book, or walk in?",
      "Who works here, and who should be booked by name?"
    ],
    must: [
      { c:"instagram", why:"this trade is bought from a photograph and booked from a message" },
      { c:"google",    why:"the map pin, the hours and the reviews; the walking-distance customer starts here" },
      { c:"whatsapp",  why:"the booking is a message, not a form" },
      { c:"booking",   why:"any real booking system beats a telephone that nobody wants to use at work" }
    ],
    proof: "a price list, a named review, and a portfolio of your own work (not stock)",
    words: "state the chair and the time — the client is booking how they will feel leaving, and how long it will take",
    trap: "a gallery of other salons' work, or heavily filtered images. It reads as dishonesty in a trade built on faces."
  },

  /* ------------------------------------------------------------------ 7 --- */
  {
    id: "trades",
    label: "a trade — a builder, plumber, electrician or repair",
    aka: ["builder","plumber","electrician","carpenter","roofer","painter","decorator","contractor","handyman","repair","installation","hvac","mechanic","landscaping"],
    noun: "your work",
    need: "a job enquiry from someone two streets away, who needs to know you are real, local, and free this week — before they ring the next name in the list.",
    slots: [
      { id:"what",    name:"What you do, in list form", why:"people arrive searching for one specific job, not a trade" },
      { id:"area",    name:"Where you work",           why:"the radius is the first filter and the first question" },
      { id:"work",    name:"Finished jobs, before and after", why:"a trade is bought on evidence, and the evidence is a finished job" },
      { id:"trust",   name:"Who you are, verified",    why:"you are being let into a home. Name, face, registration, insurance" },
      { id:"call",    name:"One way to reach you",     why:"a phone that a person answers. Everything else is optional" },
      { id:"when",    name:"How soon",                 why:"'how soon can you come' is the question the page must pre-answer" }
    ],
    shots: [
      { t:"a finished job, wide, from the same angle as the before picture", why:"the before-and-after pair is the whole portfolio" },
      { t:"a job in progress, mid-work, tools in hand", why:"it proves you do the work rather than broker it" },
      { t:"your van, your tools, your mate — the operation, as it is", why:"scale is a reassurance in this trade, not a vanity" },
      { t:"the last ten seconds of a job: something working", why:"a tap running, a light on, a door closing properly" },
      { t:"a customer saying one sentence about the job", why:"a named local reference beats every badge on the page" },
      { t:"you, fifteen seconds, on what you will and will not take on", why:"the wrong job costs you more than the right job earns" }
    ],
    answers: [
      "What jobs do you take, and which ones do you refuse?",
      "How far will you travel, and from where?",
      "How does someone get a price — a visit, a photo, or a day rate?",
      "How soon do you usually come out?"
    ],
    must: [
      { c:"google",    why:"the map, the reviews and the 'near me' search are the whole lead flow" },
      { c:"phone",     why:"this trade is still won by a phone that gets answered" },
      { c:"whatsapp",  why:"photos of the problem arrive there before the job does" },
      { c:"facebook",  why:"local groups still generate the neighbours' recommendations" }
    ],
    proof: "named local jobs, a real address or service area, and any registration or insurance that applies",
    words: "state the certainty: when you will come, what it will cost, and who is standing in the kitchen",
    trap: "stock photographs of other people's building work. Every customer in this trade has been lied to before."
  },

  /* ------------------------------------------------------------------ 8 --- */
  {
    id: "shop",
    label: "a shop or something sold online",
    aka: ["shop","store","boutique","retail","brand","supplier","wholesale","products","ecommerce","online store","etsy","amazon","ebay","marketplace"],
    noun: "your stock",
    need: "the buyer finding the exact thing among everything you sell, and trusting this seller over a marketplace listing — on a phone, in under a minute.",
    slots: [
      { id:"stock",  name:"What you sell, searchable", why:"if it cannot be searched or clicked, it is not for sale" },
      { id:"each",   name:"A page per product",        why:"every item needs its own address to be linkable and findable" },
      { id:"price",  name:"Price, and what is in it",  why:"shipping, size, and what is included — the questions that stall a basket" },
      { id:"buy",    name:"How to buy it",             why:"one action, one channel, and it must work on a phone" },
      { id:"trust",  name:"Who is selling",            why:"an unknown seller needs a face, a place, and a way back" },
      { id:"why",    name:"Why here and not there",    why:"the marketplace is the competitor, and this page is the argument against it" }
    ],
    shots: [
      { t:"the product, held in a hand, for scale", why:"scale is the first unanswerable question about any object online" },
      { t:"the product in use, in the place it is used", why:"context sells an object far better than a white background" },
      { t:"the full range, laid out together", why:"it shows a real seller with real stock, not a dropshipper" },
      { t:"the detail a buyer always asks about — the clasp, the seam, the fitting", why:"answering the unasked question before it is asked" },
      { t:"packing an order", why:"it proves the thing can actually reach the buyer" },
      { t:"you, ten seconds, on why you sell this", why:"the story is the only advantage over an identical listing" }
    ],
    answers: [
      "What do you sell, and what do you sell most of?",
      "What does it cost, and what does the buyer get for that?",
      "How do people order, and how does it reach them?",
      "Why should someone buy from you rather than from a marketplace?"
    ],
    must: [
      { c:"instagram", why:"this is how a small seller is discovered and then trusted" },
      { c:"whatsapp",  why:"the order and the questions both arrive as messages" },
      { c:"google",    why:"the branded search must land somewhere the seller owns" },
      { c:"shop",      why:"a real product page per item is what makes the range findable at all" }
    ],
    proof: "a real photograph of real stock, a return address or policy, and named buyers",
    words: "state the object as it will be used, and answer the two questions that stop a basket: does it fit, and when does it arrive",
    trap: "everything is on one page, or behind a marketplace link. A seller who does not own the address does not own the customer."
  },

  /* ------------------------------------------------------------------ 9 --- */
  {
    id: "other",
    label: "something I have not named yet",
    aka: [],
    noun: "your work",
    need: "a stranger understanding, in one screen, what this is and what to do next.",
    slots: [
      { id:"what",  name:"What this is",        why:"the only universal requirement" },
      { id:"who",   name:"Who it is for",       why:"a page for everyone is a page for nobody" },
      { id:"see",   name:"It, seen",            why:"a walkthrough works for almost anything real" },
      { id:"price", name:"What it costs",       why:"the shape of the cost, even if not the number" },
      { id:"where", name:"Where it is",         why:"or how it reaches the person who wants it" },
      { id:"start", name:"One way to act",      why:"one action, one channel" }
    ],
    shots: [
      { t:"the sign, the door or the front of the thing, from where a stranger would arrive", why:"first contact, as a customer experiences it" },
      { t:"the whole place or the whole thing, in one wide shot", why:"scale, honestly" },
      { t:"the thing itself, close", why:"the product or the work, unmediated" },
      { t:"someone using it or being served by it", why:"proof that it exists and works" },
      { t:"the person who runs it, saying what it is", why:"the shortest possible explanation, in their own voice" },
      { t:"the view from the door, looking back out", why:"where it sits in the world" }
    ],
    answers: [
      "What is this, in the words you would use to a friend?",
      "Who is it for?",
      "What does it cost, and how does someone get it?",
      "What should a person do after looking at your page?"
    ],
    must: [
      { c:"google",   why:"the map and the search; almost every trade needs them" },
      { c:"whatsapp", why:"the fastest channel to a real human" },
      { c:"instagram", why:"the cheapest way to be seen at all" }
    ],
    proof: "anything a stranger could check: a name, a place, a review, a photograph of real work",
    words: "state plainly what it is, who it is for, and what to do next — then stop",
    trap: "producing a page about the owner's feelings, with no answer to what this is or what to do next."
  }
];

/* ====================================================================== api */

const byId = {};
TRADES.forEach(function(t){ byId[t.id] = t; });

function get(id){
  if(!id) return null;
  const k = String(id).trim().toLowerCase();
  if(byId[k]) return byId[k];
  /* an alias might have been used as an id in a URL (?t=reggae) */
  const hit = TRADES.filter(function(t){ return t.aka.indexOf(k) !== -1; })[0];
  return hit || null;
}

/* Route a free-text answer (a client's own description of their business, or a
   wrong/missing ?t=) to a trade. Scores by alias hits, longest alias first, so
   "reggae bar" beats "bar". NO GUESS when nothing matches: `other` is returned
   and the caller is told it was not identified — which the desk then says out
   loud rather than building a confidently wrong page. */
function find(text){
  const s = " " + String(text || "").toLowerCase().replace(/[^a-z0-9&\s]/g, " ").replace(/\s+/g, " ") + " ";
  if(!s.trim()) return { trade: byId.other, hit:false, why:"nothing to route" };
  let best = null, bestLen = 0, bestAlias = null;
  TRADES.forEach(function(t){
    t.aka.forEach(function(a){
      const al = " " + a.toLowerCase() + " ";
      if(s.indexOf(al) !== -1 && a.length > bestLen){ best = t; bestLen = a.length; bestAlias = a; }
    });
  });
  if(!best) return { trade: byId.other, hit:false, why:"no trade in the desk's list matched those words" };
  return { trade: best, hit:true, why:'matched "' + bestAlias + '"' };
}

/* Can this browser do the job at all? Answered before anything is asked of the
   client — the desk never takes fifteen minutes of someone's footage and then
   discovers it cannot render. */
function can(win){
  win = win || window;
  return {
    file:   typeof win.FileReader !== "undefined",
    canvas: !!win.createImageBitmap,
    video:  !!win.document.createElement("video").canPlayType,
    encode: typeof win.VideoEncoder !== "undefined",
    record: typeof win.MediaRecorder !== "undefined",
    stream: !!(win.document.createElement("canvas").captureStream),
    mic:    !!(win.navigator && win.navigator.mediaDevices && win.navigator.mediaDevices.getUserMedia),
    zip:    true
  };
}

window.Trades = {
  version: VERSION,
  OFFER: OFFER,
  ALL: TRADES,
  IDS: TRADES.map(function(t){ return t.id; }),
  get: get, find: find, can: can
};
})();
