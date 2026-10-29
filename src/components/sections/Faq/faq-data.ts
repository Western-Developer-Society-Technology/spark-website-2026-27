// Questions are transcribed from frame 111:2. Answers are approved placeholders.
type FaqQuestion = { id: string; question: string; width: number };

export const FAQ_COLUMNS: readonly (readonly FaqQuestion[])[] = [
  [
    { id: "116:115", question: "What is Spark?", width: 171 },
    { id: "116:113", question: "What is a hackathon?", width: 244 },
    { id: "116:117", question: "What is a case competition?", width: 320 },
    { id: "116:119", question: "Who can participate?", width: 240 },
    { id: "116:121", question: "What if I’ve never been to a\nhackathon before?", width: 312 },
  ],
  [
    { id: "116:116", question: "How many hackers per team?", width: 337 },
    { id: "116:114", question: "Can I join virtually?", width: 211 },
    { id: "116:118", question: "Will there be travel reimbursements?", width: 410 },
    { id: "116:120", question: "When do hacker applications open?", width: 404 },
    { id: "116:122", question: "How does Spark combine a case\ncompetition with a hackathon?", width: 371 },
  ],
];

export const FAQ_PLACEHOLDER = "Coming soon.";
