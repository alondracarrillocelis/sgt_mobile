import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet, ScrollView, TextInput } from 'react-native';
import { X, Calendar, CheckCircle2, Clock, AlertCircle, Search, Filter } from 'lucide-react-native';

interface Task {
  id_task: number;
  title: string;
  client_id: number;
  client_name: string;
  description_: string;
  date_: string;
  start_time: string;
  end_time: string;
  assigned_to: number;
  assigned_name: string;
  status_: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  started_at?: number; // timestamp cuando se inició la tarea
}

const TasksScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id_task: 1,
      title: 'Seguimiento post-instalación',
      client_id: 1,
      client_name: 'Carlos López',
      description_: 'Verificar funcionamiento del servicio de fibra óptica instalado la semana pasada. Confirmar velocidades y resolver cualquier duda del cliente.',
      date_: '2025-10-20',
      start_time: '10:00:00',
      end_time: '11:00:00',
      assigned_to: 1,
      assigned_name: 'Juan Pérez',
      status_: 'pendiente',
    },
    {
      id_task: 2,
      title: 'Cotización de ampliación de red',
      client_id: 2,
      client_name: 'María Gómez',
      description_: 'Visitar instalaciones para evaluar ampliación de puntos de red en segunda planta. Preparar cotización detallada.',
      date_: '2025-10-21',
      start_time: '14:00:00',
      end_time: '16:00:00',
      assigned_to: 2,
      assigned_name: 'Ana Martínez',
      status_: 'en_progreso',
      started_at: Date.now() - 1800000, // Iniciada hace 30 minutos
    },
    {
      id_task: 3,
      title: 'Capacitación uso de sistema',
      client_id: 1,
      client_name: 'Carlos López',
      description_: 'Capacitar al personal del cliente en el uso del panel de administración y configuración básica de equipos.',
      date_: '2025-10-17',
      start_time: '09:00:00',
      end_time: '12:00:00',
      assigned_to: 1,
      assigned_name: 'Juan Pérez',
      status_: 'completada',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Task['status_']>('all');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Temporizador para tareas en progreso
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedTask?.status_ === 'en_progreso' && selectedTask.started_at) {
        const elapsed = Math.floor((Date.now() - selectedTask.started_at) / 1000);
        setElapsedTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedTask]);

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
    if (task.status_ === 'en_progreso' && task.started_at) {
      const elapsed = Math.floor((Date.now() - task.started_at) / 1000);
      setElapsedTime(elapsed);
    }
  };

  const handleStartTask = () => {
    if (selectedTask) {
      const updatedTask = {
        ...selectedTask,
        status_: 'en_progreso' as Task['status_'],
        started_at: Date.now()
      };
      setTasks(tasks.map(task =>
        task.id_task === selectedTask.id_task ? updatedTask : task
      ));
      setSelectedTask(updatedTask);
      setElapsedTime(0);
    }
  };

  const handleCompleteTask = () => {
    if (selectedTask) {
      const updatedTask = {
        ...selectedTask,
        status_: 'completada' as Task['status_']
      };
      setTasks(tasks.map(task =>
        task.id_task === selectedTask.id_task ? updatedTask : task
      ));
      setSelectedTask(updatedTask);
      setModalVisible(false);
    }
  };

  const handleCancelTask = () => {
    if (selectedTask) {
      const updatedTask = {
        ...selectedTask,
        status_: 'cancelada' as Task['status_']
      };
      setTasks(tasks.map(task =>
        task.id_task === selectedTask.id_task ? updatedTask : task
      ));
      setSelectedTask(updatedTask);
      setModalVisible(false);
    }
  };

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtrar y buscar tareas
  const filteredTasks = tasks.filter(task => {
    // Filtro por estado
    const statusMatch = filterStatus === 'all' || task.status_ === filterStatus;

    // Búsqueda por texto
    const searchLower = searchQuery.toLowerCase();
    const searchMatch = searchQuery === '' ||
      task.title.toLowerCase().includes(searchLower) ||
      task.client_name.toLowerCase().includes(searchLower) ||
      task.description_.toLowerCase().includes(searchLower);

    return statusMatch && searchMatch;
  });

  // Ejemplo de conexión futura con backend:
  /*
  useEffect(() => {
    fetch('http://localhost:4000/tasks')
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error(err));
  }, []);
  */

  const getStatusColor = (status: Task['status_']) => {
    switch (status) {
      case 'completada':
        return '#4CAF50';
      case 'en_progreso':
        return '#FFB300';
      case 'cancelada':
        return '#999';
      default:
        return '#D32F2F';
    }
  };

  const getStatusIcon = (status: Task['status_']) => {
    switch (status) {
      case 'completada':
        return CheckCircle2;
      case 'en_progreso':
        return Clock;
      case 'cancelada':
        return X;
      default:
        return AlertCircle;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tareas</Text>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tareas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'all' && styles.filterButtonTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'pendiente' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('pendiente')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'pendiente' && styles.filterButtonTextActive]}>
            Pendientes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'en_progreso' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('en_progreso')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'en_progreso' && styles.filterButtonTextActive]}>
            En Progreso
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'completada' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('completada')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'completada' && styles.filterButtonTextActive]}>
            Completadas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'cancelada' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('cancelada')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'cancelada' && styles.filterButtonTextActive]}>
            Canceladas
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Lista */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id_task.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const StatusIcon = getStatusIcon(item.status_);
          return (
            <TouchableOpacity style={styles.taskCard} onPress={() => handleTaskPress(item)}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status_) },
                  ]}
                >
                  <StatusIcon size={12} color="#FFF" />
                  <Text style={styles.statusText}>{item.status_}</Text>
                </View>
              </View>

              <Text style={styles.taskClient}>👤 Cliente: {item.client_name}</Text>
              <Text style={styles.taskAssigned}>👨‍🔧 Asignado a: {item.assigned_name}</Text>

              <View style={styles.taskInfo}>
                <Calendar color="#666" size={14} />
                <Text style={styles.taskInfoText}>{item.date_} • {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}</Text>
              </View>

              <Text style={styles.taskDescription} numberOfLines={2}>
                {item.description_}
              </Text>

              {/* Mostrar tiempo transcurrido si está en progreso */}
              {item.status_ === 'en_progreso' && item.started_at && (
                <View style={styles.timerBadge}>
                  <Clock size={14} color="#FFB300" />
                  <Text style={styles.timerText}>
                    En curso: {formatElapsedTime(Math.floor((Date.now() - item.started_at) / 1000))}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Filter size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No se encontraron tareas</Text>
          </View>
        }
      />

      {/* Modal detalle */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle de Tarea #{selectedTask?.id_task}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.detailTitle}>{selectedTask.title}</Text>

                {/* Temporizador en progreso */}
                {selectedTask.status_ === 'en_progreso' && selectedTask.started_at && (
                  <View style={styles.timerCard}>
                    <Clock size={32} color="#FFB300" />
                    <View style={styles.timerInfo}>
                      <Text style={styles.timerLabel}>Tiempo transcurrido</Text>
                      <Text style={styles.timerValue}>{formatElapsedTime(elapsedTime)}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📋 Información General</Text>

                  <Text style={styles.detailLabel}>Estado</Text>
                  <Text style={[styles.detailValue, {
                    color: getStatusColor(selectedTask.status_),
                    fontWeight: 'bold'
                  }]}>
                    {selectedTask.status_.toUpperCase()}
                  </Text>

                  <Text style={styles.detailLabel}>Cliente</Text>
                  <Text style={styles.detailValue}>{selectedTask.client_name}</Text>

                  <Text style={styles.detailLabel}>Asignado a</Text>
                  <Text style={styles.detailValue}>{selectedTask.assigned_name}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📅 Programación</Text>

                  <Text style={styles.detailLabel}>Fecha</Text>
                  <Text style={styles.detailValue}>{selectedTask.date_}</Text>

                  <Text style={styles.detailLabel}>Horario</Text>
                  <Text style={styles.detailValue}>
                    {selectedTask.start_time} - {selectedTask.end_time}
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📝 Descripción</Text>
                  <Text style={styles.detailValue}>{selectedTask.description_}</Text>
                </View>

                {/* Botones de acción */}
                <View style={styles.actionButtons}>
                  {selectedTask.status_ === 'pendiente' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#FFB300', flex: 1 }]}
                        onPress={handleStartTask}
                      >
                        <Clock size={18} color="#FFF" />
                        <Text style={styles.actionButtonText}>Iniciar Tarea</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#999', minWidth: 100 }]}
                        onPress={handleCancelTask}
                      >
                        <X size={18} color="#FFF" />
                        <Text style={styles.actionButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {selectedTask.status_ === 'en_progreso' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#4CAF50', flex: 1 }]}
                      onPress={handleCompleteTask}
                    >
                      <CheckCircle2 size={18} color="#FFF" />
                      <Text style={styles.actionButtonText}>Terminar Tarea</Text>
                    </TouchableOpacity>
                  )}

                  {(selectedTask.status_ === 'completada' || selectedTask.status_ === 'cancelada') && (
                    <View style={styles.infoMessage}>
                      <Text style={styles.infoMessageText}>
                        Esta tarea ya ha sido {selectedTask.status_ === 'completada' ? 'completada' : 'cancelada'}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TasksScreen;

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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
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
  taskCard: {
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  taskClient: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  taskAssigned: {
    fontSize: 14,
    color: '#0066CC',
    marginBottom: 8,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  taskInfoText: {
    fontSize: 13,
    color: '#666666',
  },
  taskDescription: {
    fontSize: 13,
    color: '#888888',
    fontStyle: 'italic',
    marginTop: 4,
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
  scrollContainer: {
    maxHeight: '80%',
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
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
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 100,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  timerText: {
    fontSize: 13,
    color: '#FFB300',
    fontWeight: '600',
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5E6',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    gap: 16,
    borderWidth: 2,
    borderColor: '#FFB300',
  },
  timerInfo: {
    flex: 1,
  },
  timerLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFB300',
    fontVariant: ['tabular-nums'],
  },
  infoMessage: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoMessageText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});