import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { User, Phone, Building, LogOut, Save, Edit2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import stylesHeader from '../styles/header';
import stylesText from '../styles/texts';
import stylesBackground from '../styles/background';
import stylesContainers from '../styles/containers';
import { logout } from '../api/auth.api';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    company_name: '',
  });

  // Simular usuario logueado
  const mockUser = {
    id: '1',
    email: 'maria.lopez@example.com',
    created_at: '2024-09-05T10:00:00Z',
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // 🔹 Datos simulados (puedes reemplazar con fetch a tu backend)
      const fakeData = {
        id: mockUser.id,
        full_name: 'María López',
        phone: '5521345678',
        company_name: 'TechNova Solutions',
        created_at: mockUser.created_at,
      };

      setProfile(fakeData);
      setFormData({
        full_name: fakeData.full_name,
        phone: fakeData.phone,
        company_name: fakeData.company_name || '',
      });

      /* 
      // 🔹 Versión real con backend Express:
      const response = await fetch('http://localhost:4000/api/profile/' + mockUser.id);
      const data = await response.json();
      setProfile(data);
      setFormData({
        full_name: data.full_name,
        phone: data.phone,
        company_name: data.company_name || '',
      });
      */
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.phone) {
      Alert.alert('Error', 'El nombre y teléfono son obligatorios');
      return;
    }

    try {
      setProfile((prev: any) => ({
        ...prev,
        full_name: formData.full_name,
        phone: formData.phone,
        company_name: formData.company_name || '',
      }));

      setEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');

      /*
      // 🔹 Versión real con backend Express:
      const response = await fetch('http://localhost:4000/api/profile/' + mockUser.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditing(false);
        loadProfile();
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      }
      */
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await logout();
              // El backend retorna: { message: "Logout successful" }
              if (response && response.message) {
                // Redirigir al login después de logout exitoso
                router.replace('/');
              } else {
                // Si no hay mensaje, aún así redirigir
                router.replace('/');
              }
            } catch (error: any) {
              console.error('Logout error:', error);
              // Aún así redirigir al login aunque haya error
              // La cookie puede haberse limpiado en el servidor
              router.replace('/');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[stylesContainers.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={stylesContainers.container}>
        <View style={stylesBackground.backgroundBlue} />
        <View style={stylesBackground.backgroundYellow} />
        <View style={stylesHeader.header}>
          <View style={stylesHeader.headerBadge}>
            <Text style={stylesText.title}>Perfil</Text>
            <Text style={stylesText.subtitle}>Tu información personal</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={stylesContainers.container}>
      <View style={stylesBackground.backgroundBlue} />
      <View style={stylesBackground.backgroundYellow} />

      {/* Header */}
      <View style={stylesHeader.header}>
        <View style={stylesHeader.headerBadge}>
          <Text style={stylesText.title}>Perfil</Text>
          <Text style={stylesText.subtitle}>Tu información personal</Text>
        </View>
        {!editing && (
          <TouchableOpacity style={stylesHeader.headerIcon} onPress={() => setEditing(true)}>
            <Edit2 color="#fff" size={24} />
          </TouchableOpacity>
        )}
      </View>

      {/* Avatar Container */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <User size={48} color="#3C8BF2" />
        </View>
        <Text style={styles.email}>{mockUser.email}</Text>
      </View>

      {/* Form or Info Card */}
      {editing ? (
        <View style={styles.card}>
          <InputField
            label="Nombre Completo *"
            icon={<User size={20} color="#666" />}
            value={formData.full_name}
            onChangeText={(text: string) => setFormData({ ...formData, full_name: text })}
            placeholder="Nombre completo"
          />

          <InputField
            label="Teléfono *"
            icon={<Phone size={20} color="#666" />}
            value={formData.phone}
            onChangeText={(text: string) => setFormData({ ...formData, phone: text })}
            placeholder="Teléfono"
            keyboardType="phone-pad"
          />

          <InputField
            label="Empresa"
            icon={<Building size={20} color="#666" />}
            value={formData.company_name}
            onChangeText={(text: string) => setFormData({ ...formData, company_name: text })}
            placeholder="Nombre de la empresa"
          />

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setEditing(false);
                setFormData({
                  full_name: profile.full_name,
                  phone: profile.phone,
                  company_name: profile.company_name || '',
                });
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Save size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <InfoRow icon={<User size={20} color="#3C8BF2" />} label="Nombre" value={profile.full_name} />
          <View style={styles.divider} />
          <InfoRow icon={<Phone size={20} color="#3C8BF2" />} label="Teléfono" value={profile.phone} />
          {profile.company_name && (
            <>
              <View style={styles.divider} />
              <InfoRow icon={<Building size={20} color="#3C8BF2" />} label="Empresa" value={profile.company_name} />
            </>
          )}
        </View>
      )}

      {/* Account Info */}
      <View style={styles.card}>
        <Text style={stylesText.sectionTitle}>Información de Cuenta</Text>
        <View style={styles.accountInfoRow}>
          <Text style={stylesText.modalLabel}>Miembro desde</Text>
          <Text style={stylesText.modalValue}>
            {new Date(profile.created_at).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <LogOut size={20} color="#FF6B6B" />
        <Text style={styles.signOutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Componentes reutilizables
const InputField = ({ label, icon, ...props }: any) => (
  <View style={styles.inputGroup}>
    <Text style={stylesText.modalLabel}>{label}</Text>
    <View style={styles.inputContainer}>
      {icon}
      <TextInput style={stylesText.searchInput} {...props} placeholderTextColor="#999" />
    </View>
  </View>
);

const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>{icon}</View>
    <View style={styles.infoContent}>
      <Text style={stylesText.modalLabel}>{label}</Text>
      <Text style={stylesText.modalValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFF',
    borderRadius: 30,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#D1E4FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  email: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    marginHorizontal: 20,
    marginTop: 18,
    paddingVertical: 20,
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
    gap: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3C8BF2',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 16,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1E4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: 12,
    marginLeft: 60,
  },
  accountInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 40,
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#FFE0E0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  signOutButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
});

