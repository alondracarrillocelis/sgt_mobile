import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, StyleSheet, ScrollView } from 'react-native';
import { X, Calendar, MapPin, CheckCircle2, Clock } from 'lucide-react-native';

interface Product {
  id_product: number;
  name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id_service_order: number;
  client_id: number;
  client_name: string;
  client_address: string;
  service_id: number;
  service_name: string;
  personal_id: number;
  personal_name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  price: number;
  activities: string;
  recommendations: string;
  files: string | null;
  notes: string | null;
  state_: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  products: Product[];
}

const OrdersScreen = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id_service_order: 1,
      client_id: 1,
      client_name: 'Carlos López',
      client_address: 'Av. Reforma #123, CDMX',
      service_id: 1,
      service_name: 'Instalación de fibra óptica',
      personal_id: 1,
      personal_name: 'Juan Pérez',
      contact_name: 'Carlos López',
      contact_phone: '5551234567',
      contact_email: 'carlos.lopez@email.com',
      scheduled_date: '2025-10-19',
      start_time: '09:00:00',
      end_time: '13:00:00',
      price: 2500.00,
      activities: 'Instalación de fibra óptica en oficina principal. Configuración de router y puntos de acceso.',
      recommendations: 'Mantener área despejada para facilitar instalación. Verificar acceso a cuarto de telecomunicaciones.',
      files: null,
      notes: 'Cliente requiere instalación urgente',
      state_: 'pendiente',
      products: [
        { id_product: 1, name: 'Cable fibra óptica 100m', quantity: 1, unit_price: 500.00 },
        { id_product: 2, name: 'Router empresarial', quantity: 1, unit_price: 1500.00 },
        { id_product: 3, name: 'Conectores SC/APC', quantity: 4, unit_price: 50.00 }
      ]
    },
    {
      id_service_order: 2,
      client_id: 2,
      client_name: 'María Gómez',
      client_address: 'Calle Hidalgo #456, Monterrey',
      service_id: 2,
      service_name: 'Mantenimiento preventivo de red',
      personal_id: 2,
      personal_name: 'Ana Martínez',
      contact_name: 'María Gómez',
      contact_phone: '5559876543',
      contact_email: 'maria.gomez@email.com',
      scheduled_date: '2025-10-18',
      start_time: '14:00:00',
      end_time: '17:00:00',
      price: 1500.00,
      activities: 'Revisión de equipos de red, actualización de firmware, verificación de conexiones.',
      recommendations: 'Programar mantenimientos cada 6 meses. Considerar actualización de switches antiguos.',
      files: 'reporte_mantenimiento_oct2025.pdf',
      notes: 'Servicio completado sin inconvenientes',
      state_: 'completado',
      products: [
        { id_product: 4, name: 'Cable de red Cat6', quantity: 10, unit_price: 15.00 },
        { id_product: 5, name: 'Conectores RJ45', quantity: 20, unit_price: 5.00 }
      ]
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Órdenes</Text>
      </View>

      {/* Lista */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id_service_order.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.orderCard} onPress={() => handleOrderPress(item)}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderTitle}>{item.service_name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      item.state_ === 'completado'
                        ? '#4CAF50'
                        : item.state_ === 'en_progreso'
                        ? '#FFB300'
                        : item.state_ === 'cancelado'
                        ? '#999'
                        : '#D32F2F',
                  },
                ]}
              >
                <Text style={styles.statusText}>{item.state_}</Text>
              </View>
            </View>
            <Text style={styles.orderClient}>👤 {item.client_name}</Text>
            <Text style={styles.orderService}>🔧 {item.service_name}</Text>
            <Text style={styles.orderTechnician}>👨‍🔧 Técnico: {item.personal_name}</Text>
            <View style={styles.orderInfo}>
              <Calendar color="#666" size={14} />
              <Text style={styles.orderInfoText}>{item.scheduled_date} • {item.start_time} - {item.end_time}</Text>
            </View>
            <View style={styles.orderInfo}>
              <MapPin color="#666" size={14} />
              <Text style={styles.orderInfoText}>{item.client_address}</Text>
            </View>
            <Text style={styles.orderPrice}>💰 ${item.price.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal detalle */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle de Orden #{selectedOrder?.id_service_order}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.detailTitle}>{selectedOrder.service_name}</Text>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📋 Información General</Text>

                  <Text style={styles.detailLabel}>Cliente</Text>
                  <Text style={styles.detailValue}>{selectedOrder.client_name}</Text>

                  <Text style={styles.detailLabel}>Servicio</Text>
                  <Text style={styles.detailValue}>{selectedOrder.service_name}</Text>

                  <Text style={styles.detailLabel}>Técnico Asignado</Text>
                  <Text style={styles.detailValue}>{selectedOrder.personal_name}</Text>

                  <Text style={styles.detailLabel}>Estado</Text>
                  <Text style={[styles.detailValue, { color:
                    selectedOrder.state_ === 'completado' ? '#4CAF50' :
                    selectedOrder.state_ === 'en_progreso' ? '#FFB300' :
                    selectedOrder.state_ === 'cancelado' ? '#999' : '#D32F2F'
                  }]}>{selectedOrder.state_.toUpperCase()}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📞 Información de Contacto</Text>

                  <Text style={styles.detailLabel}>Nombre de Contacto</Text>
                  <Text style={styles.detailValue}>{selectedOrder.contact_name}</Text>

                  <Text style={styles.detailLabel}>Teléfono</Text>
                  <Text style={styles.detailValue}>{selectedOrder.contact_phone}</Text>

                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{selectedOrder.contact_email}</Text>

                  <Text style={styles.detailLabel}>Dirección</Text>
                  <Text style={styles.detailValue}>{selectedOrder.client_address}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📅 Programación y Precio</Text>

                  <Text style={styles.detailLabel}>Fecha Programada</Text>
                  <Text style={styles.detailValue}>{selectedOrder.scheduled_date}</Text>

                  <Text style={styles.detailLabel}>Horario</Text>
                  <Text style={styles.detailValue}>{selectedOrder.start_time} - {selectedOrder.end_time}</Text>

                  <Text style={styles.detailLabel}>Precio Total</Text>
                  <Text style={[styles.detailValue, { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' }]}>
                    ${selectedOrder.price.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📝 Actividades</Text>
                  <Text style={styles.detailValue}>{selectedOrder.activities}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>💡 Recomendaciones</Text>
                  <Text style={styles.detailValue}>{selectedOrder.recommendations}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🛠️ Productos Utilizados</Text>
                  {selectedOrder.products.map((product, index) => (
                    <View key={index} style={styles.productItem}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productDetails}>
                        Cantidad: {product.quantity} | Precio unit: ${product.unit_price.toFixed(2)}
                      </Text>
                      <Text style={styles.productTotal}>
                        Total: ${(product.quantity * product.unit_price).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>

                {selectedOrder.notes && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📌 Notas</Text>
                    <Text style={styles.detailValue}>{selectedOrder.notes}</Text>
                  </View>
                )}

                {selectedOrder.files && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📎 Archivos</Text>
                    <Text style={styles.detailValue}>{selectedOrder.files}</Text>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#FFB300' }]}
                    onPress={() => alert('Orden en progreso 🚧')}
                  >
                    <Clock size={18} color="#FFF" />
                    <Text style={styles.actionButtonText}>En progreso</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                    onPress={() => alert('Orden completada ✅')}
                  >
                    <CheckCircle2 size={18} color="#FFF" />
                    <Text style={styles.actionButtonText}>Completar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // 🔹 mantenido igual para no afectar layout
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  list: {
    padding: 16,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  orderClient: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  orderService: {
    fontSize: 14,
    color: '#0066CC',
    marginBottom: 8,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  orderInfoText: {
    fontSize: 13,
    color: '#666666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
    marginTop: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  orderTechnician: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 4,
  },
  scrollContainer: {
    maxHeight: '80%',
  },
  section: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  productItem: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  productTotal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 4,
  },
});
