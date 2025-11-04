"use client";

import { ThreadComposer } from "@daira/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ComposePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      router.push("/");
    },
  });

  const handleSubmit = (content: string, media?: File[]) => {
    mutation.mutate({ content, media });
  };

  return (
    <main className="min-h-screen bg-off-white p-4">
      <div className="mx-auto max-w-2xl pt-8">
        <h1 className="mb-6 text-3xl font-bold text-nile-blue">Create a Post</h1>
        <ThreadComposer onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
