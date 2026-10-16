import piggyLogo from "./assets/CaseImgs/piggy/case1Logo.svg";
import piggyCover from "./assets/CaseImgs/piggy/case1Flag.svg";
import piggyReviewer from "./assets/CaseImgs/piggy/case1Reviewer.svg";
import piggyStatImage from "./assets/CaseImgs/piggy/case1RHS.svg";
import dangLogo from "./assets/CaseImgs/Dang/case2Logo.svg";
import dangCover from "./assets/CaseImgs/Dang/case2Flag.svg";
import dangReviewer from "./assets/CaseImgs/Dang/case2Reviewer.svg";
import dangStatImage from "./assets/CaseImgs/Dang/case2RHS.svg";
import sendSprintLogo from "./assets/CaseImgs/SendS/case3Logo.svg";
import sendSprintCover from "./assets/CaseImgs/SendS/case3Flag.svg";
import sendSprintReviewer from "./assets/CaseImgs/SendS/case3Reviewer.svg";
import sendSprintStatImage from "./assets/CaseImgs/SendS/case3RHS.svg";

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
