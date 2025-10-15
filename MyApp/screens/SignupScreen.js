import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function SignupScreen({ navigation }) {  // <-- ต้องรับ navigation
  return (
    <View style={styles.container}>
      <View style={styles.topSection}></View>
      <View style={styles.card}>
        <Text style={styles.title}>Sign up</Text>

        <TextInput style={styles.input} placeholder="First name" />
        <TextInput style={styles.input} placeholder="Last name" />
        <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirm password" secureTextEntry />

        {/* ปุ่ม Sign up */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("PersonalInfo")} // <-- ลิงก์ไปหน้า Personal Info
        >
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#4F7857" },
  topSection: { height: 100 },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: "center",
    paddingTop: 30,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#3C6E4F", marginBottom: 20 },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
  },
  button: {
    backgroundColor: "#4F7857",
    width: "80%",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
