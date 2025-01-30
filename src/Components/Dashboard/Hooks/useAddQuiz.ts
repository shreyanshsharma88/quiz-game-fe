import { useForm } from "react-hook-form";

export interface IQuestions {
  question: string;
  answers: { label: string; isCorrect: boolean }[];
}
export const useAddQuiz = () => {
  const form = useForm({
    defaultValues: {
      name: "",
      players: [] as string[],
      questions: [] as IQuestions[],
    },
  });

  console.log({form: form.watch('questions')});
  

  return {
    form,
  };
};
