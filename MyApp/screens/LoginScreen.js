import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.topSection}></View>

      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>

        <TextInput style={styles.input} placeholder="username" />
        <TextInput style={styles.input} placeholder="password" secureTextEntry />

        <TouchableOpacity>
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>──────────  Sign in with  ──────────</Text>

        <View style={styles.socialContainer}>
          <Text>🌐 Facebook</Text>
          <Text>🌐 X</Text>
          <Text>🌐 Google</Text>
          <Text>🌐 Apple</Text>
        </View>

        <Text style={styles.signupText}>
          Don't have any account?{" "}
          <Text
            style={styles.signupLink}
            onPress={() => navigation.navigate("Signup")}
          >
            Sign up
          </Text>
        </Text>
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
  forgot: { alignSelf: "flex-end", marginRight: 40, color: "#555" },
  button: {
    backgroundColor: "#4F7857",
    width: "80%",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  orText: { marginTop: 20, color: "#777", fontSize: 12 },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginTop: 15,
  },
  signupText: { marginTop: 20 },
  signupLink: { color: "#3C6E4F", fontWeight: "bold" },
});
