import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react-native';

import stylesBackground from './styles/background';
import stylesContainers from './styles/containers';
import { login } from './api/auth.api';
// import { API_URL } from './api/config';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Validación
    if (!email || !email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    setLoading(true);

    try {
      const response = await login(email.trim(), password);
      
      if (response && response.token) {
        // El token se guarda automáticamente en las cookies por el backend
        // Si necesitas guardarlo localmente también:
        // await AsyncStorage.setItem('token', response.token);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Credenciales incorrectas');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'No se pudo conectar con el servidor';
      Alert.alert('Error', errorMessage);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={stylesContainers.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={stylesBackground.backgroundBlue} />
        <View style={stylesBackground.backgroundYellow} />

        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Mail size={48} color="#3C8BF2" />
            </View>
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="usuario@ejemplo.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#999" />
                  ) : (
                    <Eye size={20} color="#999" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <LogIn size={20} color="#FFF" />
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#D1E4FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  eyeButton: {
    padding: 4,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3C8BF2',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 8,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#99BBDD',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

