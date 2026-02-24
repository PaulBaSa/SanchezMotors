import { Redirect } from 'expo-router';

export default function Index() {
  // Redirects immediately to your reception tab (matching your tab layout's initialRouteName)
  return <Redirect href="/(tabs)/reception" />;
}