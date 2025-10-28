import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, StyleSheet } from 'react-native';
import { Plus, X, Calendar, MapPin, User, CheckCircle2, Clock } from 'lucide-react-native';

interface Order {
  id: number;
  title: string;
  client: string;
  service: string;
  date: string;
  address: string;
  status: 'pendiente' | 'en_progreso' | 'completado';
}

const OrdersScreen = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      title: 'Instalación fibra óptica',
      client: 'Carlos López',
      service: 'Internet Hogar',
      date: '2025-10-19',
      address: 'Av. Reforma #123, CDMX',
      status: 'pendiente',
    },
    {
      id: 2,
      title: 'Mantenimiento general',
      client: 'María Gómez',
      service: 'Red Corporativa',
      date: '2025-10-18',
      address: 'Calle Hidalgo #456, Monterrey',
      status: 'completado',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const handleAddPress = () => {
    // lógica de creación nueva orden
    alert('Aquí abrirías el formulario de nueva orden 📦');
  };

  // Ejemplo de conexión futura con backend:
  /*
  useEffect(() => {
    fetch('http://localhost:4000/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));
  }, []);
  */

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Órdenes</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
          <Plus color="#FFF" size={24} />
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.orderCard} onPress={() => handleOrderPress(item)}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderTitle}>{item.title}</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      item.status === 'completado'
                        ? '#4CAF50'
                        : item.status === 'en_progreso'
                        ? '#FFB300'
                        : '#D32F2F',
                  },
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.orderClient}>👤 {item.client}</Text>
            <Text style={styles.orderService}>🔧 {item.service}</Text>
            <View style={styles.orderInfo}>
              <Calendar color="#666" size={14} />
              <Text style={styles.orderInfoText}>{item.date}</Text>
            </View>
            <View style={styles.orderInfo}>
              <MapPin color="#666" size={14} />
              <Text style={styles.orderInfoText}>{item.address}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Modal detalle */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle de Orden</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <View>
                <Text style={styles.detailTitle}>{selectedOrder.title}</Text>

                <Text style={styles.detailLabel}>Cliente</Text>
                <Text style={styles.detailValue}>{selectedOrder.client}</Text>

                <Text style={styles.detailLabel}>Servicio</Text>
                <Text style={styles.detailValue}>{selectedOrder.service}</Text>

                <Text style={styles.detailLabel}>Fecha</Text>
                <Text style={styles.detailValue}>{selectedOrder.date}</Text>

                <Text style={styles.detailLabel}>Dirección</Text>
                <Text style={styles.detailValue}>{selectedOrder.address}</Text>

                <Text style={styles.detailLabel}>Estatus</Text>
                <Text style={styles.detailValue}>{selectedOrder.status}</Text>

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
              </View>
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
    justifyContent: 'space-between',
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
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
});
