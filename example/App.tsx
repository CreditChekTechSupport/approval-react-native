import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CreditChekApproval, {
  ApprovalEnvironment,
  ApprovalModule,
  SessionResult,
} from 'approval_react_native';

export default function App() {
  const [publicKey, setPublicKey] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [environment, setEnvironment] = useState<ApprovalEnvironment>('DEVELOPMENT');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bvn, setBvn] = useState('');
  const [email, setEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SessionResult | null>(null);

  const handleStartVerification = async () => {
    if (!publicKey.trim()) {
      Alert.alert('Missing Field', 'Please enter your CreditChek public key.');
      return;
    }
    if (!sessionId.trim()) {
      Alert.alert(
        'Missing Field',
        'Please enter a session ID (generated via your backend /v1/auth/widget-session/create).'
      );
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();
      const trimmedBvn = bvn.trim();
      const trimmedEmail = email.trim();
      const hasUserData = Boolean(trimmedFirstName || trimmedLastName || trimmedBvn || trimmedEmail);

      const sessionResult = await CreditChekApproval.start({
        publicKey: publicKey.trim(),
        sessionId: sessionId.trim(),
        environment,
        modules: ['IDENTITY', 'LIVELINESS'] as ApprovalModule[],
        userData: hasUserData
          ? {
            firstName: trimmedFirstName || undefined,
            lastName: trimmedLastName || undefined,
            bvn: trimmedBvn || undefined,
            email: trimmedEmail || undefined,
          }
          : undefined,
      });

      setResult(sessionResult);
    } catch (error: any) {
      setResult({
        status: 'error',
        code: 'UNEXPECTED_ERROR',
        message: error?.message || 'Verification could not be launched',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brandTitle}>CreditChek</Text>
          <Text style={styles.headerSubtitle}>Approval SDK — React Native & Expo</Text>
        </View>

        {/* Configuration Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Session Configuration</Text>

          <Text style={styles.label}>Public Key *</Text>
          <TextInput
            style={styles.input}
            placeholder="pk_test_..."
            value={publicKey}
            onChangeText={setPublicKey}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Session ID *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            value={sessionId}
            onChangeText={setSessionId}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Environment</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                environment === 'DEVELOPMENT' && styles.toggleButtonActive,
              ]}
              onPress={() => setEnvironment('DEVELOPMENT')}>
              <Text
                style={[
                  styles.toggleText,
                  environment === 'DEVELOPMENT' && styles.toggleTextActive,
                ]}>
                DEVELOPMENT
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                environment === 'PRODUCTION' && styles.toggleButtonActive,
              ]}
              onPress={() => setEnvironment('PRODUCTION')}>
              <Text
                style={[
                  styles.toggleText,
                  environment === 'PRODUCTION' && styles.toggleTextActive,
                ]}>
                PRODUCTION
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Optional Prefill Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>User Data (Optional Prefill)</Text>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Jane"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={styles.flex1}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <Text style={styles.label}>BVN</Text>
          <TextInput
            style={styles.input}
            placeholder="22222222222"
            value={bvn}
            onChangeText={setBvn}
            keyboardType="number-pad"
            maxLength={11}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="jane.doe@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Launch Button */}
        <TouchableOpacity
          style={[styles.launchButton, isLoading && styles.launchButtonDisabled]}
          onPress={handleStartVerification}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.launchButtonText}>Launch Verification Flow</Text>
          )}
        </TouchableOpacity>

        {/* Result Card */}
        {result && (
          <View
            style={[
              styles.resultCard,
              result.status === 'success' && styles.resultCardSuccess,
              result.status === 'cancelled' && styles.resultCardCancelled,
              result.status === 'error' && styles.resultCardError,
            ]}>
            <Text style={styles.resultTitle}>
              Status: {result.status.toUpperCase()}
            </Text>
            {result.status === 'success' && (
              <>
                <Text style={styles.resultText}>Session ID: {result.sessionId}</Text>
                <Text style={styles.resultText}>Message: {result.message}</Text>
              </>
            )}
            {result.status === 'cancelled' && (
              <Text style={styles.resultText}>User closed the verification widget.</Text>
            )}
            {result.status === 'error' && (
              <>
                <Text style={styles.resultText}>Code: {result.code}</Text>
                <Text style={styles.resultText}>Message: {result.message}</Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#064BEF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    marginTop: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleTextActive: {
    color: '#064BEF',
  },
  launchButton: {
    backgroundColor: '#064BEF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
    shadowColor: '#064BEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  launchButtonDisabled: {
    opacity: 0.6,
  },
  launchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  resultCardSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  resultCardCancelled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  resultCardError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    color: '#0F172A',
  },
  resultText: {
    fontSize: 14,
    color: '#334155',
    marginTop: 2,
  },
});
