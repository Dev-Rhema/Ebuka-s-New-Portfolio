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
// Pre-rasterized from Grass.svg: SVGs rasterize on the main thread, which
// stalled the scroll when the footer's dithered grass loaded.
import grass from "./assets/Knight/Grass.webp";

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
  grass,
};

export const KnightFigure = {
  view: { x: 91.5, y: 242, w: 534.5, h: 797.5 },
  tip: { y: 244 },
  sprite: { cols: 8, rows: 4, count: 32, fps: 24, cell: [425, 634], gap: 2 },
};

export const ContactEmail = "Ebuka@exodigital.org";

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

export const CaseStudyData = [
  {
    id: "piggyvest",
    logo: piggyLogo,
    name: "Piggyvest",
    headline:
      "Helping the Nigerian Fintech Powerhouse generate ₦50+ billion in inflow and acquired over 1 million users",
    summary:
      "Four years of paid media on Meta, Google, TikTok, Snapchat, Pinterest and Appnext. Every inflow attributed in AppsFlyer. Every user tracked from first click to first deposit.",
    link: "#",
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
        "Ebuka brings data to disagreements and that is one of his characteristics that sets him apart",
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
      "DANG sells in Nigeria, US, UK and Canada. We took over paid media, rebuilt the creative testing and attribution setup, and nearly doubled international ROAS in a single month.",
    link: "#",
    cover: dangCover,
    stat: {
      value: "340%",
      label: "Increase in Int’l Sales",
      image: dangStatImage,
    },
    testimonial: {
      title: "Insights from Ebuka to grow the business have been commendable",
      quote:
        "Our ads performed better due to Ebuka’s insights on the type of ads we used",
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
      "I ran paid acquisition on Meta and Google for the new product from August 2025 to January 2026, then oversaw creation of the assets that carried leads into the pipeline.",
    link: "#",
    cover: sendSprintCover,
    stat: {
      value: "1300",
      label: "Leads in 6 Months",
      image: sendSprintStatImage,
    },
    testimonial: {
      title: "Ebuka helped craft, refine and document our channel strategies",
      quote:
        "I look forward to my meetings with Ebuka because he shows up prepared, has a clear view of what’s working and what isn’t,",
      name: "Damisi (Dammy) Busari",
      role: "Founder & CEO of Sendsprint",
      avatar: sendSprintReviewer,
    },
  },
];
