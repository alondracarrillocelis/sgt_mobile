import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { Search, User, Phone, Mail, MapPin, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ClientsScreen() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
    await new Promise(resolve => setTimeout(resolve, 400));
    setClients(dummyClients);
  };

  const filterClients = () => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = clients.filter(
      client =>
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

  const openClientModal = (client: any) => {
    setSelectedClient(client);
    setModalVisible(true);
  };

  const renderClient = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.clientCard} onPress={() => openClientModal(item)}>
      <View style={styles.iconCircle}>
        <User color="#fff" size={28} />
      </View>
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.full_name}</Text>
        <Text style={styles.clientText}>{item.phone}</Text>
      </View>
      <Text style={styles.clientArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.backgroundShapeBlue} />
      <View style={styles.backgroundShapeYellow} />

      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.title}>Clientes</Text>
           <Text style={styles.subtitle}>Consulta tus clientes</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/profile')}>
          <User color="#fff" size={28} />
        </TouchableOpacity>
      </View>

      <Text style={styles.filterLabel}>Filtrar</Text>
      <View style={styles.searchContainer}>
        <Search size={20} color="#999999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar clientes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#aaa"
        />
      </View>

      <FlatList
        data={filteredClients}
        renderItem={renderClient}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay clientes registrados</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles del cliente</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {selectedClient && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Nombre</Text>
                  <Text style={styles.modalValue}>{selectedClient.full_name}</Text>

                  <Text style={styles.modalLabel}>Teléfono</Text>
                  <View style={styles.modalRow}>
                    <Phone size={18} color="#555" />
                    <Text style={styles.modalValue}>{selectedClient.phone}</Text>
                  </View>

                  {selectedClient.email ? (
                    <>
                      <Text style={styles.modalLabel}>Correo electrónico</Text>
                      <View style={styles.modalRow}>
                        <Mail size={18} color="#555" />
                        <Text style={styles.modalValue}>{selectedClient.email}</Text>
                      </View>
                    </>
                  ) : null}

                  <Text style={styles.modalLabel}>Dirección</Text>
                  <View style={styles.modalRow}>
                    <MapPin size={18} color="#555" />
                    <Text style={styles.modalValue}>{selectedClient.address}</Text>
                  </View>

                  {selectedClient.notes ? (
                    <>
                      <Text style={styles.modalLabel}>Notas</Text>
                      <Text style={styles.modalValue}>{selectedClient.notes}</Text>
                    </>
                  ) : null}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  backgroundShapeBlue: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: '#246AB8',
    borderBottomRightRadius: 120,
  },
  backgroundShapeYellow: {
    position: 'absolute',
    bottom: -100,
    right: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FFD84A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerBadge: {
    backgroundColor: '#D1E4FA',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  subtitle: { fontSize: 14, fontStyle: 'italic', color: '#555' },
  headerIcon: {
    backgroundColor: '#3C8BF2',
    width: 55,
    height: 55,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 24,
    marginTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 80,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  iconCircle: {
    width: 50,
    height: 50,
    backgroundColor: '#3C8BF2',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientInfo: { flex: 1, marginLeft: 12 },
  clientName: { fontSize: 16, fontWeight: '600', color: '#000' },
  clientText: { fontSize: 14, color: '#666', marginTop: 2 },
  clientArrow: { fontSize: 24, color: '#666', marginRight: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, color: '#999999' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  modalSection: { marginTop: 8 },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777',
    marginTop: 12,
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  modalRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
