import type { Client, Project } from "../types";

export const clients: Client[] = [
  {
    id: "1",
    name: "Jester Lawn & Land",
    businessName: "Jester Lawn & Land",
    email: "client@example.com",
    packageName: "Website Mockup + Logo",
    status: "Mockup Review",
    payment: "Unpaid Deposit",
    balance: "$250",
    depositDue: "$250",
    nextStep: "Review the mockup direction and pay deposit to begin the full build.",
    projectSummary:
      "A clean landing page preview with a luxury Phantom Forge feel, improved spacing, stronger visuals, and a free logo concept included.",
    squarePaymentLink: "#",
    filesNeeded: [
      "Logo files",
      "Service list",
      "Business photos",
      "Pricing or package details",
      "Preferred contact method",
    ],
  },
  {
    id: "2",
    name: "Garden of Ink",
    businessName: "Garden of Ink",
    email: "client@example.com",
    packageName: "Website Concept",
    status: "Lead / Outreach",
    payment: "No Invoice Sent",
    balance: "$0",
    depositDue: "$0",
    nextStep: "Send concept preview and offer the founding client package.",
    projectSummary:
      "A website concept for a tattoo studio currently relying on booking/social links instead of a full branded website.",
    squarePaymentLink: "#",
    filesNeeded: [
      "Studio photos",
      "Artist bios",
      "Booking link",
      "Tattoo style list",
      "Social links",
    ],
  },
  {
    id: "3",
    name: "Hair by Layla",
    businessName: "Hair by Layla",
    email: "client@example.com",
    packageName: "Landing Page",
    status: "Awaiting Content",
    payment: "Deposit Paid",
    balance: "$300",
    depositDue: "$0",
    nextStep: "Collect photos, service menu, and booking details.",
    projectSummary:
      "A polished landing page for a beauty service provider with booking-focused sections, service highlights, and local visibility support.",
    squarePaymentLink: "#",
    filesNeeded: [
      "Service menu",
      "Price list",
      "Client photos",
      "Booking link",
      "Brand colors",
    ],
  },
];

export const projects: Project[] = [
  {
    id: 1,
    title: "Client Portal MVP",
    type: "Internal Build",
    status: "In Progress",
    priority: "Urgent",
  },
  {
    id: 2,
    title: "Phantom Forge Portfolio Updates",
    type: "Agency Website",
    status: "Active",
    priority: "High",
  },
  {
    id: 3,
    title: "Square Payment Setup",
    type: "Payment System",
    status: "Next",
    priority: "High",
  },
];