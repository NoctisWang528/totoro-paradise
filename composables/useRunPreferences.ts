const useRunPreferences = () =>
  useState('runPreferences', () => ({
    distanceKm: null as number | null,
    durationMin: null as number | null,
  }));

export default useRunPreferences;
