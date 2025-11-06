import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, User, X, Search } from 'lucide-react-native';

interface Product {
  id_product: number;
  name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id_service_order: number;
  client_name: string;
  client_address: string;
  service_name: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  state_: 'pendiente' | 'en_progreso' | 'completado';
  duration: number;
  elapsed: number;
  products: Product[];
  activities: string;
}

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([
    {
      id_service_order: 1,
      client_name: 'Hotel Victoria',
      client_address: 'Av. Reforma 123, CDMX',
      service_name: 'Instalación de Antena',
      scheduled_date: '2025-10-19',
      start_time: '09:00',
      end_time: '11:00',
      state_: 'pendiente',
      duration: 30,
      elapsed: 0,
      activities: 'Montaje y ajuste de antena en torre principal.',
      products: [
        { id_product: 1, name: 'Antena parabólica', quantity: 1, unit_price: 800 },
        { id_product: 2, name: 'Cable coaxial 20m', quantity: 2, unit_price: 120 },
      ],
    },
    {
      id_service_order: 2,
      client_name: 'Plaza Central',
      client_address: 'Calle Hidalgo 45, Monterrey',
      service_name: 'Revisión de Red',
      scheduled_date: '2025-10-20',
      start_time: '14:00',
      end_time: '17:00',
      state_: 'pendiente',
      duration: 45,
      elapsed: 0,
      activities: 'Inspección de switches y verificación de conectividad LAN.',
      products: [{ id_product: 3, name: 'Tester de red', quantity: 1, unit_price: 500 }],
    },
  ]);

  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredOrders(
        orders.filter(
          o =>
            o.client_name.toLowerCase().includes(query) ||
            o.service_name.toLowerCase().includes(query) ||
            o.client_address.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, orders]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const getStatusColor = (state_: Order['state_']) => {
    switch (state_) {
      case 'pendiente':
        return '#D1D1D1';
      case 'en_progreso':
        return '#FFD84A';
      case 'completado':
        return '#6FCF97';
      default:
        return '#BDBDBD';
    }
  };

  const startTimer = (id: number) => {
    if (activeOrderId && activeOrderId !== id) {
      Alert.alert('Aviso', 'Solo puedes tener una orden en progreso a la vez.');
      return;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);

    setActiveOrderId(id);
    setOrders(prev =>
      prev.map(o =>
        o.id_service_order === id ? { ...o, state_: 'en_progreso' } : o
      )
    );


    const order = orders.find(o => o.id_service_order === id);
    if (order) setSelectedOrder({ ...order, state_: 'en_progreso' });

    intervalRef.current = setInterval(() => {
      setOrders(prev =>
        prev.map(o =>
          o.id_service_order === id ? { ...o, elapsed: o.elapsed + 1 } : o
        )
      );
    }, 1000);
  };

  const completeOrder = (id: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveOrderId(null);
    setOrders(prev =>
      prev.map(o =>
        o.id_service_order === id ? { ...o, state_: 'completado' } : o
      )
    );


    const order = orders.find(o => o.id_service_order === id);
    if (order) setSelectedOrder({ ...order, state_: 'completado' });
  };

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundBlue} />
      <View style={styles.backgroundYellow} />

      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerTitle}>Órdenes</Text>
          <Text style={styles.headerSubtitle}>Gestiona tus órdenes</Text>
        </View>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => router.push('/profile')}
        >
          <User color="#fff" size={28} />
        </TouchableOpacity>
      </View>

      <Text style={styles.filterLabel}>Filtrar</Text>
      <View style={styles.searchContainer}>
        <Search size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar órdenes..."
          placeholderTextColor="#222222"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id_service_order.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.orderCard} onPress={() => openOrder(item)}>
            <View
              style={[
                styles.statusCircle,
                { backgroundColor: getStatusColor(item.state_) },
              ]}
            />
            <View style={styles.orderInfo}>
              <Text style={styles.clientName}>{item.client_name}</Text>
              <Text style={styles.serviceName}>{item.service_name}</Text>
              <Text style={styles.elapsedText}>{formatTime(item.elapsed)}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
      />

      {selectedOrder && (
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedOrder.client_name}</Text>
                <TouchableOpacity onPress={closeModal}>
                  <X size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalSubtitle}>{selectedOrder.service_name}</Text>

                <View style={styles.detailsRow}>
                  <Calendar size={16} color="#555" />
                  <Text style={styles.detailText}>
                    {selectedOrder.scheduled_date} • {selectedOrder.start_time} - {selectedOrder.end_time}
                  </Text>
                </View>

                <View style={styles.detailsRow}>
                  <MapPin size={16} color="#555" />
                  <Text style={styles.detailText}>{selectedOrder.client_address}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Actividades</Text>
                  <Text style={styles.sectionText}>{selectedOrder.activities}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Materiales</Text>
                  {selectedOrder.products.map((p, i) => (
                    <Text key={i} style={styles.sectionText}>
                      {p.name} ({p.quantity})
                    </Text>
                  ))}
                </View>

                <View style={styles.timerContainer}>
                  <Text style={styles.timerLabel}>Tiempo transcurrido</Text>
                  <Text style={styles.timerDisplay}>
                    {formatTime(
                      orders.find(o => o.id_service_order === selectedOrder.id_service_order)?.elapsed || 0
                    )}
                  </Text>
                </View>

                <View style={styles.actions}>
                  {selectedOrder.state_ !== 'completado' ? (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor:
                            selectedOrder.state_ === 'en_progreso'
                              ? '#6FCF97'
                              : '#FFD84A',
                        },
                      ]}
                      onPress={() =>
                        selectedOrder.state_ === 'en_progreso'
                          ? completeOrder(selectedOrder.id_service_order)
                          : startTimer(selectedOrder.id_service_order)
                      }
                    >
                      <Text style={styles.actionText}>
                        {selectedOrder.state_ === 'en_progreso'
                          ? 'Completar'
                          : 'Comenzar'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.completedText}>
                      Orden completada ({formatTime(selectedOrder.elapsed)})
                    </Text>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  backgroundBlue: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: '#246AB8',
    borderBottomRightRadius: 140,
  },
  backgroundYellow: {
    position: 'absolute',
    bottom: -80,
    left: -50,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#FFD84A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 70,
    paddingHorizontal: 20,
  },
  headerBadge: {
    backgroundColor: '#D1E4FA',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 22,
    width: '75%',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  headerSubtitle: { fontSize: 13, color: '#555', fontStyle: 'italic' },
  headerIcon: {
    backgroundColor: '#3C8BF2',
    width: 55,
    height: 55,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 16, marginLeft: 8, color: '#333' },
  list: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 80 },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  statusCircle: { width: 55, height: 55, borderRadius: 27.5, marginRight: 18 },
  orderInfo: { flex: 1 },
  clientName: { fontSize: 17, fontWeight: '700', color: '#000' },
  serviceName: { fontSize: 14, color: '#777', fontStyle: 'italic' },
  elapsedText: { fontSize: 13, color: '#333', marginTop: 2 },
  arrow: { fontSize: 22, color: '#999' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '88%',
    backgroundColor: '#FFF',
    borderRadius: 40,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#000' },
  modalSubtitle: { fontSize: 16, fontStyle: 'italic', color: '#666' },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  detailText: { marginLeft: 8, color: '#444', fontSize: 14 },
  section: { marginTop: 14 },
  sectionTitle: { fontWeight: '700', fontSize: 15, color: '#333', marginBottom: 6 },
  sectionText: { fontSize: 14, color: '#555', marginBottom: 4 },
  timerContainer: { marginVertical: 16, alignItems: 'center' },
  timerLabel: { color: '#555', marginBottom: 4 },
  timerDisplay: { fontSize: 40, fontWeight: '800', color: '#000' },
  actions: { flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
  actionButton: {
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  actionText: { color: '#000', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  completedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
});
