import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
// import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Phone, Mail, MapPin, X } from 'lucide-react-native';

export default function ClientsScreen() {
  // const { user } = useAuth(); // 🔸 No necesitamos autenticación
  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  // 🔹 Dummy data para simular clientes
  const dummyClients = [
    {
      id: '1',
      full_name: 'Juan Pérez',
      phone: '555-123-4567',
      email: 'juan.perez@example.com',
      address: 'Av. Siempre Viva 742, Ciudad Solar',
      notes: 'Cliente frecuente con buen historial',
      created_at: '2024-05-01T10:00:00Z',
    },
    {
      id: '2',
      full_name: 'María López',
      phone: '555-987-6543',
      email: 'maria.lopez@example.com',
      address: 'Calle Luna 23, Zona Norte',
      notes: '',
      created_at: '2024-06-10T09:30:00Z',
    },
    {
      id: '3',
      full_name: 'Carlos García',
      phone: '555-222-8899',
      email: 'carlos.garcia@example.com',
      address: 'Boulevard del Sol 101, Centro',
      notes: 'Solicitó instalación premium',
      created_at: '2024-07-20T15:45:00Z',
    },
  ];

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchQuery, clients]);


  const loadClients = async () => {


    await new Promise((resolve) => setTimeout(resolve, 400)); // pequeña simulación de delay
    setClients(dummyClients);
  };

  const filterClients = () => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = clients.filter(
      (client) =>
        client.full_name.toLowerCase().includes(query) ||
        client.phone.includes(query) ||
        client.address.toLowerCase().includes(query)
    );
    setFilteredClients(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  const handleAddClient = async () => {
    if (!formData.full_name || !formData.phone || !formData.address) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }



    // 🔹 Simula agregar cliente localmente
    const newClient = {
      id: (clients.length + 1).toString(),
      ...formData,
      created_at: new Date().toISOString(),
    };
    setClients([newClient, ...clients]);
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    });
  };

  const renderClient = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.clientCard}>
      <Text style={styles.clientName}>{item.full_name}</Text>

      <View style={styles.clientInfo}>
        <Phone size={16} color="#666666" />
        <Text style={styles.clientText}>{item.phone}</Text>
      </View>

      {item.email && (
        <View style={styles.clientInfo}>
          <Mail size={16} color="#666666" />
          <Text style={styles.clientText}>{item.email}</Text>
        </View>
      )}

      <View style={styles.clientInfo}>
        <MapPin size={16} color="#666666" />
        <Text style={styles.clientText}>{item.address}</Text>
      </View>

      {item.notes && <Text style={styles.clientNotes}>{item.notes}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clientes</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#999999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar clientes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredClients}
        renderItem={renderClient}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay clientes registrados</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Cliente</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nombre completo *"
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Teléfono *"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Dirección *"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              multiline
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notas"
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleAddClient}>
              <Text style={styles.saveButtonText}>Guardar Cliente</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
  title: { fontSize: 24, fontWeight: 'bold', color: '#333333' },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: { flex: 1, fontSize: 16 },
  list: { padding: 16 },
  clientCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  clientName: { fontSize: 18, fontWeight: '600', color: '#333333', marginBottom: 12 },
  clientInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  clientText: { fontSize: 14, color: '#666666' },
  clientNotes: { fontSize: 14, color: '#999999', marginTop: 8, fontStyle: 'italic' },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, color: '#999999' },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#333333' },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveButton: {
    backgroundColor: '#0066CC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
