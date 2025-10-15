import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Picker } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function PersonalInfoScreen() {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [gender, setGender] = useState("");
  const [activity, setActivity] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.topSection}></View>
      <View style={styles.card}>
        <Text style={styles.title}>Personal Information</Text>

        <TextInput style={styles.input} placeholder="weight" keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="height" keyboardType="numeric" />

        <TouchableOpacity style={styles.datePicker} onPress={() => setShow(true)}>
          <Text>Date picker select birthday</Text>
        </TouchableOpacity>

        {show && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShow(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <Picker
          selectedValue={gender}
          style={styles.input}
          onValueChange={(val) => setGender(val)}
        >
          <Picker.Item label="เพศ" value="" />
          <Picker.Item label="ชาย" value="male" />
          <Picker.Item label="หญิง" value="female" />
        </Picker>

        <Picker
          selectedValue={activity}
          style={styles.input}
          onValueChange={(val) => setActivity(val)}
        >
          <Picker.Item label="ระดับการออกกำลังกาย" value="" />
          <Picker.Item label="น้อย" value="low" />
          <Picker.Item label="ปานกลาง" value="medium" />
          <Picker.Item label="สูง" value="high" />
        </Picker>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Save</Text>
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
  title: { fontSize: 22, fontWeight: "bold", color: "#3C6E4F", marginBottom: 20 },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
  },
  datePicker: {
    width: "80%",
    backgroundColor: "#e5e5e5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
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
