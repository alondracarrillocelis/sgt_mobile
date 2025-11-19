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
import Toast, { ToastType } from '../../components/Toast';
import { CheckCircle, Clock, MinusCircle, PlusCircle } from 'lucide-react-native';

import { useRouter } from 'expo-router';
import { Calendar, MapPin, User, X, Search, Star, FileText, Package, PenTool } from 'lucide-react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { Trash2, Save } from 'lucide-react-native';
import { API_URL } from '../api/config';
import stylesHeader from '../styles/header';
import stylesText from '../styles/texts';
import stylesModal from '../styles/modal';
import stylesBackground from '../styles/background';
import stylesContainers from '../styles/containers';
import { Image } from "react-native";
import { getFullServiceOrders } from '../api/api';
import { Linking, Platform } from "react-native";
import { startServiceOrder, completeServiceOrder, cancelServiceOrder, addUsedProducts, signServiceOrder } from "../api/api";


interface Product {
  id_product: number;
  name: string;
  quantity: number;
  unit?: string;
  unit_price?: number;
  image_url?: string; // <-- agrega esto

}

interface Order {
  id_service_order: number;
  client_name: string;
  client_address: string;
  service_name: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  state_: 'pendiente' | 'en_progreso' | 'finalizado'|'cancelado' | string;
  duration: number;
  elapsed: number;
  products: Product[];
  activities: string;
  materialUsage?: 'completo' | 'menos' | 'mas' | null;
  rating?: number;
  signature?: string | null;
  files?: string | null; // Firma guardada en el backend

}

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [materialDetailsVisible, setMaterialDetailsVisible] = useState(false);
  const [materialInputs, setMaterialInputs] = useState<{ [key: number]: number }>({});
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendiente' | 'en_progreso' | 'finalizado' | 'cancelado'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [modalPage, setModalPage] = useState<'info' | 'activities' | 'materials' | 'signature'>('info');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sigRef = useRef<any>(null);
  const latestSignature = useRef<string | null>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [showMapOptions, setShowMapOptions] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  });

  const showToast = (message: string, type: ToastType = 'error') => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const openGoogleMaps = (address: string) => {
    const encoded = encodeURIComponent(address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
  };

  const openAppleMaps = (address: string) => {
    const encoded = encodeURIComponent(address);
    Linking.openURL(`maps://?q=${encoded}`);
  };

  const openWaze = (address: string) => {
    const encoded = encodeURIComponent(address);
    Linking.openURL(`https://waze.com/ul?q=${encoded}`);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFullServiceOrders();
        if (!data) return;

        const groupedOrders = data.reduce((acc: any, item: any) => {
          const existingOrder = acc.find(
            (o: any) => o.id_service_order === item.id_service_order
          );
          const product = {
            id_product: item.id_product,
            name: item.product_name,
            description: item.product_description,
            quantity: item.quantity_used,
            unit_price: parseFloat(item.sale_price),
            model: item.model,
            brand: item.manufacturer_brand,
            image_url: item.product_image || null, // <-- AQUÍ EL FIX
          };

          if (existingOrder) {
            existingOrder.products.push(product);
          } else {
            acc.push({
              id_service_order: item.id_service_order,
              client_name: item.client_name,
              client_address: `${item.client_street} ${item.client_number}, ${item.client_neighborhood}, ${item.client_city}, ${item.client_state}, ${item.client_country}`,
              client_email: item.client_email,
              client_phone: item.client_phone,
              service_name: item.service_name,
              service_description: item.service_description,
              scheduled_date: item.scheduled_date,
              start_time: item.start_time,
              end_time: item.end_time,
              state_: item.state_?.toLowerCase() || "pendiente",
              activities: item.activities,
              duration: 0,
              elapsed: 0,
              products: [product],
              materialUsage: null,
              rating: 0,
              signature: null,
              files: item.files || null, // Firma guardada en el backend
            });
          }
          return acc;
        }, []);

        setOrders(groupedOrders);
        setFilteredOrders(groupedOrders);
      } catch (error) {
        console.error("Error:", error);
        showToast("No se pudieron cargar las órdenes desde el servidor", 'error');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchQuery, statusFilter]);

  const applyFilters = () => {
    let filtered = [...orders];

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.state_ === statusFilter);
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.client_name?.toLowerCase().includes(query) ||
          order.service_name?.toLowerCase().includes(query) ||
          order.client_address?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };
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
      case 'finalizado':
        return '#6FCF97';
      case 'cancelado':
        return '#FF6B6B';
      default:
        return '#BDBDBD';
    }
  };
  // Helper para convertir Date a formato HH:mm:ss
  const formatTimeToHHMMSS = (date: Date): string => {
    return date.toTimeString().split(" ")[0]; // "HH:mm:ss"
  };

  const startTimer = async (orderId: number) => {
    try {
      setActionLoading(true);
      setIsStarting(true);

      console.log("Iniciando orden:", orderId);

      // El backend puede usar la hora del servidor si no enviamos start_time
      // O podemos enviar la hora actual en formato HH:mm:ss
      const startTime = formatTimeToHHMMSS(new Date());
      console.log("Hora de inicio:", startTime);

      const response = await startServiceOrder(orderId, startTime);
      console.log("Respuesta del servidor:", response);

      if (!response) {
        throw new Error("No se recibió respuesta del servidor");
      }

      // El backend retorna el estado en minúsculas: "en_progreso", "pendiente", etc.
      const backendState = response?.service_order?.state_ || "en_progreso";
      console.log("Estado del backend:", backendState);
      
      // El backend ya retorna en minúsculas, así que usamos directamente
      const frontendState = backendState;
      console.log("Estado del frontend:", frontendState);

      // Obtener la hora de inicio del backend si está disponible
      const backendStartTime = response?.service_order?.start_time || startTime;

      // Actualizar la orden en el estado
      setOrders(prev =>
        prev.map(order =>
          order.id_service_order === orderId
            ? { 
                ...order, 
                start_time: backendStartTime, 
                state_: frontendState 
              }
            : order
        )
      );

      // Actualizar selectedOrder
      setSelectedOrder((prev: any) => ({
        ...prev,
        start_time: backendStartTime,
        state_: frontendState,
      }));

      showToast("Orden iniciada correctamente", 'success');

    } catch (error: any) {
      console.error("Error iniciando orden:", error);
      const errorMessage = error.message || "No se pudo iniciar la orden. Verifica que la orden esté en estado 'Pendiente'.";
      showToast(errorMessage, 'error');
    } finally {
      setIsStarting(false);
      setActionLoading(false);
    }
  };


  const stopTimer = async () => {
    try {
      if (!selectedOrder) return;

      setIsStopping(true);

      const now = new Date();
      const endTime = now.toISOString().slice(0, 19).replace("T", " ");

      const response = await completeServiceOrder(selectedOrder.id_service_order, endTime);

      if (!response) {
        showToast("No se pudo completar la orden.", 'error');
        return;
      }

      setSelectedOrder((prev: any) => ({
        ...prev,
        end_time: endTime,
        state_: "finalizado",
      }));

      showToast("Orden completada correctamente", 'success');

    } catch (error) {
      console.error(error);
      showToast("No se pudo completar la orden.", 'error');
    } finally {
      setIsStopping(false);
    }
  };



  const completeOrder = async (id: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const now = new Date();

    // Busca la orden actual para calcular el tiempo transcurrido
    const order = orders.find(o => o.id_service_order === id);
    if (!order?.start_time) {
      showToast('Esta orden no tiene hora de inicio registrada.', 'warning');
      return;
    }

    // Validación de tiempo mínimo (opcional, puedes comentarla si no la necesitas)
    try {
      const startTime = new Date(order.start_time);
      const diffMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);

      if (diffMinutes < 5) {
        showToast(
          `Debes esperar al menos 5 minutos antes de marcar la orden como completada. (Han pasado ${diffMinutes} min).`,
          'warning'
        );
        return;
      }
    } catch (e) {
      // Si no se puede calcular el tiempo, continuar de todas formas
    }

    const endTimeFormatted = formatTimeToHHMMSS(now);

    try {
      // Usar el endpoint correcto de completeServiceOrder
      const response = await completeServiceOrder(id, endTimeFormatted);

      // El backend retorna el estado en minúsculas: "finalizado"
      const backendState = response?.service_order?.state_ || "finalizado";
      const frontendState = backendState; // Ya viene en minúsculas

      setActiveOrderId(null);

      setOrders(prev => {
        const updatedOrders = prev.map(o =>
          o.id_service_order === id
            ? {
                ...o,
                state_: frontendState,
                end_time: endTimeFormatted,
              }
            : o
        );
        const updatedOrder = updatedOrders.find(o => o.id_service_order === id);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
          setStep(2);
        }
        return updatedOrders;
      });
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'No se pudo registrar la hora de finalización.', 'error');
    }
  };

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
    setStep(1);
    setModalPage('info'); // Reset a la primera página
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSignature = async (sig: string) => {
    if (!selectedOrder) return;
    
    try {
      setActionLoading(true);
      
      // Enviar firma al backend
      await signServiceOrder(selectedOrder.id_service_order, sig);

      // Actualizar estado local
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

      showToast('Firma guardada correctamente', 'success');
      setModalVisible(false);
      setStep(1);
    } catch (error: any) {
      console.error('Error guardando firma:', error);
      showToast(error.message || 'No se pudo guardar la firma.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <View style={stylesContainers.container}>
      <View style={stylesBackground.backgroundBlue} />
      <View style={stylesBackground.backgroundYellow} />

      <View style={stylesHeader.header}>
        <View style={stylesHeader.headerBadge}>
          <Text style={stylesHeader.headerTitle}>Órdenes</Text>
          <Text style={stylesHeader.headerSubtitle}>Gestiona tus órdenes</Text>
        </View>
        <TouchableOpacity
          style={stylesHeader.headerIcon}
          onPress={() => router.push('/profile')}
        >
          <User color="#fff" size={28} />
        </TouchableOpacity>
      </View>

      {/* Filters Section */}
      <View style={styles.filtersSection}>
        <Text style={stylesText.filterLabel}>Filtrar</Text>
        
        {/* Search Bar */}
        <View style={stylesContainers.searchContainer}>
          <Search size={20} color="#999" />
          <TextInput
            style={stylesText.searchInput}
            placeholder="Buscar órdenes..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Status Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
          {['all', 'pendiente', 'en_progreso', 'finalizado', 'cancelado'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusChip,
                statusFilter === status
                  ? {
                      backgroundColor: getStatusColor(status === 'all' ? '' : status),
                      borderColor: getStatusColor(status === 'all' ? '#3C8BF2' : status),
                    }
                  : {
                      backgroundColor: '#F5F5F5',
                      borderColor: '#E0E0E0',
                    },
              ]}
              onPress={() => setStatusFilter(status as any)}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      status === 'all'
                        ? '#3C8BF2'
                        : getStatusColor(status),
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusChipText,
                  statusFilter === status ? { color: '#FFF' } : { color: '#333' },
                ]}
              >
                {status === 'all'
                  ? 'Todas'
                  : status === 'pendiente'
                  ? 'Pendiente'
                  : status === 'en_progreso'
                  ? 'En progreso'
                  : status === 'finalizado'
                  ? 'Finalizado'
                  : 'Cancelado'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
              {item.state_ === 'en_progreso' && (
                <Text style={styles.elapsedText}>{formatTime(item.elapsed)}</Text>
              )}
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
      />

      {selectedOrder && (
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              
              {/* Modal de confirmación de cancelación - Aparece sobre el modal principal */}
              {cancelModalVisible && (
                <View style={styles.cancelConfirmOverlay}>
                  <View style={styles.cancelConfirmCard}>
                    <View style={stylesModal.modalHeader}>
                      <Text style={stylesText.modalTitle}>Cancelar orden</Text>
                      <TouchableOpacity onPress={() => setCancelModalVisible(false)}>
                        <X size={24} color="#333" />
                      </TouchableOpacity>
                    </View>

                    <Text style={[stylesText.sectionText, { textAlign: 'center', marginVertical: 20 }]}>
                      ¿Estás seguro de que deseas cancelar esta orden?
                    </Text>

                    <View style={styles.cancelActions}>
                      <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: '#FF6B6B' }]}
                        onPress={async () => {
                          if (!selectedOrder) return;
                          
                          try {
                            setActionLoading(true);
                            await cancelServiceOrder(selectedOrder.id_service_order);

                            // Actualizar el estado de la orden
                            setOrders(prev =>
                              prev.map(order =>
                                order.id_service_order === selectedOrder.id_service_order
                                  ? {
                                      ...order,
                                      state_: "cancelado",
                                    }
                                  : order
                              )
                            );

                            showToast("La orden ha sido cancelada correctamente", 'success');
                            setCancelModalVisible(false);
                            setModalVisible(false);
                            setSelectedOrder(null);

                          } catch (error: any) {
                            console.error('ERROR CANCELANDO:', error);
                            showToast(error.message || "No se pudo cancelar la orden.", 'error');
                          } finally {
                            setActionLoading(false);
                          }
                        }}
                        disabled={actionLoading}
                      >
                        <Text style={styles.cancelButtonText}>
                          {actionLoading ? "Cancelando..." : "Sí, cancelar"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: '#CCC' }]}
                        onPress={() => setCancelModalVisible(false)}
                      >
                        <Text style={[styles.cancelButtonText, { color: '#333' }]}>No, volver</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
              <View style={stylesModal.modalHeader}>
                <Text style={stylesText.modalTitle}>{selectedOrder.client_name}</Text>
                <TouchableOpacity onPress={closeModal}>
                  <X size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {/* Header con Status Badge y Tabs */}
              <View style={styles.modalHeaderContent}>
                <View style={{ flex: 1 }}>
                  <Text style={stylesText.modalTitle}>{selectedOrder.client_name}</Text>
                  <Text style={[stylesText.modalSubtitle, { marginTop: 4 }]}>
                    {selectedOrder.service_name}
                  </Text>
                </View>
                <View style={[styles.statusBadgeModal, { backgroundColor: getStatusColor(selectedOrder.state_) }]}>
                  <Text style={styles.statusTextModal}>
                    {selectedOrder.state_ === 'pendiente' ? 'Pendiente' :
                     selectedOrder.state_ === 'en_progreso' ? 'En progreso' :
                     selectedOrder.state_ === 'finalizado' ? 'Finalizado' : 'Cancelado'}
                  </Text>
                </View>
              </View>

              {/* Tabs de navegación */}
              <View style={styles.modalTabs}>
                <TouchableOpacity
                  style={[styles.modalTab, modalPage === 'info' && styles.modalTabActive]}
                  onPress={() => setModalPage('info')}
                >
                  <Calendar size={18} color={modalPage === 'info' ? '#3C8BF2' : '#999'} />
                  <Text style={[styles.modalTabText, modalPage === 'info' && styles.modalTabTextActive]}>
                    Información
                  </Text>
                </TouchableOpacity>
                
                {selectedOrder.activities && (
                  <TouchableOpacity
                    style={[styles.modalTab, modalPage === 'activities' && styles.modalTabActive]}
                    onPress={() => setModalPage('activities')}
                  >
                    <FileText size={18} color={modalPage === 'activities' ? '#3C8BF2' : '#999'} />
                    <Text style={[styles.modalTabText, modalPage === 'activities' && styles.modalTabTextActive]}>
                      Actividades
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.modalTab, modalPage === 'materials' && styles.modalTabActive]}
                  onPress={() => setModalPage('materials')}
                >
                  <Package size={18} color={modalPage === 'materials' ? '#3C8BF2' : '#999'} />
                  <Text style={[styles.modalTabText, modalPage === 'materials' && styles.modalTabTextActive]}>
                    Materiales
                  </Text>
                </TouchableOpacity>

                {/* Tab de Firma - Solo visible si la orden está finalizada y tiene firma */}
                {selectedOrder.state_ === 'finalizado' && (selectedOrder.files || selectedOrder.signature) && (
                  <TouchableOpacity
                    style={[styles.modalTab, modalPage === 'signature' && styles.modalTabActive]}
                    onPress={() => setModalPage('signature')}
                  >
                    <PenTool size={18} color={modalPage === 'signature' ? '#3C8BF2' : '#999'} />
                    <Text style={[styles.modalTabText, modalPage === 'signature' && styles.modalTabTextActive]}>
                      Firma
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                scrollEnabled={scrollEnabled}
              >
                {step === 1 && (
                  <View style={{ paddingBottom: 30 }}>
                    {/* Página 1: Información General */}
                    {modalPage === 'info' && (
                      <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                          <Calendar size={22} color="#3C8BF2" />
                          <Text style={styles.sectionTitle}>Información General</Text>
                        </View>
                        
                        <View style={styles.compactInfoRow}>
                          <Text style={styles.compactLabel}>Fecha:</Text>
                          <Text style={styles.compactValue}>
                            {selectedOrder.scheduled_date 
                              ? new Date(selectedOrder.scheduled_date).toLocaleDateString('es-MX', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : 'Sin fecha'}
                          </Text>
                        </View>
                        
                        <View style={styles.compactInfoRow}>
                          <Text style={styles.compactLabel}>Inicio:</Text>
                          <Text style={styles.compactValue}>
                            {selectedOrder.start_time || 'No iniciada'}
                          </Text>
                        </View>
                        
                        {selectedOrder.end_time && (
                          <View style={styles.compactInfoRow}>
                            <Text style={styles.compactLabel}>Finalización:</Text>
                            <Text style={styles.compactValue}>{selectedOrder.end_time}</Text>
                          </View>
                        )}

                        {selectedOrder.state_ === 'en_progreso' && (
                          <View style={[styles.compactInfoRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0' }]}>
                            <Clock size={16} color="#FFD84A" />
                            <Text style={[styles.compactLabel, { marginLeft: 6 }]}>Tiempo:</Text>
                            <Text style={[styles.compactValue, { color: '#FFD84A', fontWeight: '700' }]}>
                              {formatTime(
                                orders.find(o => o.id_service_order === selectedOrder.id_service_order)?.elapsed || 0
                              )}
                            </Text>
                          </View>
                        )}

                        <TouchableOpacity
                          style={styles.addressRow}
                          onPress={() => setShowMapOptions(true)}
                          activeOpacity={0.7}
                        >
                          <MapPin size={18} color="#3C8BF2" />
                          <Text style={styles.addressText} numberOfLines={2}>
                            {selectedOrder.client_address}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Página 2: Actividades */}
                    {modalPage === 'activities' && selectedOrder.activities && (
                      <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                          <FileText size={22} color="#3C8BF2" />
                          <Text style={styles.sectionTitle}>Actividades</Text>
                        </View>
                        <Text style={styles.activitiesText}>{selectedOrder.activities}</Text>
                      </View>
                    )}

                    {modalPage === 'activities' && !selectedOrder.activities && (
                      <View style={styles.sectionCard}>
                        <Text style={styles.emptyText}>No hay actividades registradas para esta orden.</Text>
                      </View>
                    )}

                    {/* Página 3: Materiales */}
                    {modalPage === 'materials' && (
                      <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                          <Package size={22} color="#3C8BF2" />
                          <Text style={styles.sectionTitle}>Materiales</Text>
                        </View>
                        {selectedOrder.products.length === 0 ? (
                          <Text style={styles.emptyText}>No se registraron materiales en esta orden.</Text>
                        ) : (
                          <View style={styles.productsList}>
                            {selectedOrder.products.map((p, index) => (
                              <View key={index} style={styles.compactProductCard}>
                                {p.image_url ? (
                                  <Image
                                    source={{ uri: p.image_url }}
                                    style={styles.compactProductImage}
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <View style={[styles.compactProductImage, styles.placeholderImage]}>
                                    <Package size={20} color="#999" />
                                  </View>
                                )}
                                <View style={styles.compactProductInfo}>
                                  <Text style={styles.compactProductName} numberOfLines={1}>{p.name}</Text>
                                  <Text style={styles.compactProductQuantity}>
                                    Cantidad: <Text style={{ fontWeight: '700' }}>{p.quantity}</Text>
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}

                    {/* Página 4: Firma - Solo visible si está finalizada */}
                    {modalPage === 'signature' && selectedOrder.state_ === 'finalizado' && (
                      <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                          <PenTool size={22} color="#3C8BF2" />
                          <Text style={styles.sectionTitle}>Firma del Cliente</Text>
                        </View>
                        {(selectedOrder.files || selectedOrder.signature) ? (
                          <View style={styles.signatureContainer}>
                            <Image
                              source={{ 
                                uri: (selectedOrder.files || selectedOrder.signature || '').startsWith('data:') 
                                  ? selectedOrder.files || selectedOrder.signature || ''
                                  : `data:image/png;base64,${selectedOrder.files || selectedOrder.signature || ''}`
                              }}
                              style={styles.signatureImage}
                              resizeMode="contain"
                            />
                          </View>
                        ) : (
                          <Text style={styles.emptyText}>No hay firma registrada para esta orden.</Text>
                        )}
                      </View>
                    )}

                    {/* Botones de Acción */}
                    <View style={styles.actions}>
                      {selectedOrder.state_ !== 'finalizado' ? (
                        <>
                          {/* Botón principal: Comenzar / Completar */}
                          <TouchableOpacity
                            disabled={actionLoading}
                            style={[
                              styles.actionButton,
                              styles.primaryActionButton,
                              actionLoading && { opacity: 0.5 },
                              {
                                backgroundColor:
                                  selectedOrder.state_ === 'en_progreso'
                                    ? '#6FCF97'   // completar
                                    : '#FFD84A',  // comenzar
                              },
                            ]}
                            onPress={async () => {
                              // Bloqueo para evitar doble tap
                              if (actionLoading) return;

                              // Si ya está en progreso → completar orden
                              if (selectedOrder.state_ === "en_progreso") {
                                setActionLoading(true);
                                await completeOrder(selectedOrder.id_service_order);
                                setActionLoading(false);
                                return;
                              }

                              // Si YA tiene start_time evitar reinicio
                              if (selectedOrder.start_time) {
                                showToast(
                                  "Esta orden ya fue iniciada anteriormente. No es posible volver a iniciarla.",
                                  'warning'
                                );
                                return;
                              }

                              // Verificar que el estado sea pendiente
                              if (selectedOrder.state_ !== "pendiente") {
                                showToast(
                                  `No se puede iniciar una orden con estado "${selectedOrder.state_}". Solo se pueden iniciar órdenes pendientes.`,
                                  'warning'
                                );
                                return;
                              }

                              // Confirmación para comenzar la orden
                              Alert.alert(
                                "Confirmación",
                                "¿Deseas comenzar la orden?",
                                [
                                  { text: "Cancelar", style: "cancel" },
                                  {
                                    text: "Sí, comenzar",
                                    onPress: async () => {
                                      await startTimer(selectedOrder.id_service_order);
                                    },
                                  },
                                ]
                              );
                            }}
                          >
                            <Text style={stylesText.actionText}>
                              {actionLoading
                                ? "Procesando..."
                                : selectedOrder.state_ === "en_progreso"
                                  ? "Finalizar"
                                  : "Comenzar"}
                            </Text>
                          </TouchableOpacity>

                          {/* Botón cancelar - Solo visible si no está finalizado ni cancelado */}
                          {selectedOrder.state_ !== 'cancelado' && (
                            <TouchableOpacity
                              style={[styles.actionButton, styles.cancelActionButton]}
                              onPress={() => setCancelModalVisible(true)}
                            >
                              <Text style={stylesText.actionText}>Cancelar orden</Text>
                            </TouchableOpacity>
                          )}
                        </>
                      ) : (
                        <Text style={stylesText.completedText}>
                          Orden completada ({formatTime(selectedOrder.elapsed)})
                        </Text>
                      )}
                    </View>



                  </View>
                )}


                {selectedOrder.state_ === 'finalizado' && step === 2 && (
                  <View style={styles.stepContainer}>
                    <Text style={[stylesText.sectionTitle, { marginBottom: 10 }]}>
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
                        <Text style={stylesText.sectionTitle}>Indica el material utilizado</Text>

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
                          onPress={async () => {
                            if (!selectedOrder) return;
                            
                            try {
                              setActionLoading(true);
                              
                              // Convertir materialInputs a formato del backend: [{ product_id, quantity_used }]
                              const productsArray = Object.entries(materialInputs).map(([productId, quantity]) => ({
                                product_id: parseInt(productId),
                                quantity_used: quantity as number,
                              }));

                              // Enviar productos usados al backend
                              await addUsedProducts(selectedOrder.id_service_order, productsArray);

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
                            } catch (error: any) {
                              console.error('Error guardando productos:', error);
                              showToast(error.message || "No se pudieron guardar los productos usados.", 'error');
                            } finally {
                              setActionLoading(false);
                            }
                          }}
                          disabled={actionLoading}
                        >
                          <Text style={stylesText.actionText}>
                            {actionLoading ? "Guardando..." : "Guardar y Continuar"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}



                {step === 3 && (
                  <View style={styles.stepContainer}>
                    {/* Calificación */}
                    <Text style={[stylesText.sectionTitle, { marginBottom: 16 }]}>Califica al técnico</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 30 }}>
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

                    {/* Firma del cliente */}
                    <Text style={[stylesText.sectionTitle, { marginBottom: 10 }]}>Firma del cliente</Text>

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

                    <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'center' }}>
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
                        disabled={actionLoading}
                      >
                        <Save color="#fff" size={20} />
                        <Text style={{ color: '#fff', marginLeft: 10, fontSize: 15, fontWeight: '600' }}>
                          {actionLoading ? "Guardando..." : "Guardar"}
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
      <Modal
        visible={showMapOptions}
        animationType="fade"
        transparent
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowMapOptions(false)}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Abrir en:</Text>

            <TouchableOpacity
              style={styles.option}
              onPress={() => openGoogleMaps(selectedOrder.client_address)}
            >
              <Text style={styles.optionText}>Google Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => openAppleMaps(selectedOrder.client_address)}
            >
              <Text style={styles.optionText}>Apple Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => openWaze(selectedOrder.client_address)}
            >
              <Text style={styles.optionText}>Waze</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
        duration={4000}
      />

    </View>
  );
}

const styles = StyleSheet.create({

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

  detailsRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },

  section: { marginTop: 12 },

  timerContainer: { alignItems: 'center', marginVertical: 14 },

  actions: { 
    flexDirection: 'row',
    alignItems: 'stretch', 
    marginTop: 16,
    gap: 10,
  },
  actionButton: {
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  primaryActionButton: {
    // Estilos específicos para el botón principal
  },
  cancelActionButton: {
    backgroundColor: '#FF6B6B',
  },
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
  sectionCard: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  compactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    width: 85,
  },
  compactValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    lineHeight: 18,
  },
  activitiesText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  compactProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  compactProductImage: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginRight: 10,
  },
  placeholderImage: {
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactProductInfo: {
    flex: 1,
  },
  compactProductName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  compactProductQuantity: {
    fontSize: 12,
    color: '#666',
  },
  signatureContainer: {
    marginTop: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  signatureImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },

  materialItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  materialImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginLeft: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    elevation: 5,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
  },

  // Modal Improvements
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statusBadgeModal: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  statusTextModal: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  modalTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  modalTabActive: {
    backgroundColor: '#D1E4FA',
  },
  modalTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  modalTabTextActive: {
    color: '#3C8BF2',
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    marginTop: 4,
  },
  addressCard: {
    backgroundColor: '#F9F9F9',
  },
  productsList: {
    marginTop: 12,
    gap: 10,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 13,
    color: '#666',
  },

  // Filters
  filtersSection: {
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 8,
  },
  statusFilters: {
    marginTop: 12,
    marginBottom: 4,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Modal de confirmación de cancelación (sobre el modal principal)
  cancelConfirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  cancelConfirmCard: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
  },
  cancelActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },

});