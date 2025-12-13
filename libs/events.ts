export type Event = {
  id: string;
  title: string;
  fromdate: Date; 
  todate: Date; 
  location: string;
  department: string;
  image: any;
  description: string;
  markdown?: string; // New optional field
};

export const defaultEvent: Event = {
  id: "default",
  title: "Keynote: The Future of AI",
  fromdate: new Date("2024-07-03T10:30:00"), // Example Date object
  todate: new Date("2024-07-03T11:30:00"), // Example Date object
  location: "SDJ Auditorium",
  department: "Cultural",
  image: require("@/assets/event-placeholder.png"),
  description:
    "Join us for an inspiring talk on the evolving landscape of artificial intelligence and its impact on everyday life.",
  markdown: `
# The Future of AI
**Speaker:** Dr. Elena Vance  
**Duration:** 1 Hour

Join us for a transformative session exploring:
* The current state of Generative AI.
* Ethical considerations in automation.
* Predictions for 2030 and beyond.
  `,
};

export type EventCardTheme =
  | "gold"
  | "midnight"
  | "emerald"
  | "crimson"
  | "glass";

export const EVENTS: (Event & { theme: EventCardTheme; category: string })[] = [
  {
    id: "1",
    title: "Cyberpunk: AI Revolution",
    fromdate: new Date("2024-10-12T10:00:00"),
    todate: new Date("2024-10-12T11:00:00"),
    location: "Main Auditorium",
    department: "Tech",
    category: "Tech",
    description:
      "Explore the neon-lit future of generative AI and its ethical implications.",
    image: {
      uri: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop",
    },
    theme: "midnight",
    markdown: `
# Cyberpunk: AI Revolution

**Is the future bright or dystopian?**

Join us for a deep dive into the neon-lit world of advanced Artificial Intelligence. This session isn't just about code; it's about the philosophy of existence in a digital age.

## 📅 Agenda
- **10:00 AM:** Intro to Neural Networks
- **10:45 AM:** The "Black Box" Problem
- **11:30 AM:** Panel Discussion: Ethics of Synthetic Humans

## 🧠 Key Topics
1. **Generative Adversarial Networks (GANs):** How machines dream.
2. **Cyber-Security:** Protecting thoughts in the cloud.
3. **The Singularity:** Are we close?

> "The sad thing about artificial intelligence is that it lacks artifice and therefore intelligence." — *Jean Baudrillard*
    `,
  },
  {
    id: "2",
    title: "Golden Era Jazz Night",
    fromdate: new Date("2024-10-12T19:00:00"),
    todate: new Date("2024-10-12T20:00:00"),
    location: "Open Air Theatre",
    department: "Music",
    category: "Cultural",
    description:
      "A soulful evening paying tribute to the legends of Jazz with live saxophone.",
    image: {
      uri: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1000&auto=format&fit=crop",
    },
    theme: "gold",
    markdown: `
# Golden Era Jazz Night 🎷

Step back in time to the roaring 20s and the soulful 50s.

## 🎵 The Lineup
We are proud to host the *Midnight Blue Quartet* featuring lead saxophonist **Marcus Cole**.

### Set List
* *Take Five* - Dave Brubeck
* *So What* - Miles Davis
* *Feeling Good* - Nina Simone
* *Original Compositions*

## 🍷 Venue Details
The Open Air Theatre will be transformed into a speakeasy vibe. 
* **Dress Code:** Smart Casual / Vintage
* **Refreshments:** Mocktails and Hors d'oeuvres served.
    `,
  },
  {
    id: "3",
    title: "Eco-Future Workshop",
    fromdate: new Date("2024-10-13T14:00:00"),
    todate: new Date("2024-10-13T16:00:00"),
    location: "Green Hall",
    department: "Science",
    category: "Workshop",
    description:
      "Hands-on workshop on sustainable living, zero-waste strategies, and urban farming.",
    image: {
      uri: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop",
    },
    theme: "emerald",
    markdown: `
# Eco-Future Workshop 🌱

**Sustainability starts with you.** 

This interactive workshop is designed to give you practical tools to reduce your carbon footprint immediately.

## 🛠 What We Will Build
Participants will create their own **Self-Watering Terrarium** to take home.

## 📚 Syllabus
1. **Zero-Waste Home:** Simple swaps for plastic.
2. **Urban Farming:** Growing food on a balcony.
3. **Energy:** Understanding solar potential.

## Requirements
* Please bring one empty 2L clear plastic bottle.
* All other soil and seeds provided.
    `,
  },
  {
    id: "4",
    title: "Red Velvet Gala",
    fromdate: new Date("2024-10-14T20:30:00"),
    todate: new Date("2024-10-14T22:30:00"),
    location: "Grand Ballroom",
    department: "Fashion",
    category: "Cultural",
    description:
      "The biggest fashion showcase of the year featuring avant-garde designs in crimson.",
    image: {
      uri: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=1000&auto=format&fit=crop",
    },
    theme: "crimson",
    markdown: `
# The Red Velvet Gala 💃

Witness the intersection of **Haute Couture** and **Modern Art**. 

Our final year fashion students present their thesis collection: *CRIMSON TIDES*.

## 👠 The Runway
* **Act I:** Victorian Gothic Revival
* **Act II:** Cyber-Red Streetwear
* **Act III:** The Velvet Finale

## 📸 Press & Photography
Flash photography is permitted only during the final walk. 

> "Fashion is the armor to survive the reality of everyday life." — *Bill Cunningham*
    `,
  },
  {
    id: "5",
    title: "Minimalist Design Talk",
    fromdate: new Date("2024-10-15T11:00:00"),
    todate: new Date("2024-10-15T12:00:00"),
    location: "Design Studio",
    department: "Art",
    category: "Workshop",
    description:
      "Less is more. A deep dive into the philosophy of subtraction in modern UI/UX design.",
    image: {
      uri: "https://images.unsplash.com/photo-1507643179173-617d6a1366a6?q=80&w=1000&auto=format&fit=crop",
    },
    theme: "glass",
    markdown: `
# Minimalist Design Talk

**"Less, but better."**

Explore the Dieter Rams approach to digital product design. We will analyze how stripping away the non-essential enhances user experience.

## 🖌 Topics
* **Whitespace:** Why empty space is an active element.
* **Typography:** Choosing fonts that breathe.
* **Color Theory:** Monochromatic palettes.

## 👨‍💻 Live Critique
Submit your portfolio link before the session for a chance to have your UI reviewed live by our expert panel.
    `,
  },
  {
    id: "6",
    title: "Hackathon: Code Red",
    fromdate: new Date("2024-10-16T09:00:00"),
    todate: new Date("2024-10-16T11:00:00"),
    location: "Tech Labs",
    department: "Coding",
    category: "Tech",
    description:
      "24-hour coding marathon. Build, break, and deploy solutions for real-world crisis.",
    image: {
      uri: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop",
    },
    theme: "crimson",
    markdown: `
# Hackathon: Code Red 🚨

**24 Hours. Infinite Coffee. One Mission.**

Can you code a solution to a global crisis overnight? 

## 🏆 Prizes
* **1st Place:** $10,000 + Cloud Credits
* **2nd Place:** VR Headsets
* **3rd Place:** Mechanical Keyboards

## 📜 Rules
1. Teams of 2-4 members.
2. All code must be written during the event.
3. Open source libraries are allowed.

## 🍕 Logistics
* **Food:** Pizza and Energy Drinks provided every 6 hours.
* **Rest:** Sleeping pods available in Lab B.
    `,
  },
];