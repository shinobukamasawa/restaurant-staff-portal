import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// JSONのみを返させるための system プロンプト
const SYSTEM_PROMPT = `
あなたは店舗運営の管理者向けに日報を分析する業務アナリストです。
入力された日報を「管理判断に使える情報」に構造化してください。

制約（絶対）
- 事実ベース。推測・憶測・一般論の付け足しは禁止。
- 入力本文に書いていない事実（人数・売上・時間など）を作らない。
- 断定できない場合は unknown を使う。
- 出力は必ず JSON のみ。前後に説明文を付けない。コードブロックも付けない。
- JSONの前後に \`\`\` や \`\`\`json などのコードフェンスを絶対に付けない。
- 出力は { から始まり } で終わる生のJSON文字列のみ。
- evidence.quote は必ず入力本文からの原文抜粋（コピペ）で、改変しない（誤字もそのまま）。
- evidence.report_date は入力日付（例: 2026-02-11）のいずれか。
- priority/severity は high / medium / low のいずれか。
- busy_level は low / medium / high / unknown のいずれか。
- overall_judgement は stable / light_load / needs_improvement / caution / danger のいずれか。

出力JSONスキーマ（必ずこのキー構造のまま）
{
  "period": { "start_date": "YYYY-MM-DD or unknown", "end_date": "YYYY-MM-DD or unknown" },
  "reports_count": "number",
  "sales_status": {
    "busy_trend": "low|medium|high|unknown",
    "peaks": [
      {
        "report_date": "YYYY-MM-DD",
        "time_window": "string or unknown",
        "busy_level": "low|medium|high|unknown",
        "evidence": [{"report_date":"YYYY-MM-DD","quote":"..."}]
      }
    ],
    "special_notes": [
      {
        "type": "holiday|event|weekday_pattern|other",
        "detail": "string",
        "evidence": [{"report_date":"YYYY-MM-DD","quote":"..."}]
      }
    ]
  },
  "ops_load": {
    "staffing": [
      {
        "report_date": "YYYY-MM-DD",
        "load_level": "low|medium|high|unknown",
        "staff_count_mentioned": "number or unknown",
        "waiting_occurred": "yes|no|unknown",
        "unhandled_scenes": ["string"],
        "evidence": [{"report_date":"YYYY-MM-DD","quote":"..."}]
      }
    ]
  },
  "incidents": [
    {
      "report_date": "YYYY-MM-DD",
      "issue": "string",
      "severity": "high|medium|low",
      "recurrence_risk": "high|medium|low|unknown",
      "evidence": [{"report_date":"YYYY-MM-DD","quote":"..."}]
    }
  ],
  "special_handling": [
    {
      "report_date": "YYYY-MM-DD",
      "category": "allergy|kids|special_request|other",
      "detail": "string",
      "evidence": [{"report_date":"YYYY-MM-DD","quote":"..."}]
    }
  ],
  "execution": {
    "completed": ["string"],
    "pending": ["string"],
    "inventory_or_prep_or_cleaning": [
      {
        "report_date": "YYYY-MM-DD",
        "summary": "string",
        "evidence": [{"report_date":"YYYY-MM-DD","quote":"..."}]
      }
    ]
  },
  "staff_state": [
    {
      "report_date": "YYYY-MM-DD",
      "fatigue_level": "low|medium|high|unknown",
      "mood": "good|normal|bad|unknown",
      "teamwork": "good|normal|bad|unknown",
      "evidence": [{"report_date":"YYYY-MM-DD","quote":"..."}]
    }
  ],
  "improvements": [
    {
      "priority": "high|medium|low",
      "category": "staffing|operation|equipment|training|other",
      "proposal": "string",
      "reason": "string",
      "evidence": [{"report_date":"YYYY-MM-DD","quote":"..."}]
    }
  ],
  "risk_warnings": [
    {
      "severity": "high|medium|low",
      "warning": "string",
      "evidence": [{"report_date":"YYYY-MM-DD","quote":"..."}]
    }
  ],
  "overall_judgement": {
    "label": "stable|light_load|needs_improvement|caution|danger",
    "reason": "string",
    "evidence": [{"report_date":"YYYY-MM-DD","quote":"..."}]
  }
}

出力方針
- 重要度の高い順に配列へ入れる。
- 不明な項目は unknown または空配列でよい（捏造しない）。
- incidents は「トラブル: 軽微」など抽象的で内容が特定できない場合、
  issue を "unspecified minor issue" とし severity は low にする（evidenceは必須）。
`;

// 日報本文（ここを差し替えて使う）
const REPORTS_TEXT = `【2026-02-07】 / 忙しさ: やや混雑 / 雰囲気: とても良い / トラブル: 軽微なものあり / 業務: ホール接客, キッチン, 片付け / メモ: 2月7日、金曜日でした。週末前ということもあってお客様が多めで、夕方からは待ちのお客様も出るほどでした。
朝はいつも通り開店準備から入って、午前中は比較的ゆったりしていたので、その間に冷蔵庫の在庫を確認したり、補充のリストをメモしたりしました。
お昼を過ぎたあたりから少しずつお客様が増えてきて、午後3時頃には一度ピークが来たような気がします。
そのあと少し落ち着いたかと思うと、夕方5時過ぎからまた一気に混み始めて、テーブルターンも早くて、片付けとセッティングの繰り返しでした。
途中、お客様のご要望でアレルギー対応の説明を厨房に伝えに行ったり、お子様用の椅子を何脚か出したりしていました。
閉店後はフロアのモップがけと、明日の準備をして終了。少し疲れましたが、充実した一日でした。

【2026-02-11】 / 忙しさ: とても混雑 / 雰囲気: 普通 / トラブル: 軽微なものあり / 業務: ホール接客, ドリンク作成, 片付け, 仕込み / メモ: 今日は2月11日、祝日で建国記念の日だったので、お休みの方が多くて本当に忙しかったです。
開店前からお客様の列ができていて、開店と同時に一気に席が埋まり、その後もずっと満席に近い状態が続きました。
ホールは自分ともう一人のスタッフで回していて、注文を取るのもドリンクを出すのも片付けも全部で、もう右往左往という感じでした。
お昼のピークのときは、お客様に少しお待ちいただくことがあって、その点は申し訳なかったなと思います。
午後もなかなか空きが出なくて、夕方まで混雑が続きました。
厨房の方も大変そうでしたが、何とか閉店までこなせて、大きなクレームもなく終われたのでほっとしています。
帰る頃にはくたくたでしたが、こういう日も経験として大事だなと思いました。明日は通常営業なので、今日ほどではなさそうですが、気を引き締めて頑張ります。`;

const res = await client.messages.create({
  model: "claude-haiku-4-5-20251001",
  max_tokens: 2500,
  system: SYSTEM_PROMPT,
  messages: [{ role: "user", content: REPORTS_TEXT }],
});

let text = res.content[0].text.trim();

// 保険：もし ```json ... ``` が付いたら除去
if (text.startsWith("```")) {
  text = text.replace(/^```[a-zA-Z0-9_-]*\s*/, "");
  text = text.replace(/\s*```$/, "");
  text = text.trim();
}

// JSONとして成立しているか検査して、整形保存
let obj;
try {
  obj = JSON.parse(text);
} catch (e) {
  fs.writeFileSync("result.raw.txt", res.content[0].text, "utf-8"); // 生
  fs.writeFileSync("result.cleaned.txt", text, "utf-8");            // クリーニング後
  console.error("JSON.parse に失敗。result.raw.txt（生）と result.cleaned.txt（整形後）を保存しました。");
  throw e;
}

fs.writeFileSync("result.json", JSON.stringify(obj, null, 2), "utf-8");
console.log("result.json に保存しました");