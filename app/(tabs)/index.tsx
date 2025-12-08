import { Link } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi Arjun</Text>
          <TouchableOpacity>
            <Text style={styles.icon}>🔔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsContainer}>
          {/* Upcoming Appointment Card */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.cardText}>
                <Text style={styles.subtitle}>Upcoming appointment</Text>
                <Text style={styles.cardPrimaryText}>Dr. Sharma, Cardiology</Text>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>View</Text>
                </TouchableOpacity>
              </View>
              <Image
                source={{ uri: 'https://img.freepik.com/free-vector/doctor-examining-patient-clinic-illustrated_23-2148856559.jpg' }}
                style={styles.cardImage}
              />
            </View>
          </View>

          {/* Today's Medication Card */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.cardText}>
                <Text style={styles.subtitle}>Today's medication</Text>
                <Text style={styles.cardSecondaryText}>2 pills, 10:00 AM</Text>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>View</Text>
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
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={styles.cardText}>
                    <Text style={styles.subtitle}>Recent doctor visit summary</Text>
                    <Text style={styles.cardSecondaryText}>General checkup, normal</Text>
                    <View style={styles.button}>
                      <Text style={styles.buttonText}>View</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  icon: {
    fontSize: 24,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#111827',
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
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 4,
  },
  cardPrimaryText: {
    color: '#22C55E',
    fontSize: 14,
    marginTop: 4,
  },
  cardSecondaryText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#1F2937',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  buttonText: {
    color: '#22C55E',
    fontWeight: '600',
  },
});
