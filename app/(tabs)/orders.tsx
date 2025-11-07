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
import { CheckCircle, MinusCircle, PlusCircle } from 'lucide-react-native';

import { useRouter } from 'expo-router';
import { Calendar, MapPin, User, X, Search, Star } from 'lucide-react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { Trash2, Save } from 'lucide-react-native';



interface Product {
  id_product: number;
  name: string;
  quantity: number;
  unit?: string;
  unit_price?: number;
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
  materialUsage?: 'completo' | 'menos' | 'mas' | null;
  rating?: number;
  signature?: string | null;

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
        { id_product: 1, name: 'Cable coaxial', quantity: 20, unit: 'm' },
        { id_product: 2, name: 'Conector RG6', quantity: 4, unit: 'pza' },
      ],
      materialUsage: null,
      rating: 0,
      signature: null,
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
      materialUsage: null,
      rating: 0,
      signature: null,
    },
  ]);
  const [materialDetailsVisible, setMaterialDetailsVisible] = useState(false);
  const [materialInputs, setMaterialInputs] = useState<{ [key: number]: number }>({});

  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sigRef = useRef<any>(null);
  const latestSignature = useRef<string | null>(null);
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

    setOrders(prev => {
      const newOrders = prev.map(o =>
        o.id_service_order === id ? { ...o, state_: 'en_progreso' } : o
      );
      const updatedOrder = newOrders.find(o => o.id_service_order === id) || null;
      if (updatedOrder) setSelectedOrder({ ...updatedOrder, state_: 'en_progreso' });
      return newOrders;
    });

    intervalRef.current = setInterval(() => {
      setOrders(prev =>
        prev.map(o =>
          o.id_service_order === id ? { ...o, elapsed: o.elapsed + 1 } : o
        )
      );
    }, 1000);
  };

  const completeOrder = (id: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setActiveOrderId(null);

    setOrders(prev => {
      const newOrders = prev.map(o =>
        o.id_service_order === id ? { ...o, state_: 'completado' } : o
      );
      const updatedOrder = newOrders.find(o => o.id_service_order === id) || null;
      if (updatedOrder) {
        setSelectedOrder({ ...updatedOrder, state_: 'completado' });
        setStep(2); 
      }
      return newOrders;
    });
  };

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
    setStep(1);
  };

  const closeModal = () => {
    setModalVisible(false);
    // opcional: limpiar selectedOrder y step
    // setSelectedOrder(null);
    // setStep(1);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSignature = (sig: string) => {
    if (!selectedOrder) return;
    setOrders(prev => {
      const newOrders = prev.map(o =>
        o.id_service_order === selectedOrder.id_service_order ? { ...o, signature: sig } : o
      );
      const updatedOrder = newOrders.find(o => o.id_service_order === selectedOrder.id_service_order) || null;
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
      return newOrders;
    });

    Alert.alert('Firma guardada', 'El cliente ha firmado la orden.');
    setModalVisible(false);
    setStep(1);
  };

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

              <ScrollView
                showsVerticalScrollIndicator={false}
                scrollEnabled={scrollEnabled}
              >                {step === 1 && (
                <>
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
                </>
              )}

                {selectedOrder.state_ === 'completado' && step === 2 && (
                  <View style={styles.stepContainer}>
                    <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>
                      ¿Se utilizó el material completo?
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                      {[
                        { key: 'completo', icon: <CheckCircle size={30} color="#4CAF50" /> },
                        { key: 'menos', icon: <MinusCircle size={30} color="#FFA000" /> },
                        { key: 'más', icon: <PlusCircle size={30} color="#1976D2" /> },
                      ].map(option => (
                        <TouchableOpacity
                          key={option.key}
                          style={[
                            {
                              flex: 1,
                              marginHorizontal: 6,
                              paddingVertical: 12,
                              borderRadius: 20,
                              alignItems: 'center',
                              backgroundColor:
                                selectedOrder.materialUsage === option.key ? '#FFD84A' : '#EDEDED',
                            },
                          ]}
                          onPress={() => {
                            const id = selectedOrder.id_service_order;

                            setOrders(prev => {
                              const newOrders = prev.map(o =>
                                o.id_service_order === id ? { ...o, materialUsage: option.key as any } : o
                              );
                              setSelectedOrder(newOrders.find(o => o.id_service_order === id)!);
                              return newOrders;
                            });

                            if (option.key === 'completo') {
                              setMaterialDetailsVisible(false);
                              setStep(3);
                            } else {
                              const inputs: any = {};
                              selectedOrder.products.forEach(p => {
                                inputs[p.id_product] = p.quantity;
                              });
                              setMaterialInputs(inputs);
                              setMaterialDetailsVisible(true);
                            }
                          }}
                        >
                          {option.icon}
                          <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 4 }}>
                            {option.key.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {materialDetailsVisible && (
                      <View style={{ width: '100%', marginTop: 20 }}>
                        <Text style={styles.sectionTitle}>Indica el material utilizado</Text>

                        {selectedOrder.products.map(product => (
                          <View
                            key={product.id_product}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginVertical: 10,
                              backgroundColor: '#F9F9F9',
                              padding: 10,
                              borderRadius: 12,
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 15, fontWeight: '600' }}>{product.name}</Text>
                              <Text style={{ fontSize: 12, color: '#777' }}>
                                Cantidad asignada: {product.quantity}
                              </Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <TextInput
                                keyboardType="numeric"
                                style={{
                                  width: 70,
                                  padding: 6,
                                  borderWidth: 1,
                                  borderRadius: 10,
                                  textAlign: 'center',
                                  backgroundColor: '#FFF',
                                  marginRight: 6,
                                }}
                                value={String(materialInputs[product.id_product] || '')}
                                onChangeText={value => {
                                  setMaterialInputs(prev => ({
                                    ...prev,
                                    [product.id_product]: Number(value),
                                  }));
                                }}
                              />

                              <Text style={{ fontSize: 14, fontWeight: '500' }}>
                                {product.unit ? product.unit : 'u'}
                              </Text>
                            </View>
                          </View>
                        ))}

                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            { backgroundColor: '#246AB8', marginTop: 22, alignSelf: 'center', width: '70%' },
                          ]}
                          onPress={() => {
                            const id = selectedOrder.id_service_order;
                            setOrders(prev => {
                              const newOrders = prev.map(o =>
                                o.id_service_order === id
                                  ? { ...o, productsUsed: materialInputs }
                                  : o
                              );
                              setSelectedOrder(newOrders.find(o => o.id_service_order === id)!);
                              return newOrders;
                            });

                            setStep(3);
                          }}
                        >
                          <Text style={styles.actionText}>Guardar y Continuar</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}



                {step === 3 && (
                  <View style={styles.stepContainer}>
                    <Text style={styles.sectionTitle}>Califica al técnico</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity
                          key={star}
                          onPress={() => {
                            if (!selectedOrder) return;
                            const id = selectedOrder.id_service_order;
                            // guardamos rating en orders y selectedOrder
                            setOrders(prev => {
                              const newOrders = prev.map(o =>
                                o.id_service_order === id ? { ...o, rating: star } : o
                              );
                              const updated = newOrders.find(o => o.id_service_order === id) || null;
                              if (updated) setSelectedOrder(updated);
                              return newOrders;
                            });
                          }}
                        >
                          <Star
                            size={32}
                            color={selectedOrder.rating && selectedOrder.rating >= star ? '#FFD84A' : '#CCC'}
                            fill={selectedOrder.rating && selectedOrder.rating >= star ? '#FFD84A' : 'none'}
                            style={{ marginHorizontal: 4 }}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#246AB8', marginTop: 16 }]}
                      onPress={() => setStep(4)}
                    >
                      <Text style={styles.actionText}>Continuar a Firma</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {step === 4 && (
                  <View style={styles.stepContainer}>
                    <Text style={styles.sectionTitle}>Firma del cliente</Text>

                    <View
                      style={{
                        width: '100%',
                        height: 300,
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 20,
                        overflow: 'hidden',
                        marginTop: 10,
                        backgroundColor: '#FFF',
                      }}
                    >
                      <SignatureCanvas
                        ref={sigRef}
                        onBegin={() => setScrollEnabled(false)}
                        onEnd={() => setScrollEnabled(true)}
                        onOK={(signature) => handleSignature(signature)}
                        webStyle={`
          .m-signature-pad--footer { display: none; }
          .m-signature-pad { box-shadow: none; border: 1px solid #ccc; }
        `}
                      />
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                      {/* LIMPIAR */}
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 12,
                          paddingHorizontal: 20,
                          backgroundColor: '#E57373',
                          borderRadius: 25,
                          marginHorizontal: 6,
                        }}
                        onPress={() => sigRef.current?.clearSignature()}
                      >
                        <Trash2 color="#fff" size={20} />
                        <Text style={{ color: '#fff', marginLeft: 8, fontSize: 15, fontWeight: '600' }}>
                          Limpiar
                        </Text>
                      </TouchableOpacity>

                      {/* GUARDAR */}
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 12,
                          paddingHorizontal: 20,
                          backgroundColor: '#246AB8',
                          borderRadius: 25,
                          marginHorizontal: 6,
                        }}
                        onPress={() => sigRef.current?.readSignature()}
                      >
                        <Save color="#fff" size={20} />
                        <Text style={{ color: '#fff', marginLeft: 10, fontSize: 15, fontWeight: '600' }}>
                          Guardar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}


              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// --- estilos originales intactos ---
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
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  detailText: { fontSize: 14, color: '#444', marginLeft: 6 },
  section: { marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  sectionText: { fontSize: 14, color: '#555', marginTop: 4 },
  timerContainer: { alignItems: 'center', marginVertical: 14 },
  timerLabel: { fontSize: 14, color: '#666' },
  timerDisplay: { fontSize: 20, fontWeight: '700', color: '#000' },
  actions: { alignItems: 'center', marginTop: 16 },
  actionButton: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  actionText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  completedText: { fontSize: 14, fontStyle: 'italic', color: '#666' },
  stepContainer: { alignItems: 'center', paddingVertical: 16 },
  materialButton: {
    borderWidth: 1,
    borderColor: '#AAA',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 6,
  },
  materialSelected: {
    backgroundColor: '#FFD84A',
    borderColor: '#FFD84A',
  },
});
