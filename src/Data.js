import piggyStaff from "./assets/CaseImgs/piggy/piggyStaff.svg";
import piggyStaffFlag from "./assets/CaseImgs/piggy/piggyStaffFlag.svg";
import piggyCover from "./assets/CaseImgs/piggy/case1Flag.svg";
import piggyReviewer from "./assets/CaseImgs/piggy/case1Reviewer.svg";
import piggyStatImage from "./assets/CaseImgs/piggy/case1RHS.svg";

export const CaseStudyData = [
  {
    id: "piggyvest",
    logo: piggyStaff,
    logoFlag: piggyStaffFlag,
    name: "Piggyvest",
    headline:
      "Helping the Nigerian Fintech Powerhouse generate ₦50+ billion in inflow and acquired over 1 million users",
    summary:
      "Four years of paid media on Meta, Google, TikTok, Snapchat, Pinterest and Appnext. Every inflow attributed in AppsFlyer. Every user tracked from first click to first deposit.",
    link: "#",
    cover: piggyCover,
    stat: {
      naira: true,
      value: "50b",
      label: "Inflow Generated",
      image: piggyStatImage,
    },
    testimonial: {
      title: "Ebuka is the founders dream for marketing",
      quote:
        "Working with Ebuka was a dream come true. He understands his craft remarkably well",
      name: "Joshua Chibueze",
      role: "Co-Founder/CMO PiggyVest",
      avatar: piggyReviewer,
    },
  },
];
