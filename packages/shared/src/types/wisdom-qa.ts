export type QuestionStatus = "open" | "answered" | "closed";

export type WisdomQuestion = {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName?: string;
  isAnonymous: boolean;
  status: QuestionStatus;
  categoryId?: string;
  tags?: string[];
  answerCount: number;
  createdAt: string;
};

export type WisdomAnswer = {
  id: string;
  questionId: string;
  body: string;
  authorId: string;
  authorName?: string;
  isAccepted: boolean;
  createdAt: string;
};
