import { Audio } from 'expo-av';
import { useGameStore } from '@/store/useGameStore';
import { SoundEvent, SOUND_ASSETS } from '@/data/sounds';

const soundCache = new Map<SoundEvent, Audio.Sound>();

/** Preload all SFX into memory for instant playback */
export async function preloadSounds(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    const entries = Object.entries(SOUND_ASSETS) as [SoundEvent, number][];
    await Promise.all(
      entries.map(async ([key, asset]) => {
        try {
          const { sound } = await Audio.Sound.createAsync(asset);
          soundCache.set(key, sound);
        } catch {
          // Skip sounds that fail to load — non-critical
        }
      })
    );
  } catch {
    // Audio init failed — app works fine without sound
  }
}

/** Play a sound effect. Respects soundEnabled setting. Fire-and-forget. */
export function playSound(event: SoundEvent): void {
  const { soundEnabled } = useGameStore.getState().settings;
  if (!soundEnabled) return;

  const sound = soundCache.get(event);
  if (!sound) return;

  sound.replayAsync().catch(() => {});
}

/** Unload all cached sounds (call on app background/cleanup) */
export async function unloadSounds(): Promise<void> {
  const sounds = Array.from(soundCache.values());
  soundCache.clear();
  await Promise.all(sounds.map((s) => s.unloadAsync().catch(() => {})));
}
