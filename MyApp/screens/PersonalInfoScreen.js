import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function PersonalInfoScreen({ navigation }) {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [gender, setGender] = useState("");
  const [activity, setActivity] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.topSection}></View>
      <View style={styles.card}>
        <Text style={styles.title}>Personal Information</Text>

        <TextInput style={styles.input} placeholder="weight (kg)" keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="height (cm)" keyboardType="numeric" />

        <TouchableOpacity style={styles.datePicker} onPress={() => setShow(true)}>
          <Text>Select birthday: {date.toDateString()}</Text>
        </TouchableOpacity>

        {show && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShow(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <Picker selectedValue={gender} style={styles.input} onValueChange={(val) => setGender(val)}>
          <Picker.Item label="Select gender" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
        </Picker>

        <Picker selectedValue={activity} style={styles.input} onValueChange={(val) => setActivity(val)}>
          <Picker.Item label="Exercise level" value="" />
          <Picker.Item label="Low" value="low" />
          <Picker.Item label="Medium" value="medium" />
          <Picker.Item label="High" value="high" />
        </Picker>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Login")} // กลับหน้า Login หลัง Save
        >
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
