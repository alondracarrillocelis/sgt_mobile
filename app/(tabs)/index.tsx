import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  CheckSquare,
  User,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();

  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const dummyOrders = [
      {
        id: 1,
        title: 'Instalación de router',
        clients: { full_name: 'Carlos Martínez' },
        services: { name: 'Internet Hogar' },
        scheduled_date: '2025-10-18T10:00:00',
        status: 'pending',
      },
      {
        id: 2,
        title: 'Revisión técnica',
        clients: { full_name: 'María López' },
        services: { name: 'Mantenimiento' },
        scheduled_date: '2025-10-17T14:30:00',
        status: 'in_progress',
      },
      {
        id: 3,
        title: 'Cambio de equipo',
        clients: { full_name: 'Luis Hernández' },
        services: { name: 'Fibra Óptica' },
        scheduled_date: '2025-10-15T09:00:00',
        status: 'completed',
      },
    ];

    const dummyTasks = [
      {
        id: 1,
        title: 'Seguimiento post-instalación',
        client_name: 'Carlos López',
        date_: '2025-10-20',
        start_time: '10:00:00',
        status_: 'pendiente',
      },
      {
        id: 2,
        title: 'Cotización de ampliación de red',
        client_name: 'María Gómez',
        date_: '2025-10-21',
        start_time: '14:00:00',
        status_: 'pendiente',
      },
    ];

    const pending = dummyOrders.filter(o => o.status === 'pending').length;
    const inProgress = dummyOrders.filter(o => o.status === 'in_progress').length;
    const completed = dummyOrders.filter(o => o.status === 'completed').length;

    setStats({
      pending,
      inProgress,
      completed,
      total: dummyOrders.length,
    });

    setRecentOrders(dummyOrders);
    setPendingTasks(dummyTasks);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFB300';
      case 'in_progress':
        return '#3C8BF2';
      case 'completed':
        return '#4CAF50';
      default:
        return '#999';
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
      default:
        return status;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.backgroundBlue} />
      <View style={styles.backgroundYellow} />

      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.greeting}>Hola, user</Text>
          <Text style={styles.subtitle}>Aquí está tu resumen de hoy</Text>
        </View>

        <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/profile')}>
          <User color="#fff" size={28} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Resumen General</Text>

        <View style={styles.summaryRow}>
          <View style={[styles.dot, { backgroundColor: '#FFB300' }]} />
          <Text style={styles.summaryText}>{stats.pending} Órdenes Pendientes</Text>
        </View>
        <View style={styles.separator} />

        <View style={styles.summaryRow}>
          <View style={[styles.dot, { backgroundColor: '#3C8BF2' }]} />
          <Text style={styles.summaryText}>{stats.inProgress} Órdenes en Progreso</Text>
        </View>
        <View style={styles.separator} />

        <View style={styles.summaryRow}>
          <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.summaryText}>{stats.completed} Órdenes Completadas</Text>
        </View>
        <View style={styles.separator} />

        <View style={styles.summaryRow}>
          <View style={[styles.dot, { backgroundColor: '#999' }]} />
          <Text style={styles.summaryText}>{stats.total} Total de Órdenes</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Órdenes Recientes</Text>
        {recentOrders.map(order => (
          <TouchableOpacity key={order.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{order.title}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) },
                ]}
              >
                <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
              </View>
            </View>
            <Text style={styles.cardSub}>{order.clients.full_name}</Text>
            <Text style={styles.cardSubBlue}>{order.services.name}</Text>
            <Text style={styles.cardDate}>
              {new Date(order.scheduled_date).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tareas Pendientes</Text>
        {pendingTasks.map(task => (
          <TouchableOpacity key={task.id} style={styles.card}>
            <View style={styles.taskHeader}>
              <Clock size={20} color="#000" />
              <Text style={styles.taskTitle}>{task.title}</Text>
            </View>
            <Text style={styles.cardSub}>Cliente: {task.client_name}</Text>
            <Text style={styles.cardDate}>
              {new Date(task.date_).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}{' '}
              • {task.start_time.slice(0, 5)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
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
  greeting: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  subtitle: { fontSize: 13, color: '#555', fontStyle: 'italic' },
  headerIcon: {
    backgroundColor: '#3C8BF2',
    width: 55,
    height: 55,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 3,
    elevation: 4,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    marginHorizontal: 25,
    marginTop: 30,
    paddingVertical: 20,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 12 },
  summaryText: { fontSize: 15, color: '#1A1A1A', fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#E5E5E5', marginVertical: 8 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 14 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  cardSub: { fontSize: 14, color: '#666' },
  cardSubBlue: { fontSize: 14, color: '#0066CC', marginBottom: 4 },
  cardDate: { fontSize: 12, color: '#999' },
  taskHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
});
