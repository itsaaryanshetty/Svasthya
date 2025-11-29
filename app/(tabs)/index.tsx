import { StyleSheet, ScrollView, View, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { Colors } from '@/constants/Color';
import { useColorScheme } from '@/hooks/use-color-schema';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.greeting}>Hi Arjun</ThemedText>
        <TouchableOpacity>
          <IconSymbol name="bell" size={24} color={theme.icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        {/* Upcoming Appointment Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardContent}>
            <View style={styles.cardText}>
              <ThemedText type="subtitle">Upcoming appointment</ThemedText>
              <ThemedText style={{ color: theme.primary, marginTop: 4 }}>Dr. Sharma, Cardiology</ThemedText>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.secondary, marginTop: 12 }]}>
                <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>View</ThemedText>
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: 'https://img.freepik.com/free-vector/doctor-examining-patient-clinic-illustrated_23-2148856559.jpg' }}
              style={styles.cardImage}
            />
          </View>
        </View>

        {/* Today's Medication Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardContent}>
            <View style={styles.cardText}>
              <ThemedText type="subtitle">Today's medication</ThemedText>
              <ThemedText style={{ color: theme.icon, marginTop: 4 }}>2 pills, 10:00 AM</ThemedText>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.secondary, marginTop: 12 }]}>
                <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>View</ThemedText>
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: 'https://img.freepik.com/free-vector/pills-bottle-illustration_1284-16856.jpg' }}
              style={styles.cardImage}
            />
          </View>
        </View>

        {/* Recent Doctor Visit Summary Card */}
        <Link href="/(tabs)/profile" asChild>
          <TouchableOpacity>
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
              <View style={styles.cardContent}>
                <View style={styles.cardText}>
                  <ThemedText type="subtitle">Recent doctor visit summary</ThemedText>
                  <ThemedText style={{ color: theme.icon, marginTop: 4 }}>General checkup, normal</ThemedText>
                  <View style={[styles.button, { backgroundColor: theme.secondary, marginTop: 12 }]}>
                    <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>View</ThemedText>
                  </View>
                </View>
                <Image
                  source={{ uri: 'https://img.freepik.com/free-vector/medical-report-concept-illustration_114360-2234.jpg' }}
                  style={styles.cardImage}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    marginRight: 10,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
});