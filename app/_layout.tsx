import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{title: "Welcome"}} />
      <Stack.Screen name="detect_fall" options={{title: "detect_fall"}}  />
      <Stack.Screen name="fall_detect" options={{title: "Fall Detection"}}  />
      <Stack.Screen name="notify" options={{title: "notification"}} />
    </Stack>
  );
}
