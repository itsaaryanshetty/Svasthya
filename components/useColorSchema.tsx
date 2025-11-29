import { useColorScheme as _useColorScheme } from 'react-native';

// This hook ensures the returned value is always 'light' or 'dark'.
export function useColorScheme(): NonNullable<'light' | 'dark'> {
  return _useColorScheme() as NonNullable<'light' | 'dark'>;
}