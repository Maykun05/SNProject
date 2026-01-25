// utils/openaiUtils.js
import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

export async function sendToAI(text) {
  const prompt = `ฉันกิน "${text}" ช่วยบอกชื่ออาหารและคำนวณแคลอรี่ให้หน่อย ตอบกลับเป็น JSON เช่น {"อาหาร": "ข้าวผัดหมู", "แคลอรี่": 550, "โปรตีน": 20}`;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const content = response.data.choices[0].message.content;
    return JSON.parse(content); // แปลงข้อความ AI เป็น object
  } catch (error) {
    console.error('AI error:', error);
    return null;
  }
}