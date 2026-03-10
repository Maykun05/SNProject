const GEMINI_API_KEY = "AIzaSyBBcKjktjrZyVoa0Lfe6Q34ABhD1f5GbKo";
export async function sendToAI(text) {
  try {

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
ผู้ใช้พิมพ์: "${text}"

ให้วิเคราะห์ว่าเป็นอาหารหรือไม่

ถ้าเป็นอาหาร ให้ประเมินคุณค่าทางโภชนาการโดยอ้างอิง
ฐานข้อมูลโภชนาการมาตรฐาน เช่น USDA หรือ Thai Food Composition

ถ้าไม่ได้ระบุปริมาณ ให้ใช้ปริมาณมาตรฐาน 1 serving
ของอาหารไทยทั่วไป

ตอบเป็น JSON เท่านั้น

{
 "name": "ชื่ออาหาร",
 "calories": number,
 "protein": number,
 "carbs": number,
 "fat": number
}

ถ้าไม่ใช่อาหารให้ตอบ

{
 "not_food": true
}
`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    console.log("FULL GEMINI RESPONSE:", data);

    const raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output ||
      null;

    console.log("🍽 RAW GEMINI:", raw);

    if (!raw) return null;

    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.log("JSON parse failed:", cleaned);
      return null;
    }

    if (parsed.not_food) return null;

    return {
      name: parsed.name || parsed.food || parsed.อาหาร,
      calories: parsed.calories || parsed.แคลอรี่,
      protein: parsed.protein || parsed.โปรตีน,
      carbs: parsed.carbs || parsed.คาร์บ,
      fat: parsed.fat || parsed.ไขมัน
    };

  } catch (err) {
    console.log("Gemini error:", err);
    return null;
  }
}