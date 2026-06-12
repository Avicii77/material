"use client";

import React, { useState } from "react";
import { submitFeedback } from "@/app/actions";

export function FeedbackForm() {
  const [formData, setFormData] = useState({
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<{
    state: "idle" | "submitting" | "success" | "error";
    message?: string;
  }>({ state: "idle" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ state: "submitting" });

    if (!formData.message.trim()) {
      setStatus({ state: "error", message: "내용을 입력해 주세요." });
      return;
    }

    try {
      const response = await submitFeedback(formData);
      if (response.success) {
        setStatus({ state: "success" });
        setFormData({ email: "", message: "" });
      } else {
        setStatus({
          state: "error",
          message: response.error || "제출 중 오류가 발생했습니다.",
        });
      }
    } catch (err) {
      setStatus({ state: "error", message: "네트워크 오류가 발생했습니다. 다시 시도해 주세요." });
    }
  };

  if (status.state === "success") {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center shadow-[0_22px_70px_rgb(26_22_21_/_0.05)]">
        <h3 className="text-2xl font-semibold text-ink">의견 감사합니다!</h3>
        <p className="mt-4 text-sm leading-relaxed text-sub">
          보내주신 피드백은 서비스 개선에 활용됩니다.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ state: "idle" })}
          className="mt-8 rounded-full bg-accent px-6 py-3 text-xs font-semibold text-white transition hover:opacity-90 active:scale-95"
        >
          다시 작성하기
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-6 shadow-[0_22px_70px_rgb(26_22_21_/_0.05)] sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-sub">
            이메일 (선택)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@company.com"
            className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3.5 text-sm text-ink placeholder:text-sub/55 transition-colors focus:border-ink focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-sub">
            내용
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="서비스에 바라는 점이나 불편한 점을 적어주세요."
            required
            rows={5}
            className="mt-2 w-full resize-none rounded-2xl border border-line bg-bg px-4 py-3.5 text-sm text-ink placeholder:text-sub/55 transition-colors focus:border-ink focus:outline-none"
          />
        </div>

        {status.state === "error" && (
          <div className="rounded-xl bg-[#fdf2f2] p-4 text-xs font-semibold text-[#b3401f]">
            {status.message}
          </div>
        )}

        <button
          type="submit"
          disabled={status.state === "submitting"}
          className="w-full rounded-full bg-accent py-4 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-50"
        >
          {status.state === "submitting" ? "보내는 중..." : "피드백 보내기"}
        </button>
      </form>
    </div>
  );
}
