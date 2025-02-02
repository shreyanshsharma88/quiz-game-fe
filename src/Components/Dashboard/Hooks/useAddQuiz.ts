import { useForm } from "react-hook-form";

export interface IQuestions {
  question: string;
  answers: { label: string; isCorrect: boolean; answerId?: string }[];
  questionId?: string;
}
export const useAddQuiz = () => {
  const form = useForm({
    defaultValues: {
      name: "",
      players: [] as { userId: string; username: string }[],
      questions: [] as IQuestions[],
    },
  });


  return {
    form,
  };
};
