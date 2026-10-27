import headerImg from "./assets/headerImg.webp";
import headerImgNoBg from "./assets/headerImgNoBg.webp";
import piggyvestWordmark from "./assets/Brands/piggyvest.svg";
import instagramThumb from "./assets/HeroImgs/instagramThumb.jpg";
import aboutBrand1 from "./assets/AboutImgs/aboutBrand1.svg";
import aboutBrand2 from "./assets/AboutImgs/aboutBrand2.svg";
import aboutBrand3 from "./assets/AboutImgs/aboutBrand3.svg";
import aboutIconCircle from "./assets/AboutImgs/aboutIconCircle.svg";
import aboutIconShadow from "./assets/AboutImgs/aboutIconShadow.png";
import cardBack from "./assets/Brands/Card - Back.svg";
import ace from "./assets/Brands/Card - Front/Ace.svg";
import ace1 from "./assets/Brands/Card - Front/Ace-1.svg";
import ace2 from "./assets/Brands/Card - Front/Ace-2.svg";
import spade from "./assets/Brands/Card - Front/Spade.svg";
import spade1 from "./assets/Brands/Card - Front/Spade-1.svg";
import spade2 from "./assets/Brands/Card - Front/Spade-2.svg";
import heart from "./assets/Brands/Card - Front/Heart.svg";
import heart1 from "./assets/Brands/Card - Front/Heart-1.svg";
import heart2 from "./assets/Brands/Card - Front/Heart-2.svg";
import diamonds from "./assets/Brands/Card - Front/Diamonds.svg";
import diamonds1 from "./assets/Brands/Card - Front/Diamonds-1.svg";
import diamonds2 from "./assets/Brands/Card - Front/Diamonds-2.svg";
import flagStaff from "./assets/CaseImgs/flagStaff.svg";
import piggyLogo from "./assets/CaseImgs/piggy/case1Logo.svg";
import piggyCover from "./assets/CaseImgs/piggy/case1Flag.webp";
import piggyReviewer from "./assets/CaseImgs/piggy/case1Reviewer.webp";
import piggyStatImage from "./assets/CaseImgs/piggy/case1RHS.webp";
import dangLogo from "./assets/CaseImgs/Dang/case2Logo.svg";
import dangCover from "./assets/CaseImgs/Dang/case2Flag.webp";
import dangReviewer from "./assets/CaseImgs/Dang/case2Reviewer.webp";
import dangStatImage from "./assets/CaseImgs/Dang/case2RHS.webp";
import sendSprintLogo from "./assets/CaseImgs/SendS/case3Logo.svg";
import sendSprintCover from "./assets/CaseImgs/SendS/case3Flag.webp";
import sendSprintReviewer from "./assets/CaseImgs/SendS/case3Reviewer.webp";
import sendSprintStatImage from "./assets/CaseImgs/SendS/case3RHS.webp";
import skillCard from "./assets/Skills/skillCard.svg";
import skillDome from "./assets/Skills/skillDome.webp";
import dataAnalysisIcon from "./assets/Skills/skillIcons/dataAnalysis.svg";
import contentStrategyIcon from "./assets/Skills/skillIcons/contentStrategy.svg";
import growthMarketingIcon from "./assets/Skills/skillIcons/growthMarketing.svg";
import marketingStrategyIcon from "./assets/Skills/skillIcons/digitalMarketing.svg";
import advertisingIcon from "./assets/Skills/skillIcons/advertising.svg";
import knightSprite from "./assets/Knight/knight-sprite.webp";
import knightSpriteAvif from "./assets/Knight/knight-sprite.avif";
import grass from "./assets/Knight/Grass.webp";
import piggyBanner from "./assets/CaseImgs/CasePageBanners/piggyBanner.webp";
import dangBanner from "./assets/CaseImgs/CasePageBanners/dangBanner.webp";
import sendSprintBanner from "./assets/CaseImgs/CasePageBanners/sendSprintBanner.webp";
import videoThumb from "./assets/CaseImgs/videoThumb.jpg";

const aboutBrands = [aboutBrand1, aboutBrand2, aboutBrand3];

export {
  headerImg,
  headerImgNoBg,
  piggyvestWordmark,
  instagramThumb,
  aboutBrands,
  aboutIconCircle,
  aboutIconShadow,
  cardBack,
  flagStaff,
  skillCard,
  skillDome,
  knightSprite,
  knightSpriteAvif,
  grass,
};

export const KnightFigure = {
  view: { x: 91.5, y: 242, w: 534.5, h: 797.5 },
  tip: { y: 244 },
  sprite: { cols: 8, rows: 4, count: 32, fps: 24, cell: [425, 634], gap: 2 },
};

export const ContactEmail = "Ebuka@exodigital.org";

export const ChatLink = "https://calendly.com/ebuka-exodigital/new-meeting";

export const SocialLinks = [
  { name: "X", href: "https://x.com/Daevee007" },
  { name: "Instagram", href: "#" },
  { name: "YouTube", href: "https://www.youtube.com/@theexodigital" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/ebuka-chidube" },
];

export const SkillsData = [
  {
    title: "Data Analysis",
    description: "Data helps us plan ahead.",
    icon: {
      src: dataAnalysisIcon,
      className: "-top-26.5 -left-102.5 w-253",
      rotation: -24,
    },
  },
  {
    title: "Content Strategy",
    description: "Content is king. I am a kingmaker.",
    icon: {
      src: contentStrategyIcon,
      className: "-top-25 -left-95.75 w-216",
      rotation: -12,
    },
  },
  {
    title: "Advertising",
    description:
      "I have mastered the skill of turning zero to one with paid media.",
    icon: {
      src: advertisingIcon,
      className: "-top-25 -left-84.75 w-170",
      rotation: 0,
    },
  },
  {
    title: "Marketing Strategy",
    description: "Love it when a good plan comes together.",
    icon: {
      src: marketingStrategyIcon,
      className: "-top-25 -left-119.75 w-216",
      rotation: 12,
    },
  },
  {
    title: "Growth Marketing",
    description: "Driving growth and scaling numbers.",
    icon: {
      src: growthMarketingIcon,
      className: "-top-25 -left-84.75 w-170",
      rotation: 0,
    },
  },
];

export const StatsData = [
  { value: "20", label: "Brands Worked With" },
  { value: "3m", label: "New Customers Acquired" },
  { value: "3b", naira: true, label: "Total Revenue Generated" },
  { value: "70b", naira: true, label: "Total Inflow Attributed" },
];

export const SpiralCards = [
  { src: ace, alt: "Piggyvest" },
  { src: spade, alt: "Lenco" },
  { src: heart, alt: "SendSprint" },
  { src: diamonds, alt: "Pocket by Piggyvest" },
  { src: ace1, alt: "i-Fitness" },
  { src: spade1, alt: "Brand card" },
  { src: heart1, alt: "Brand card" },
  { src: diamonds1, alt: "AltSchool" },
  { src: ace2, alt: "Crossroads Restaurant & Bar" },
  { src: spade2, alt: "Brand card" },
  { src: heart2, alt: "Brand card" },
  { src: diamonds2, alt: "Truckmasters" },
];

// Placeholder answer until each question has its real answer.
const answerPlaceholder =
  "DANG sells in Nigeria, US, UK and Canada. We took over paid media, rebuilt the creative testing and attribution setup, and nearly doubled international ROAS in a single month.";

const piggyvestQuestions = [
  [
    "Paid Acquisitions Before Me",
    "What did paid acquisition look like before you came in?",
    "Before joining PiggyVest in 2023, customer acquisition relied heavily on organic growth and referrals. Introducing paid acquisition meant building an entirely new system from the ground up. Here’s how that journey unfolded and laid the foundation for a more data-driven approach to growth.",
  ],
  [
    "Need for Different Strategies on Different Platforms",
    "Why does a savings app need different strategies for iOS and Android?",
    "iOS and Android users may use the same savings app, but their behaviours, spending patterns, and conversion journeys can be surprisingly different. Discover why understanding these differences is essential to building effective campaigns and making smarter decisions about targeting, content, and budgets.",
  ],
  [
    "Decision Making on Running Channels",
    "How did you decide which channels to run and which to leave alone?",
    "Choosing the right advertising channel goes beyond driving app installs. It’s about understanding where your ideal users spend their time and how they interact with their devices. Discover how these insights shape channel selection and help attract users who are more likely to engage with your app.",
  ],
  [
    "Setting Up Trustworthy Attribution",
    "How did you set up attribution so the business could trust what the ads were telling it?",
    "Not all users engage with a savings app in the same way, and understanding their true value requires more than guesswork. Discover how accurate attribution and tools like AppsFlyer help connect marketing spend to user behaviour, measure campaign performance, and make smarter decisions about where to invest.",
  ],
  [
    "Spotting Winning Ads",
    "What tells you an ad is a winner, and what do you do once you find one?",
    "What makes an ad a true winner, and how do you keep it performing long after launch? Discover how identifying patterns in successful creatives, refining messaging, and understanding audience behaviour can help turn strong-performing ads into repeatable, long-term results.",
  ],
  [
    "Keeping Stakeholders in the Loop",
    "How did you report to leadership so they understood performance without you in the room?",
    "Great campaign performance means little if you can’t communicate its impact on the business. From finance teams to senior leadership, different stakeholders care about different metrics. Learn how tailored reporting and effective data storytelling can influence decisions, demonstrate value, and build confidence in marketing investments.",
  ],
  [
    "Ensuring the Business Understood the Caveats",
    "How do you keep trust when the business wants to double spend and you know efficiency will drop?",
    "Increasing your advertising budget doesn’t always guarantee better results. Scaling campaigns requires careful planning, fresh creatives, and a clear understanding of what drives performance. This video explores the importance of balancing ambitious business targets with sustainable campaign growth, without compromising what already works.",
  ],
  [
    "A Call I Got Wrong",
    "What is one call you got wrong on this account, and what did it teach you?",
    "Even the strongest marketing ideas don’t always deliver the expected results. When assumptions meet market realities, the ability to adapt becomes just as important as the original strategy. This video explores the value of testing hypotheses, recognising when to change direction, and turning setbacks into lessons for future campaigns.",
  ],
].map(([label, question, answer]) => ({
  label,
  question,
  answer: [answer],
}));

// In each videos folder, question-N.mp4 and its poster question-N.webp answer question N.
// Durations are in seconds, so the player can show each length before its video has loaded.
const withVideos = (questions, media, folder, durations) =>
  questions.map((item, i) => {
    const file = `${folder}/question-${i + 1}`;
    return {
      ...item,
      video: media[`${file}.mp4`],
      poster: media[`${file}.webp`],
      duration: durations[i],
    };
  });

const piggyvestVideoQuestions = withVideos(
  piggyvestQuestions,
  import.meta.glob("./assets/CaseImgs/piggy/videos/*", {
    eager: true,
    import: "default",
  }),
  "./assets/CaseImgs/piggy/videos",
  [64.2, 78.6, 68.1, 63, 77.5, 66.9, 79.1, 39.6],
);

// Answers to follow; until then each question shows only its video.
const sendSprintQuestions = withVideos(
  [
    [
      "The Product Pivot",
      "What does a product pivot do to a paid media strategy?",
    ],
    [
      "From Diaspora Senders to Banks",
      "How do you market to a bank when the old audience was a diaspora sender?",
    ],
    [
      "What a B2B Funnel Needs",
      "What does a B2B lead gen funnel need that a consumer app campaign does not?",
    ],
    [
      "Defining a Qualified Lead",
      "How did you define a qualified lead, and who agreed on that bar?",
    ],
    [
      "Going Beyond Ads",
      "Why did the work expand from ads into landing pages, sales copy and a white paper?",
    ],
    [
      "Keeping Long Sales Cycles Moving",
      "How do you keep leads moving when the sales cycle is months, not minutes?",
    ],
    [
      "What I Got Wrong",
      "What is one thing you got wrong, and how did you fix it?",
    ],
  ].map(([label, question]) => ({ label, question, answer: [] })),
  import.meta.glob("./assets/CaseImgs/SendS/videos/*", {
    eager: true,
    import: "default",
  }),
  "./assets/CaseImgs/SendS/videos",
  [51.3, 83.9, 97.6, 53.8, 48.6, 68, 50.7],
);

// DANG borrows Piggyvest's questions, with a placeholder answer and thumbnail,
// until its own are ready.
const placeholderQuestions = piggyvestQuestions.map((item) => ({
  ...item,
  answer: [answerPlaceholder, answerPlaceholder],
  thumbnail: videoThumb,
}));

export const CaseStudyData = [
  {
    id: "piggyvest",
    logo: piggyLogo,
    name: "Piggyvest",
    headline:
      "Helping the Nigerian Fintech Powerhouse generate ₦50+ billion in inflow and acquired over 1 million users",
    summary:
      "Four years of paid media on Meta, Google, TikTok, Snapchat, Pinterest and Appnext. Every inflow attributed in AppsFlyer.",
    link: "/case-study/piggyvest",
    banner: piggyBanner,
    questions: piggyvestVideoQuestions,
    cover: piggyCover,
    stat: {
      naira: true,
      plus: true,
      value: "50b",
      label: "Inflow Generated",
      image: piggyStatImage,
    },
    testimonial: {
      title: "Ebuka exhibits a great combination of speed and judgment",
      quote:
        "Ebuka brings data to disagreements and that is one of his characteristics that sets him apart.",
      name: "Joshua Chibueze",
      role: "Co-Founder/CMO PiggyVest",
      avatar: piggyReviewer,
    },
  },
  {
    id: "dang",
    logo: dangLogo,
    name: "DANG",
    headline:
      "I helped a Nigerian skincare brand double its paid revenue in two months and grow international sales by 340%.",
    summary:
      "DANG sells in Nigeria, US, UK and Canada. We took over ads, and nearly doubled international ROAS in 1 month.",
    link: "/case-study/dang",
    // Placeholder: Piggyvest's questions until DANG's are ready.
    banner: dangBanner,
    questions: placeholderQuestions,
    cover: dangCover,
    stat: {
      value: "340%",
      label: "Increase in Int’l Sales",
      image: dangStatImage,
    },
    testimonial: {
      title: "Insights from Ebuka to grow the business have been commendable",
      quote:
        "Our ads performed better due to Ebuka’s insights on the type of ads we used.",
      name: "Ifedayo Agoro",
      role: "CEO at Dang! Lifestyle",
      avatar: dangReviewer,
    },
  },
  {
    id: "sendsprint",
    logo: sendSprintLogo,
    name: "SendSprint",
    headline:
      "Helped a US remittance company launch its pivot to Remittance-as-a-Service and generate 1,300 qualified B2B leads in 6 months.",
    summary:
      "I ran paid acquisition on Meta and Google for the new product a year, then oversaw processes that brought leads.",
    link: "/case-study/sendsprint",
    banner: sendSprintBanner,
    questions: sendSprintQuestions,
    cover: sendSprintCover,
    stat: {
      value: "1300",
      label: "Leads in 6 Months",
      image: sendSprintStatImage,
    },
    testimonial: {
      title: "Ebuka helped craft, refine and document our channel strategies",
      quote:
        "I look forward to my meetings with Ebuka because he shows up prepared, he always has an action plan.",
      name: "Damisi (Dammy) Busari",
      role: "Founder & CEO of Sendsprint",
      avatar: sendSprintReviewer,
    },
  },
];
