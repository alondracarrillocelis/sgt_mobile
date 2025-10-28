import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin } from 'lucide-react-native';

export default function CalendarScreen() {
  // const { user } = useAuth(); // 🔸 Ya no usamos autenticación
  const [currentDate, setCurrentDate] = useState(new Date());
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // 🔹 Dummy data para simular órdenes
  const dummyOrders = [
    {
      id: 1,
      title: 'Instalación de paneles solares',
      client_name: 'Juan Pérez',
      service_name: 'Instalación solar básica',
      address: 'Calle Falsa 123, Ciudad Solar',
      scheduled_date: new Date().toISOString(),
      status: 'pending',
    },
    {
      id: 2,
      title: 'Mantenimiento general',
      client_name: 'María López',
      service_name: 'Revisión anual',
      address: 'Av. del Sol 45, Centro',
      scheduled_date: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() + 2
      ).toISOString(),
      status: 'in_progress',
    },
    {
      id: 3,
      title: 'Revisión de sistema',
      client_name: 'Carlos García',
      service_name: 'Chequeo técnico',
      address: 'Calle Luna 77, Norte',
      scheduled_date: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() + 5
      ).toISOString(),
      status: 'completed',
    },
  ];

  useEffect(() => {
    loadOrders();
  }, [currentDate]);

  // 🔹 Simulación de carga de órdenes (sin fetch)
  const loadOrders = async () => {
    // if (!user) return; // 🔸 ya no se necesita
    // Simula un pequeño retraso
    await new Promise((res) => setTimeout(res, 500));
    setOrders(dummyOrders);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const getOrdersForDate = (date: Date) =>
    orders.filter((order) => {
      const orderDate = new Date(order.scheduled_date);
      return (
        orderDate.getDate() === date.getDate() &&
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getFullYear() === date.getFullYear()
      );
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'in_progress': return '#0066CC';
      case 'completed': return '#00AA00';
      case 'cancelled': return '#CC0000';
      default: return '#999999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const previousMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSameDate = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const days = getDaysInMonth();
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const selectedOrders = getOrdersForDate(selectedDate);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={previousMonth} style={styles.navButton}>
          <ChevronLeft size={24} color="#0066CC" />
        </TouchableOpacity>

        <Text style={styles.monthYear}>
          {currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
        </Text>

        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <ChevronRight size={24} color="#0066CC" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendar}>
        <View style={styles.dayNamesRow}>
          {dayNames.map((day) => (
            <View key={day} style={styles.dayNameCell}>
              <Text style={styles.dayName}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {days.map((day, index) => {
            if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;

            const dayOrders = getOrdersForDate(day);
            const hasOrders = dayOrders.length > 0;

            return (
              <TouchableOpacity
                key={day.toISOString()}
                style={[
                  styles.dayCell,
                  isToday(day) && styles.todayCell,
                  isSameDate(day, selectedDate) && styles.selectedCell,
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    isToday(day) && styles.todayText,
                    isSameDate(day, selectedDate) && styles.selectedText,
                  ]}
                >
                  {day.getDate()}
                </Text>
                {hasOrders && (
                  <View style={styles.dotContainer}>
                    {dayOrders.slice(0, 3).map((order, idx) => (
                      <View
                        key={idx}
                        style={[styles.dot, { backgroundColor: getStatusColor(order.status) }]}
                      />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.selectedDateSection}>
        <View style={styles.selectedDateHeader}>
          <CalendarIcon size={20} color="#0066CC" />
          <Text style={styles.selectedDateText}>
            {selectedDate.toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {selectedOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay trabajos programados para este día</Text>
          </View>
        ) : (
          selectedOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderTitle}>{order.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
                </View>
              </View>

              <Text style={styles.orderClient}>{order.client_name}</Text>
              <Text style={styles.orderService}>{order.service_name}</Text>

              <View style={styles.orderLocation}>
                <MapPin size={14} color="#666666" />
                <Text style={styles.orderLocationText}>{order.address}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
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
  },
  navButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  monthYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textTransform: 'capitalize',
  },
  calendar: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayNamesRow: { flexDirection: 'row', marginBottom: 8 },
  dayNameCell: { flex: 1, alignItems: 'center' },
  dayName: { fontSize: 12, fontWeight: '600', color: '#999999' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  todayCell: { backgroundColor: '#E6F2FF', borderRadius: 8 },
  selectedCell: { backgroundColor: '#0066CC', borderRadius: 8 },
  dayNumber: { fontSize: 14, color: '#333' },
  todayText: { color: '#0066CC', fontWeight: 'bold' },
  selectedText: { color: '#FFF', fontWeight: 'bold' },
  dotContainer: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  selectedDateSection: { padding: 16 },
  selectedDateHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  selectedDateText: { fontSize: 16, fontWeight: '600', color: '#333', textTransform: 'capitalize' },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 14, color: '#999' },
  orderCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderTitle: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  orderClient: { fontSize: 14, color: '#666', marginBottom: 4 },
  orderService: { fontSize: 14, color: '#0066CC', marginBottom: 8 },
  orderLocation: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderLocationText: { fontSize: 13, color: '#666' },
});
