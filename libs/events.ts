export type Event = {
  id: string;
  title: string;
  fromdate: Date;
  todate: Date;
  location: string;
  department: string;
  image: any;
  description: string;
  markdown?: string;
  theme: EventCardTheme;
  category: string;
};

export type EventCardTheme =
  | "gold"
  | "midnight"
  | "emerald"
  | "crimson"
  | "glass";

// NOTE: Dates are set relative to the current context (Dec 14, 2025) 
// to demonstrate the status tags properly.

export const EVENTS: Event[] = [
  {
    id: "1",
    title: "Cyberpunk: AI Revolution",
    // DATE: Today, a few hours from now
    fromdate: new Date("2025-12-14T09:00:00"),
    todate: new Date("2025-12-14T11:00:00"),
    location: "Main Auditorium",
    department: "Tech",
    category: "Tech",
    theme: "midnight",
    description:
      "Explore the neon-lit future of generative AI and its ethical implications.",
    image: {
      uri: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop",
    },
    markdown: `
# Cyberpunk: AI Revolution

**Is the future bright or dystopian?**

Join us for a deep dive into the neon-lit world of advanced Artificial Intelligence. This session isn't just about code; it's about the philosophy of existence in a digital age.

![AI Brain](https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000)

## 🎙️ Speaker Profile
**Dr. Arinze Takahashi**  
*Chief AI Ethicist at NeuroCorp*

Dr. Takahashi has spent the last decade working on the "Black Box" problem in Neural Networks. His controversial paper *"Do Androids Pray?"* sparked a global debate on machine consciousness.

---

## 📅 Agenda

| Time | Topic |
| :--- | :--- |
| **09:00 AM** | Intro: The State of GANs |
| **09:45 AM** | Panel: The Singularity Paradox |
| **10:30 AM** | Q&A Session |

## 🧠 Key Topics
1. **Generative Adversarial Networks:** How machines dream.
2. **Cyber-Security:** Protecting thoughts in the cloud.
3. **The Singularity:** Are we close?

> "The sad thing about artificial intelligence is that it lacks artifice and therefore intelligence." — *Jean Baudrillard*
    `,
  },
  {
    id: "2",
    title: "Golden Era Jazz Night",
    // DATE: Today, Evening
    fromdate: new Date("2025-12-14T19:00:00"),
    todate: new Date("2025-12-14T21:30:00"),
    location: "Open Air Theatre",
    department: "Music",
    category: "Cultural",
    theme: "gold",
    description:
      "A soulful evening paying tribute to the legends of Jazz with live saxophone.",
    image: {
      uri: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1000&auto=format&fit=crop",
    },
    markdown: `
# Golden Era Jazz Night 🎷

Step back in time to the roaring 20s and the soulful 50s. The Open Air Theatre will be transformed into a speakeasy vibe with dim lighting and velvet seating.

![Jazz Band](https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&q=80&w=1000)

## 🎵 The Lineup
We are proud to host the *Midnight Blue Quartet* featuring lead saxophonist **Marcus Cole**.

### Set List
* *Take Five* - Dave Brubeck
* *So What* - Miles Davis
* *Feeling Good* - Nina Simone
* *Original Compositions*

## 🍷 Venue Details
* **Dress Code:** Smart Casual / Vintage
* **Refreshments:** Mocktails and Hors d'oeuvres served.
* **Seating:** First come, first served.

> "Jazz is not just music, it is a way of life, it is a way of being, a way of thinking." — *Nina Simone*
    `,
  },
  {
    id: "3",
    title: "Eco-Future Workshop",
    // DATE: Yesterday (Ended)
    fromdate: new Date("2025-12-13T14:00:00"),
    todate: new Date("2025-12-13T16:00:00"),
    location: "Green Hall",
    department: "Science",
    category: "Workshop",
    theme: "emerald",
    description:
      "Hands-on workshop on sustainable living, zero-waste strategies, and urban farming.",
    image: {
      uri: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop",
    },
    markdown: `
# Eco-Future Workshop 🌱

**Sustainability starts with you.** 

This interactive workshop is designed to give you practical tools to reduce your carbon footprint immediately.

![Plants](https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=1000)

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
    // DATE: Next Week (Upcoming)
    fromdate: new Date("2025-12-20T20:30:00"),
    todate: new Date("2025-12-20T22:30:00"),
    location: "Grand Ballroom",
    department: "Fashion",
    category: "Cultural",
    theme: "crimson",
    description:
      "The biggest fashion showcase of the year featuring avant-garde designs in crimson.",
    image: {
      uri: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=1000&auto=format&fit=crop",
    },
    markdown: `
# The Red Velvet Gala 💃

Witness the intersection of **Haute Couture** and **Modern Art**. 

Our final year fashion students present their thesis collection: *CRIMSON TIDES*.

![Fashion Runway](https://images.unsplash.com/photo-1537832816519-689ad163238b?auto=format&fit=crop&q=80&w=1000)

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
    // DATE: Past
    fromdate: new Date("2025-11-15T11:00:00"),
    todate: new Date("2025-11-15T12:00:00"),
    location: "Design Studio",
    department: "Art",
    category: "Workshop",
    theme: "glass",
    description:
      "Less is more. A deep dive into the philosophy of subtraction in modern UI/UX design.",
    image: {
      uri: "https://images.unsplash.com/photo-1507643179173-617d6a1366a6?q=80&w=1000&auto=format&fit=crop",
    },
    markdown: `
# Minimalist Design Talk

**"Less, but better."**

Explore the Dieter Rams approach to digital product design. We will analyze how stripping away the non-essential enhances user experience.

![Clean Desk](https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000)

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
    // DATE: Next Month
    fromdate: new Date("2026-01-16T09:00:00"),
    todate: new Date("2026-01-17T09:00:00"),
    location: "Tech Labs",
    department: "Coding",
    category: "Tech",
    theme: "crimson",
    description:
      "24-hour coding marathon. Build, break, and deploy solutions for real-world crisis.",
    image: {
      uri: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop",
    },
    markdown: `
# Hackathon: Code Red 🚨

**24 Hours. Infinite Coffee. One Mission.**

Can you code a solution to a global crisis overnight? 

![Coding Screen](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000)

## 🏆 Prizes
| Place | Prize |
| :--- | :--- |
| **1st** | $10,000 + Cloud Credits |
| **2nd** | VR Headsets |
| **3rd** | Mechanical Keyboards |

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