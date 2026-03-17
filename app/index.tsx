import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Phase 1 — check if childName exists in store, redirect to home if so
  return <Redirect href="/onboarding" />;
}
