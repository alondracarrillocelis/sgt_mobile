import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { ClipboardList, CheckCircle, Clock, AlertCircle } from 'lucide-react-native';
// import { useAuth } from '@/contexts/AuthContext';

export default function DashboardScreen() {
  // const { user } = useAuth();
  const [profile, setProfile] = useState<any>({ full_name: 'Juan Pérez' });
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // 🔹 Simulación local (dummy data)
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

    setRecentOrders(dummyOrders);

    const pending = dummyOrders.filter(o => o.status === 'pending').length;
    const inProgress = dummyOrders.filter(o => o.status === 'in_progress').length;
    const completed = dummyOrders.filter(o => o.status === 'completed').length;

    setStats({
      pending,
      inProgress,
      completed,
      total: dummyOrders.length,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {profile?.full_name || 'Usuario'}</Text>
        <Text style={styles.subtitle}>Aquí está tu resumen de hoy</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#FFF5E6' }]}>
          <Clock size={24} color="#FFA500" />
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#E6F2FF' }]}>
          <AlertCircle size={24} color="#0066CC" />
          <Text style={styles.statNumber}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>En Progreso</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#E6FFE6' }]}>
          <CheckCircle size={24} color="#00AA00" />
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completadas</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#F5F5F5' }]}>
          <ClipboardList size={24} color="#666666" />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Órdenes Recientes</Text>

        {recentOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <ClipboardList size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No hay órdenes recientes</Text>
          </View>
        ) : (
          recentOrders.map((order) => (
            <TouchableOpacity key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderTitle}>{order.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
                </View>
              </View>
              <Text style={styles.orderClient}>{order.clients?.full_name}</Text>
              <Text style={styles.orderService}>{order.services?.name}</Text>
              <Text style={styles.orderDate}>
                {new Date(order.scheduled_date).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#0066CC',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
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
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999999',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 16,
  },
});

