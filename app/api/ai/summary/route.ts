import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, targetId } = await req.json();

    if (!sessionId || !targetId) {
      return NextResponse.json(
        { error: "缺少必要參數" },
        { status: 400 }
      );
    }

    // 目前回傳假資料
    const mockData = {
      strengths: [
        "工作態度積極認真",
        "團隊合作能力佳",
        "專業技能穩定",
      ],
      improvements: [
        "可以更主動溝通",
        "建議加強時間管理",
      ],
      suggestions: "整體表現良好，建議持續保持並在溝通方面多加練習。",
    };

    return NextResponse.json(mockData);
  } catch (error: any) {
    console.error("AI 建議生成失敗:", error);
    return NextResponse.json(
      { error: error.message || "生成失敗" },
      { status: 500 }
    );
  }
}

