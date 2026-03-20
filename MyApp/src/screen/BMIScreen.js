import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const BMIScreen = ({ route }) => {

const {
  weight = 70,
  height = 165,
  age = 25,
  gender = "male"
} = route.params || {};

const heightMeter = height / 100;

const bmi = (weight / (heightMeter * heightMeter)).toFixed(2);

const bmiValue = parseFloat(bmi);

const getCategory = () => {

  if (bmiValue < 18.5) return "ผอม";
  if (bmiValue < 23) return "น้ำหนักเหมาะสม";
  if (bmiValue < 25) return "น้ำหนักเกิน";
  if (bmiValue < 30) return "อ้วนระดับ 1";
  return "อ้วนระดับ 2";

};

const category = getCategory();

const minWeight = (18.5 * heightMeter * heightMeter).toFixed(1);
const maxWeight = (22.9 * heightMeter * heightMeter).toFixed(1);

const recommendedWeight =
((parseFloat(minWeight) + parseFloat(maxWeight)) / 2).toFixed(0);

const weightToLose = (weight - maxWeight).toFixed(1);

const generateAdvice = () => {

let advice = [];

// BMI condition
if (bmiValue < 18.5) {
advice.push("เพิ่มแคลอรี่ในแต่ละวัน");
advice.push("เพิ่มโปรตีน เช่น ไข่ ปลา นม");
advice.push("ออกกำลังกายแบบ Strength Training");
}

else if (bmiValue < 23) {
advice.push("รักษาพฤติกรรมการกินที่ดี");
advice.push("ออกกำลังกายสม่ำเสมอ");
}

else if (bmiValue < 25) {
advice.push("ควบคุมปริมาณแคลอรี่");
advice.push("ลดน้ำตาลและของหวาน");
}

else {
advice.push("ควบคุมแคลอรี่");
advice.push("เพิ่มคาร์ดิโอ เช่น เดินเร็ว วิ่ง ปั่นจักรยาน");
advice.push("Strength Training 2-3 ครั้ง/สัปดาห์");
}

// age condition
if (age > 40) {
advice.push("เพิ่มคาร์ดิโอเพื่อสุขภาพหัวใจ");
}

// gender condition
if (gender === "female") {
advice.push("เพิ่มอาหารที่มีธาตุเหล็ก เช่น ผักใบเขียว");
}

if (gender === "male") {
advice.push("เพิ่มโปรตีนเพื่อเสริมสร้างกล้ามเนื้อ");
}

// general health
advice.push("ดื่มน้ำวันละ 1.5 - 2 ลิตร");
advice.push("นอนหลับอย่างน้อย 7-8 ชั่วโมง");

return advice;

};

const adviceList = generateAdvice();

return (

<ScrollView style={styles.container}>

<Text style={styles.title}>BMI</Text>

<Text style={styles.bmiValue}>{bmi}</Text>

<View style={styles.categoryBox}>
<Text style={styles.categoryText}>{category}</Text>
</View>

{/* BMI BAR */}
<View style={styles.barContainer}>
<View style={[styles.bar,{backgroundColor:"#5DADE2"}]} />
<View style={[styles.bar,{backgroundColor:"#58D68D"}]} />
<View style={[styles.bar,{backgroundColor:"#F4D03F"}]} />
<View style={[styles.bar,{backgroundColor:"#EB984E"}]} />
<View style={[styles.bar,{backgroundColor:"#E74C3C"}]} />
</View>

<View style={styles.greenBox}>
<Text style={styles.bigText}>
น้ำหนักที่เหมาะสำหรับคุณ {minWeight}-{maxWeight} kg
</Text>

{weightToLose > 0 && (
<Text style={styles.smallText}>
ควรลดประมาณ {weightToLose} kg
</Text>
)}

</View>

<View style={styles.blueBox}>
<Text style={styles.bigText}>
น้ำหนักที่แนะนำสำหรับคุณ {recommendedWeight} kg
</Text>

<Text style={styles.smallText}>
ตั้งเป้า BMI กลางช่วงปกติ
</Text>
</View>

<View style={styles.adviceContainer}>

<Text style={styles.adviceTitle}>
AI Health Advice
</Text>

{adviceList.map((item,index)=>(
<View key={index} style={styles.adviceItem}>
<Text style={styles.adviceText}>{item}</Text>
</View>
))}

</View>

</ScrollView>

);

};

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#F4F4F4",
paddingTop:60
},

title:{
alignSelf:"center",
fontSize:26,
backgroundColor:"#3D7F5F",
color:"#fff",
paddingHorizontal:40,
paddingVertical:5,
borderRadius:20
},

bmiValue:{
alignSelf:"center",
fontSize:42,
color:"#F57C00",
marginTop:20
},

categoryBox:{
alignSelf:"center",
backgroundColor:"#FB8C00",
paddingHorizontal:20,
paddingVertical:8,
borderRadius:20,
marginTop:10
},

categoryText:{
color:"#fff",
fontSize:18
},

barContainer:{
flexDirection:"row",
width:"85%",
height:25,
borderRadius:20,
overflow:"hidden",
alignSelf:"center",
marginTop:25
},

bar:{
flex:1
},

greenBox:{
backgroundColor:"#C8E6C9",
marginTop:30,
marginHorizontal:20,
padding:20,
borderRadius:15
},

blueBox:{
backgroundColor:"#B3E5FC",
marginTop:15,
marginHorizontal:20,
padding:20,
borderRadius:15
},

bigText:{
fontSize:18,
fontWeight:"bold"
},

smallText:{
fontSize:14,
marginTop:5
},

adviceContainer:{
marginTop:30,
paddingHorizontal:20
},

adviceTitle:{
alignSelf:"center",
fontSize:18,
backgroundColor:"#3D7F5F",
color:"#fff",
paddingHorizontal:20,
paddingVertical:8,
borderRadius:20,
marginBottom:15
},

adviceItem:{
backgroundColor:"#B2DFDB",
padding:12,
borderRadius:20,
marginBottom:10
},

adviceText:{
fontSize:16
}

});

export default BMIScreen;