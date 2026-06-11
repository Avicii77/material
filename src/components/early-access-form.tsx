"use client";

import React, { useState } from "react";
import { submitEarlyAccess } from "@/app/actions";

const BUSINESS_TYPES = [
  { value: "제조사", label: "화장품 제조사 (OEM/ODM)" },
  { value: "브랜드사", label: "소규모/신생 브랜드" },
  { value: "연구소", label: "연구소 / 포뮬레이터" },
  { value: "원료 유통사", label: "원료 유통사 / 제조원" },
  { value: "기타", label: "기타 (1인 창업자 등)" },
];

export function EarlyAccessForm() {
  const [formData, setFormData] = useState({
    email: "",
    companyName: "",
    contactName: "",
    businessType: "",
    message: "",
  });

  const [status, setStatus] = useState<{
    state: "idle" | "submitting" | "success" | "error";
    message?: string;
  }>({ state: "idle" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ state: "submitting" });

    // Client-side quick check
    if (!formData.email || !formData.email.includes("@")) {
      setStatus({ state: "error", message: "올바른 이메일 주소를 입력해 주세요." });
      return;
    }
    if (!formData.companyName.trim()) {
      setStatus({ state: "error", message: "회사명을 입력해 주세요." });
      return;
    }
    if (!formData.contactName.trim()) {
      setStatus({ state: "error", message: "담당자명을 입력해 주세요." });
      return;
    }
    if (!formData.businessType) {
      setStatus({ state: "error", message: "업태/역할을 선택해 주세요." });
      return;
    }

    try {
      const response = await submitEarlyAccess(formData);
      if (response.success) {
        setStatus({
          state: "success",
          message: response.message || "성공적으로 사전 등록되었습니다!",
        });
        setFormData({
          email: "",
          companyName: "",
          contactName: "",
          businessType: "",
          message: "",
        });
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
      <div className="rounded-[32px] border border-line bg-card p-8 text-center shadow-[0_22px_70px_rgb(26_22_21_/_0.05)] sm:p-10">
        <div className="mx-auto flex h-16 size-16 items-center justify-center rounded-full bg-[#e6f4ea] text-2xl text-[#137333]">
          ✓
        </div>
        <h3 className="mt-6 text-2xl font-semibold text-ink">사전 신청이 완료되었습니다!</h3>
        <p className="mt-4 text-sm leading-relaxed text-sub">
          {status.message} <br />
          정식 출시 준비 및 특별 혜택 안내를 기재하신 이메일로 보내드리겠습니다. <br />
          ReCos에 관심을 가져주셔서 진심으로 감사드립니다.
        </p>
        <button
          onClick={() => setStatus({ state: "idle" })}
          className="mt-8 rounded-full bg-accent px-6 py-3 text-xs font-semibold text-white transition hover:opacity-90 active:scale-95"
        >
          추가 등록하기
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-line bg-card p-6 shadow-[0_22px_70px_rgb(26_22_21_/_0.05)] sm:p-10">
      <h3 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        ReCos Early Access 신청
      </h3>
      <p className="mt-2 text-xs leading-5 text-sub sm:text-sm">
        사전 등록해 주시는 분들께 서비스 정식 오픈 시 원료 우선 거래 권한 및 수수료 할인 혜택을 드립니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="companyName" className="block text-xs font-semibold uppercase tracking-wider text-sub">
              회사명
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="예: 리코스 테크놀로지"
              required
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3.5 text-sm text-ink placeholder:text-sub/55 focus:border-ink focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="contactName" className="block text-xs font-semibold uppercase tracking-wider text-sub">
              담당자명
            </label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              placeholder="예: 홍길동"
              required
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3.5 text-sm text-ink placeholder:text-sub/55 focus:border-ink focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-sub">
              이메일 주소
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3.5 text-sm text-ink placeholder:text-sub/55 focus:border-ink focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="businessType" className="block text-xs font-semibold uppercase tracking-wider text-sub">
              업태 / 역할
            </label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3.5 text-sm text-ink focus:border-ink focus:outline-none transition-colors appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23757170' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 1rem center",
                backgroundSize: "1.25rem",
                backgroundRepeat: "no-repeat",
                paddingRight: "2.5rem"
              }}
            >
              <option value="" disabled>역할을 선택해 주세요</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-sub">
            필요한 원료 또는 바라는 점 (선택)
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="자주 구하는 원료 품목이나, 잉여 원료 순환 서비스에 바라는 점을 자유롭게 적어주세요."
            rows={3}
            className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3.5 text-sm text-ink placeholder:text-sub/55 focus:border-ink focus:outline-none transition-colors resize-none"
          />
        </div>

        {status.state === "error" && (
          <div className="rounded-xl bg-[#fdf2f2] p-4 text-xs font-semibold text-[#b3401f]">
            ⚠ {status.message}
          </div>
        )}

        <button
          type="submit"
          disabled={status.state === "submitting"}
          className="w-full rounded-full bg-accent py-4 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-50"
        >
          {status.state === "submitting" ? "등록 중..." : "얼리 액세스 신청하기"}
        </button>
      </form>
    </div>
  );
}
