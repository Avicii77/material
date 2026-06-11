"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import * as fs from "fs/promises";
import * as path from "path";

export interface EarlyAccessSubmission {
  email: string;
  companyName: string;
  contactName: string;
  businessType: string;
  message?: string;
}

export async function submitEarlyAccess(data: EarlyAccessSubmission) {
  // Simple validation
  if (!data.email || !data.email.includes("@")) {
    return { success: false, error: "올바른 이메일 주소를 입력해 주세요." };
  }
  if (!data.companyName.trim()) {
    return { success: false, error: "회사명을 입력해 주세요." };
  }
  if (!data.contactName.trim()) {
    return { success: false, error: "담당자명을 입력해 주세요." };
  }
  if (!data.businessType) {
    return { success: false, error: "업태/역할을 선택해 주세요." };
  }

  const payload = {
    email: data.email.trim(),
    company_name: data.companyName.trim(),
    contact_name: data.contactName.trim(),
    business_type: data.businessType,
    message: data.message?.trim() || null,
  };

  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { error } = await supabase
        .from("early_access_leads")
        .insert([payload]);

      if (error) {
        console.error("Supabase insert error:", error);
        return { success: false, error: `등록 중 오류가 발생했습니다: ${error.message}` };
      }

      return { success: true, dbSaved: true };
    } else {
      // Graceful degradation: save to local JSON file
      const filePath = path.join(process.cwd(), "early_access_submissions.json");
      let existing: Record<string, unknown>[] = [];
      try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        existing = JSON.parse(fileContent);
      } catch {
        // File doesn't exist yet, proceed with empty array
      }

      existing.push({
        ...payload,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      });

      await fs.writeFile(filePath, JSON.stringify(existing, null, 2), "utf-8");
      console.log("Supabase not configured. Lead saved to early_access_submissions.json:", payload);

      return {
        success: true,
        dbSaved: false,
        message: "로컬 파일(early_access_submissions.json)에 성공적으로 저장되었습니다. (Supabase 미연결)",
      };
    }
  } catch (error: unknown) {
    console.error("Action error:", error);
    return { success: false, error: "서버 처리 중 오류가 발생했습니다." };
  }
}
