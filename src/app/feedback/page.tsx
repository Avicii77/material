import { FeedbackForm } from "@/components/feedback-form";

export const dynamic = "force-dynamic";

export default function FeedbackPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-medium tracking-tight text-ink">문의 / 피드백</h1>
        <p className="mt-3 text-sm leading-7 text-sub">
          서비스에 바라는 점이나 불편한 점을 자유롭게 남겨주세요. 답변이 필요하면 이메일을 함께 적어주세요.
        </p>
      </div>
      <FeedbackForm />
    </main>
  );
}
