import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/Color';
import { useColorScheme } from '@/hooks/use-color-schema';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function RecordsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity>
                    <IconSymbol name="chevron.left" size={24} color={theme.text} />
                </TouchableOpacity>
                <ThemedText type="title" style={styles.title}>Health Records</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {/* Record Card */}
                <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                    <ThemedText style={{ color: theme.icon, marginBottom: 8 }}>Doctor Visit - 14 Oct 2025</ThemedText>

                    <View style={styles.verifiedContainer}>
                        <IconSymbol name="checkmark.seal.fill" size={20} color={theme.success} />
                        <ThemedText type="defaultSemiBold" style={{ marginLeft: 6 }}>Verified on-chain</ThemedText>
                    </View>
                    <ThemedText style={{ color: theme.icon, fontSize: 12, fontFamily: 'Courier New', marginBottom: 20 }}>
                        Hash ID: 0x4a7b...c8d9
                    </ThemedText>

                    <View style={[styles.iconContainer, { backgroundColor: theme.secondary }]}>
                        <IconSymbol name="lock.shield" size={40} color={theme.primary} />
                    </View>

                    <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]}>
                        <IconSymbol name="square.and.arrow.up" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Share access</ThemedText>
                    </TouchableOpacity>

                    <ThemedText style={{ color: theme.icon, fontSize: 10, textAlign: 'center', marginTop: 12 }}>
                        Only you control who can view this.
                    </ThemedText>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    title: {
        fontSize: 20,
    },
    content: {
        padding: 20,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    verifiedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 30,
    },
});