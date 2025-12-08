import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecordsScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Health Records</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.content}>
                    {/* Record Card */}
                    <View style={styles.card}>
                        <Text style={styles.dateText}>Doctor Visit - 14 Oct 2025</Text>

                        <View style={styles.verifiedContainer}>
                            <Text style={styles.checkIcon}>✓</Text>
                            <Text style={styles.verifiedText}>Verified on-chain</Text>
                        </View>
                        <Text style={styles.hashText}>
                            Hash ID: 0x4a7b...c8d9
                        </Text>

                        <View style={styles.iconContainer}>
                            <Text style={styles.lockIcon}>🔒</Text>
                        </View>

                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.shareIcon}>↗</Text>
                            <Text style={styles.buttonText}>Share access</Text>
                        </TouchableOpacity>

                        <Text style={styles.footerText}>
                            Only you control who can view this.
                        </Text>
                    </View>
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    backIcon: {
        fontSize: 24,
        color: '#E5E7EB',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#E5E7EB',
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    dateText: {
        color: '#9CA3AF',
        marginBottom: 8,
        fontSize: 14,
    },
    verifiedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    checkIcon: {
        fontSize: 20,
        color: '#22C55E',
        marginRight: 6,
    },
    verifiedText: {
        color: '#E5E7EB',
        fontWeight: '600',
        fontSize: 14,
    },
    hashText: {
        color: '#9CA3AF',
        fontSize: 12,
        fontFamily: 'Courier New',
        marginBottom: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#1F2937',
    },
    lockIcon: {
        fontSize: 40,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 30,
        backgroundColor: '#22C55E',
    },
    shareIcon: {
        fontSize: 20,
        color: '#fff',
        marginRight: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    footerText: {
        color: '#9CA3AF',
        fontSize: 10,
        textAlign: 'center',
        marginTop: 12,
    },
});
