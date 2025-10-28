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
  Switch,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Plus, X, DollarSign, Clock } from 'lucide-react-native';

export default function ServicesScreen() {
  // 🔹 Simular usuario (dummy)
  const user = { id: 'dummy-user-001', name: 'Instalador Demo' };

  const [services, setServices] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_hours: '',
    active: true,
  });

  useEffect(() => {
    loadServices();
  }, []);

  // 🔹 Cargar servicios (simulación local)
  const loadServices = async () => {
    try {
      // 👉 Aquí luego puedes hacer un fetch a tu API Node
      // const res = await fetch('https://tu-api.com/services?installer_id=' + user.id);
      // const data = await res.json();

      const data = [
        {
          id: '1',
          name: 'Instalación de Internet',
          description: 'Configuración completa de red doméstica.',
          price: 500,
          duration_hours: 2,
          active: true,
        },
        {
          id: '2',
          name: 'Mantenimiento de equipos',
          description: 'Limpieza y revisión de hardware.',
          price: 300,
          duration_hours: 1,
          active: false,
        },
      ];

      setServices(data);
    } catch (e) {
      console.error('Error al cargar servicios:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const handleAddService = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'El nombre del servicio es obligatorio');
      return;
    }

    try {
      const newService = {
        id: Date.now().toString(),
        installer_id: user.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        duration_hours: parseInt(formData.duration_hours) || 1,
        active: formData.active,
      };

      // 👉 Aquí luego harías:
      // await fetch('https://tu-api.com/services', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newService),
      // });

      setServices((prev) => [...prev, newService]);
      setModalVisible(false);
      resetForm();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo guardar el servicio');
    }
  };

  const handleToggleActive = async (serviceId: string, currentStatus: boolean) => {
    try {
      const updatedServices = services.map((s) =>
        s.id === serviceId ? { ...s, active: !currentStatus } : s
      );
      setServices(updatedServices);

      // 👉 Luego podrías hacer:
      // await fetch(`https://tu-api.com/services/${serviceId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ active: !currentStatus }),
      // });
    } catch {
      console.log('Actualización local (sin API)');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration_hours: '',
      active: true,
    });
  };

  const renderService = ({ item }: { item: any }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Switch
          value={item.active}
          onValueChange={() => handleToggleActive(item.id, item.active)}
          trackColor={{ false: '#CCCCCC', true: '#0066CC' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {item.description && <Text style={styles.serviceDescription}>{item.description}</Text>}

      <View style={styles.serviceInfo}>
        <View style={styles.serviceInfoItem}>
          <DollarSign size={16} color="#666666" />
          <Text style={styles.serviceInfoText}>${item.price.toFixed(2)}</Text>
        </View>

        <View style={styles.serviceInfoItem}>
          <Clock size={16} color="#666666" />
          <Text style={styles.serviceInfoText}>
            {item.duration_hours} {item.duration_hours === 1 ? 'hora' : 'horas'}
          </Text>
        </View>
      </View>

      {!item.active && <Text style={styles.inactiveLabel}>Inactivo</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Servicios</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay servicios registrados</Text>
          </View>
        }
      />

      {/* MODAL: Nuevo Servicio */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nuevo Servicio</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color="#666666" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Nombre del servicio *"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descripción"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={styles.input}
                placeholder="Precio"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="decimal-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Duración en horas"
                value={formData.duration_hours}
                onChangeText={(text) => setFormData({ ...formData, duration_hours: text })}
                keyboardType="number-pad"
              />

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Servicio activo</Text>
                <Switch
                  value={formData.active}
                  onValueChange={(value) => setFormData({ ...formData, active: value })}
                  trackColor={{ false: '#CCCCCC', true: '#0066CC' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleAddService}>
                <Text style={styles.saveButtonText}>Guardar Servicio</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
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
  list: { padding: 16 },
  serviceCard: {
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
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: { fontSize: 18, fontWeight: '600', color: '#333333', flex: 1 },
  serviceDescription: { fontSize: 14, color: '#666666', marginBottom: 12 },
  serviceInfo: { flexDirection: 'row', gap: 24 },
  serviceInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  serviceInfoText: { fontSize: 14, color: '#666666' },
  inactiveLabel: { marginTop: 8, fontSize: 12, color: '#CC0000', fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, color: '#999999' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
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
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  switchLabel: { fontSize: 16, color: '#333333' },
  saveButton: { backgroundColor: '#0066CC', borderRadius: 12, padding: 16, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
