import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { X, Clock, Calendar, Filter, Search, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Task {
  id_task: number;
  title: string;
  client_name: string;
  description_: string;
  date_: string;
  start_time: string;
  end_time: string;
  assigned_name: string;
  status_: 'pendiente' | 'en_progreso' | 'completada';
  started_at?: number;
  elapsed_time?: number;
}

export default function TasksScreen() {
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id_task: 1,
      title: 'Seguimiento post-instalación',
      client_name: 'Carlos López',
      description_: 'Verificar funcionamiento del servicio de fibra óptica instalado.',
      date_: '2025-10-20',
      start_time: '10:00',
      end_time: '11:00',
      assigned_name: 'Juan Pérez',
      status_: 'pendiente',
    },
    {
      id_task: 2,
      title: 'Cotización de ampliación de red',
      client_name: 'María Gómez',
      description_: 'Evaluar ampliación de red y preparar cotización detallada.',
      date_: '2025-10-21',
      start_time: '14:00',
      end_time: '16:00',
      assigned_name: 'Ana Martínez',
      status_: 'pendiente',
    },
  ]);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todas' | 'pendiente' | 'en_progreso' | 'completada'>('todas');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const filtered = tasks.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.client_name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'todas' || t.status_ === filter;
    return matchesSearch && matchesFilter;
  });

  const startTask = (task: Task) => {
    if (activeTaskId && activeTaskId !== task.id_task) {
      Alert.alert('Aviso', 'Solo puedes tener una tarea en progreso a la vez.');
      return;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);

    setActiveTaskId(task.id_task);
    const updated: Task = { ...task, status_: 'en_progreso', started_at: Date.now(), elapsed_time: 0 };

    setTasks(prev => prev.map(t => (t.id_task === task.id_task ? updated : t)));
    setSelectedTask(updated);

    intervalRef.current = setInterval(() => {
      setTasks(prev =>
        prev.map(t =>
          t.id_task === task.id_task ? { ...t, elapsed_time: (t.elapsed_time || 0) + 1 } : t
        )
      );
      setSelectedTask(prev =>
        prev ? { ...prev, elapsed_time: (prev.elapsed_time || 0) + 1 } : prev
      );
    }, 1000);
  };

  const completeTask = (task: Task) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveTaskId(null);

    const updated: Task = { ...task, status_: 'completada' };
    setTasks(prev => prev.map(t => (t.id_task === task.id_task ? updated : t)));
    setSelectedTask(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.blueCircle} />
      <View style={styles.yellowCircle} />

      <View style={styles.headerWrapper}>
        <View style={styles.headerBubble}>
          <Text style={styles.headerTitle}>Tareas</Text>
          <Text style={styles.headerSubtitle}>Administra tus actividades</Text>
        </View>
        <TouchableOpacity style={styles.profileCircle} onPress={() => router.push('/profile')}>
          <User size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.filterLabel}>Filtrar</Text>

      <View style={styles.searchSection}>
        <Search size={18} color="#999" />
        <TextInput
          placeholder="Buscar tareas..."
          placeholderTextColor="#222222"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.filterScrollContainer}>
        <FlatList
          horizontal
          data={['todas', 'pendiente', 'en_progreso', 'completada']}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterButton, filter === item && styles.activeFilter]}
              onPress={() => setFilter(item as any)}
            >
              <Text style={[styles.filterText, filter === item && styles.activeFilterText]}>
                {item === 'en_progreso' ? 'En progreso' : item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id_task.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Filter size={46} color="#bbb" />
            <Text style={styles.emptyText}>No hay tareas registradas</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              {
                borderLeftColor:
                  item.status_ === 'completada'
                    ? '#4CAF50'
                    : item.status_ === 'en_progreso'
                    ? '#FFD84A'
                    : '#ccc',
              },
            ]}
            onPress={() => {
              setSelectedTask(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardClient}>{item.client_name}</Text>
            <Text style={styles.cardDescription}>{item.description_}</Text>
            <View style={styles.cardFooter}>
              <View style={styles.dateRow}>
                <Calendar size={14} color="#666" />
                <Text style={styles.cardDate}>
                  {item.date_}  {item.start_time} - {item.end_time}
                </Text>
              </View>
              {item.status_ === 'en_progreso' && item.elapsed_time !== undefined && (
                <View style={styles.timerChip}>
                  <Clock size={14} color="#FFD84A" />
                  <Text style={styles.timerText}>{formatTime(item.elapsed_time)}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      {selectedTask && (
        <Modal visible={modalVisible} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedTask.title}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color="#222" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalClient}>{selectedTask.client_name}</Text>
                <Text style={styles.modalDescription}>{selectedTask.description_}</Text>

                <View style={styles.timeInfo}>
                  <Clock size={22} color="#000" />
                  <Text style={styles.timeText}>{formatTime(selectedTask.elapsed_time || 0)}</Text>
                </View>

                <View style={styles.modalButtons}>
                  {selectedTask.status_ !== 'completada' ? (
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        { backgroundColor: selectedTask.status_ === 'en_progreso' ? '#4CAF50' : '#FFD84A' },
                      ]}
                      onPress={() =>
                        selectedTask.status_ === 'en_progreso'
                          ? completeTask(selectedTask)
                          : startTask(selectedTask)
                      }
                    >
                      <Text style={styles.actionText}>
                        {selectedTask.status_ === 'en_progreso' ? 'COMPLETADA' : 'COMENZAR'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.completedText}>
                      Tarea completada ({formatTime(selectedTask.elapsed_time || 0)})
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  blueCircle: {
    position: 'absolute',
    top: -200,
    left: -100,
    width: 800,
    height: 500,
    borderRadius: 400,
    backgroundColor: '#246AB8',
  },
  yellowCircle: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#FFD84A',
  },
  headerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  headerBubble: {
    backgroundColor: '#D1E4FA',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A' },
  headerSubtitle: { fontSize: 14, fontStyle: 'italic', color: '#444' },
  profileCircle: {
    width: 55,
    height: 55,
    backgroundColor: '#3C8BF2',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 3,
    elevation: 4,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 28,
    marginTop: 20,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 24,
    marginTop: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 10, marginLeft: 8 },
  filterScrollContainer: { marginTop: 16, paddingLeft: 20 },
  filterList: { flexDirection: 'row', gap: 10, paddingRight: 20 },
  filterButton: {
    backgroundColor: '#F1F1F1',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  activeFilter: { backgroundColor: '#3C8BF2' },
  filterText: { color: '#555', fontWeight: '600', fontSize: 13 },
  activeFilterText: { color: '#FFF' },
  list: { padding: 20 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
  cardClient: { fontSize: 14, color: '#666', marginBottom: 4 },
  cardDescription: { fontSize: 13, color: '#888', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardDate: { fontSize: 13, color: '#666' },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 6,
    borderRadius: 12,
    gap: 4,
  },
  timerText: { fontSize: 12, color: '#000', fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#777', marginTop: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '88%',
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 26,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalBody: { alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  modalClient: { fontSize: 16, color: '#666', marginBottom: 12 },
  modalDescription: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 },
  timeInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  timeText: { fontSize: 26, fontWeight: '700', color: '#000' },
  modalButtons: { flexDirection: 'row', justifyContent: 'center', gap: 14 },
  actionBtn: {
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  actionText: { color: '#FFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  completedText: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
});