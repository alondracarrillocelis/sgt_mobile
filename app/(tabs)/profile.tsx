import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { User, Phone, Building, LogOut, Save } from 'lucide-react-native';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
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
    try {
      const response = await fetch('http://localhost:4000/api/profile/' + mockUser.id);
      const data = await response.json();
      setProfile(data);
      setFormData({
        full_name: data.full_name,
        phone: data.phone,
        company_name: data.company_name || '',
      });
    } catch (error) {
      console.error(error);
    }
    */
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.phone) {
      Alert.alert('Error', 'El nombre y teléfono son obligatorios');
      return;
    }

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
    try {
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
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    }
    */
  };

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Sesión cerrada', 'Vuelve pronto 👋');
          },
        },
      ]
    );
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
        </View>
        <View style={styles.loading}>
          <Text>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        {!editing && (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={48} color="#0066CC" />
          </View>
          <Text style={styles.email}>{mockUser.email}</Text>
        </View>

        {editing ? (
          <View style={styles.form}>
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
          <View style={styles.infoCard}>
            <InfoRow icon={<User size={20} color="#0066CC" />} label="Nombre" value={profile.full_name} />
            <InfoRow icon={<Phone size={20} color="#0066CC" />} label="Teléfono" value={profile.phone} />
            {profile.company_name && (
              <InfoRow icon={<Building size={20} color="#0066CC" />} label="Empresa" value={profile.company_name} />
            )}
          </View>
        )}

        <View style={styles.accountInfo}>
          <Text style={styles.accountInfoTitle}>Información de Cuenta</Text>
          <View style={styles.accountInfoRow}>
            <Text style={styles.accountInfoLabel}>Miembro desde</Text>
            <Text style={styles.accountInfoValue}>
              {new Date(profile.created_at).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#CC0000" />
          <Text style={styles.signOutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// 🔹 Componentes reutilizables para mantener limpio el JSX
const InputField = ({ label, icon, ...props }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputContainer}>
      {icon}
      <TextInput style={styles.input} {...props} />
    </View>
  </View>
);

const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>{icon}</View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0066CC',
  },
  editButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16 },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E6F2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  email: { fontSize: 14, color: '#666' },
  form: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  input: { flex: 1, fontSize: 16, color: '#333' },
  buttonGroup: { flexDirection: 'row', gap: 12, marginTop: 8 },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: { backgroundColor: '#F5F5F5' },
  cancelButtonText: { color: '#666', fontSize: 16, fontWeight: '600' },
  saveButton: { backgroundColor: '#0066CC' },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  infoCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  infoValue: { fontSize: 16, color: '#333', fontWeight: '500' },
  accountInfo: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16 },
  accountInfoTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  accountInfoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  accountInfoLabel: { fontSize: 14, color: '#666' },
  accountInfoValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  signOutButtonText: { color: '#CC0000', fontSize: 16, fontWeight: '600' },
});
