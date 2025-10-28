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
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Navigation,
  Camera,
  CheckCircle,
  Clock,
  MapPin,
  AlertCircle,
} from 'lucide-react-native';
import { useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';

export default function MonitoringScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [statusNote, setStatusNote] = useState('');
  const [photoType, setPhotoType] = useState<'before' | 'during' | 'after' | 'issue'>('during');

  useEffect(() => {
    loadOrder();
    loadTracking();
    loadPhotos();
    getLocation();
  }, [orderId]);

  // 🔹 Cargar datos de la orden desde tu backend Node.js
  const loadOrder = async () => {
    try {
      /*
      const response = await fetch(`https://tu-api.com/orders/${orderId}`);
      const data = await response.json();
      setOrder(data);
      */
      // Simulación temporal:
      setOrder({
        id: orderId,
        title: 'Instalación de red eléctrica',
        status: 'pending',
        clients: { full_name: 'Juan Pérez' },
        services: { name: 'Instalación Eléctrica' },
        address: 'Calle Reforma #123, Durango',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la orden');
    }
  };

  // 🔹 Cargar el historial de seguimiento desde tu API
  const loadTracking = async () => {
    try {
      /*
      const response = await fetch(`https://tu-api.com/orders/${orderId}/tracking`);
      const data = await response.json();
      setTracking(data);
      */
      setTracking([]); // Simulación
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el seguimiento');
    }
  };

  // 🔹 Cargar fotos registradas desde tu API
  const loadPhotos = async () => {
    try {
      /*
      const response = await fetch(`https://tu-api.com/orders/${orderId}/photos`);
      const data = await response.json();
      setPhotos(data);
      */
      setPhotos([]); // Simulación
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las fotos');
    }
  };

  // 🔹 Obtener ubicación del dispositivo
  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
  };

  // 🔹 Registrar una actualización de estado en tu API
  const handleAddTracking = async (status: string) => {
    if (!statusNote.trim()) {
      Alert.alert('Error', 'Por favor agrega una nota sobre el progreso');
      return;
    }

    try {
      /*
      const response = await fetch(`https://tu-api.com/orders/${orderId}/tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          notes: statusNote,
          latitude: location?.latitude,
          longitude: location?.longitude,
        }),
      });
      const data = await response.json();
      */
      setTracking((prev) => [
        {
          id: Date.now(),
          status,
          notes: statusNote,
          created_at: new Date().toISOString(),
          latitude: location?.latitude,
          longitude: location?.longitude,
        },
        ...prev,
      ]);

      setStatusNote('');

      // 🔹 Actualizar estado general de la orden (en progreso o completada)
      if (status === 'in_progress' && order?.status === 'pending') {
        /*
        await fetch(`https://tu-api.com/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'in_progress' }),
        });
        */
        setOrder({ ...order, status: 'in_progress' });
      }

      if (status === 'completed') {
        /*
        await fetch(`https://tu-api.com/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'completed',
            completed_date: new Date().toISOString(),
          }),
        });
        */
        setOrder({ ...order, status: 'completed' });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el seguimiento');
    }
  };

  // 🔹 Capturar foto (pendiente de integrar con tu API)
  const handleTakePhoto = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Error', 'Se necesitan permisos de cámara');
        return;
      }
    }
    // Aquí puedes abrir el componente CameraView y subir la imagen a tu backend.
    setShowCamera(true);
  };

  // 🔹 Utilidades visuales
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'in_progress':
        return '#0066CC';
      case 'completed':
        return '#00AA00';
      case 'cancelled':
        return '#CC0000';
      default:
        return '#999999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getPhotoTypeLabel = (type: string) => {
    switch (type) {
      case 'before':
        return 'Antes';
      case 'during':
        return 'Durante';
      case 'after':
        return 'Después';
      case 'issue':
        return 'Problema';
      default:
        return type;
    }
  };

  if (!order) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monitoreo de Instalación</Text>
      </View>

      {/* 🔹 Información de la orden */}
      <View style={styles.orderInfo}>
        <Text style={styles.orderTitle}>{order.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cliente:</Text>
          <Text style={styles.infoValue}>{order.clients?.full_name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Servicio:</Text>
          <Text style={styles.infoValue}>{order.services?.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <MapPin size={16} color="#666666" />
          <Text style={styles.infoValue}>{order.address}</Text>
        </View>
      </View>

      {/* 🔹 Ubicación actual */}
      {location && (
        <View style={styles.locationCard}>
          <Navigation size={20} color="#0066CC" />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Ubicación actual</Text>
            <Text style={styles.locationCoords}>
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
          </View>
        </View>
      )}

      {/* 🔹 Agregar actualización */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Agregar Actualización</Text>

        <TextInput
          style={styles.noteInput}
          placeholder="Describe el progreso actual..."
          value={statusNote}
          onChangeText={setStatusNote}
          multiline
          numberOfLines={3}
        />

        <View style={styles.actionButtons}>
          {order.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#0066CC' }]}
              onPress={() => handleAddTracking('in_progress')}
            >
              <Clock size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Iniciar Trabajo</Text>
            </TouchableOpacity>
          )}

          {order.status === 'in_progress' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#0066CC' }]}
                onPress={() => handleAddTracking('in_progress')}
              >
                <AlertCircle size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Actualizar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#00AA00' }]}
                onPress={() => handleAddTracking('completed')}
              >
                <CheckCircle size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Completar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* 🔹 Historial */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial de Seguimiento</Text>

        {tracking.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay actualizaciones registradas</Text>
          </View>
        ) : (
          tracking.map((item) => (
            <View key={item.id} style={styles.trackingCard}>
              <View style={styles.trackingHeader}>
                <Text style={styles.trackingStatus}>{getStatusLabel(item.status)}</Text>
                <Text style={styles.trackingDate}>
                  {new Date(item.created_at).toLocaleString('es-MX')}
                </Text>
              </View>
              {item.notes && <Text style={styles.trackingNotes}>{item.notes}</Text>}
              {item.latitude && item.longitude && (
                <Text style={styles.trackingLocation}>
                  📍 {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                </Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// 🔹 Estilos (idénticos a los tuyos)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#0066CC',
    gap: 16,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', flex: 1 },
  orderInfo: { backgroundColor: '#FFFFFF', padding: 16, marginBottom: 16 },
  orderTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 16 },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  infoLabel: { fontSize: 14, fontWeight: '600', color: '#666' },
  infoValue: { fontSize: 14, color: '#333', flex: 1 },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F2FF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    gap: 12,
  },
  locationInfo: { flex: 1 },
  locationLabel: { fontSize: 12, color: '#0066CC', fontWeight: '600', marginBottom: 4 },
  locationCoords: { fontSize: 14, color: '#333' },
  section: { backgroundColor: '#FFF', padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  noteInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  actionButtons: { flexDirection: 'row', gap: 12 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  trackingCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  trackingHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  trackingStatus: { fontSize: 14, fontWeight: '600', color: '#0066CC' },
  trackingDate: { fontSize: 12, color: '#999' },
  trackingNotes: { fontSize: 14, color: '#333', marginBottom: 8 },
  trackingLocation: { fontSize: 12, color: '#666' },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 14, color: '#999' },
});
