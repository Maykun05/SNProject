/**
 * คำอธิบายภารกิจสำหรับอ้างอิง — แหล่งความจริงของ progress / reward อยู่ที่ backend
 * `backend/src/services/missionDefinitions.js` (ids ต้องตรงกัน)
 */
export const ALL_MISSIONS = {
  daily: [
    { id: 'd1', title: "ดื่มน้ำอย่างน้อย 1 ครั้ง", reward: 5, goal: 1, unit: 'ครั้ง' },
    { id: 'd2', title: "บันทึกอาหารอย่างน้อย 3 ครั้ง", reward: 10, goal: 3, unit: 'ครั้ง' },
    { id: 'd3', title: "ออกกำลังกาย อย่างน้อย 1 วัน", reward: 10, goal: 1, unit: 'วัน' },
    { id: 'd4', title: "บันทึกอารมณ์ก่อนหมดวัน", reward: 10, goal: 1, unit: 'ครั้ง' },
  ],
  weekly: [
    { id: 'w1', title: "นอนครบ 7 ชม. อย่างน้อย 4 วัน", reward: 80, goal: 4, unit: 'วัน' },
    { id: 'w2', title: "ออกกำลังกาย อย่างน้อย 3 วัน", reward: 80, goal: 3, unit: 'วัน' },
    { id: 'w3', title: "บันทึกอาหารต่อเนื่อง 5 วัน", reward: 80, goal: 5, unit: 'วัน' },
    { id: 'w4', title: "ดื่มน้ำครบตามเป้าหมาย 7 วันติดกัน", reward: 100, goal: 7, unit: 'วัน' },
    { id: 'w5', title: "ออกกำลังกาย อย่างน้อย 5 วัน", reward: 100, goal: 5, unit: 'วัน' },
  ],
  monthly: [
    { id: 'm1', title: "ออกกำลังกาย อย่างน้อย 12 วัน", reward: 150, goal: 12, unit: 'วัน' },
    { id: 'm2', title: "มีวันที่มีความสุข > 15 วัน", reward: 400, goal: 15, unit: 'วัน' },
    { id: 'm3', title: "นอนหลับครบ 7-8 ชม. อย่างน้อย 20 วัน", reward: 500, goal: 20, unit: 'วัน' },
    { id: 'm4', title: "บันทึกอารมณ์ต่อเนื่องครบ 30 วัน", reward: 500, goal: 30, unit: 'วัน' },
    { id: 'm5', title: "บันทึกอาหาร รวม 20 วัน", reward: 500, goal: 20, unit: 'วัน' },
  ]
};