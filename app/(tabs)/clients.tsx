import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import {
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  X,
  Building,
  MessageCircle,
  Filter,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getClients } from '../api/api';

import stylesHeader from '../styles/header';
import stylesText from '../styles/texts';
import stylesModal from '../styles/modal';
import stylesBackground from '../styles/background';
import stylesContainers from '../styles/containers';

export default function ClientsScreen() {
  const router = useRouter();

  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState<string | null>(null);

  // Filtros avanzados
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string | null>(null);
  const [contactFilter, setContactFilter] = useState<string | null>(null);
  const [groupMode, setGroupMode] = useState<'none' | 'city' | 'initial'>('none');

  const [refreshing, setRefreshing] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  // modales
  const [modalVisible, setModalVisible] = useState(false);
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [clients, searchQuery, cityFilter, businessTypeFilter, contactFilter]);

  const loadClients = async () => {
    try {
      const data = await getClients();
      if (data) setClients(data);
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  /* ---------------------- FILTROS ---------------------- */
  const applyFilters = () => {
    let temp = [...clients];

    // Buscador general
    const q = searchQuery.toLowerCase();
    if (q.trim()) {
      temp = temp.filter(
        c =>
          c.trade_name?.toLowerCase().includes(q) ||
          c.contact_name?.toLowerCase().includes(q) ||
          c.phone_or_cell?.includes(q) ||
          c.city?.toLowerCase().includes(q)
      );
    }

    // Filtro rápido por CIUDAD
    if (cityFilter) temp = temp.filter(c => c.city === cityFilter);

    // Filtros avanzados
    if (businessTypeFilter) temp = temp.filter(c => c.business_type === businessTypeFilter);
    if (contactFilter) temp = temp.filter(c => c.contact_name === contactFilter);

    setFilteredClients(temp);
  };

  /* ---------------------- AGRUPACIÓN ---------------------- */
  const groupedData = useMemo(() => {
    if (groupMode === 'none')
      return [{ title: 'Clientes', data: filteredClients }];

    if (groupMode === 'city') {
      const groups: Record<string, any[]> = {};

      filteredClients.forEach(c => {
        const city = c.city || 'Sin ciudad';
        if (!groups[city]) groups[city] = [];
        groups[city].push(c);
      });

      return Object.entries(groups).map(([city, list]) => ({
        title: city,
        data: list,
      }));
    }

    if (groupMode === 'initial') {
      const groups: Record<string, any[]> = {};

      filteredClients.forEach(c => {
        const letter = (c.trade_name?.[0] || '?').toUpperCase();
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(c);
      });

      return Object.entries(groups).map(([letter, list]) => ({
        title: letter,
        data: list,
      }));
    }

    return [];
  }, [filteredClients, groupMode]);

  /* ---------------------- MODAL CLIENTE ---------------------- */
  const openClientModal = (client: any) => {
    setSelectedClient(client);
    setModalVisible(true);
  };

  /* ---------------------- ACCIONES RÁPIDAS ---------------------- */
  const callPhone = (num: string) => Linking.openURL(`tel:${num}`);
  const sendWhatsApp = (num: string) =>
    Linking.openURL(`https://wa.me/${num.replace(/\D/g, '')}`);
  const sendEmail = (mail: string) =>
    Linking.openURL(`mailto:${mail}`);

  /* ---------------------- RENDER CLIENTE ---------------------- */
  const renderClient = ({ item }: any) => (
    <TouchableOpacity style={styles.clientCard} onPress={() => openClientModal(item)}>
      <View style={styles.iconCircle}>
        <Building color="#fff" size={26} />
      </View>
      <View style={stylesText.clientInfo}>
        <Text style={stylesText.clientName}>{item.trade_name}</Text>
        <Text style={stylesText.clientText}>{item.contact_name}</Text>
        <Text style={stylesText.clientText}>{item.phone_or_cell}</Text>
      </View>
      <Text style={stylesText.clientArrow}>›</Text>
    </TouchableOpacity>
  );

  /* =============================================================
     ======================== UI ================================
     ============================================================= */

  return (
    <View style={styles.container}>
      {/* Manteniendo tu diseño ORIGINAL */}
      <View style={stylesBackground.backgroundBlue} />
      <View style={stylesBackground.backgroundYellow} />

      <View style={stylesHeader.header}>
        <View style={stylesHeader.headerBadge}>
          <Text style={stylesText.title}>Clientes</Text>
          <Text style={stylesText.subtitle}>Consulta tus clientes</Text>
        </View>
        <TouchableOpacity style={stylesHeader.headerIcon} onPress={() => router.push('/profile')}>
          <User color="#fff" size={28} />
        </TouchableOpacity>
      </View>

      {/* ---------------------- BUSCADOR ---------------------- */}
      <Text style={stylesText.filterLabel}>Filtrar</Text>

      <View style={stylesContainers.searchContainer}>
        <Search size={20} color="#999" />
        <TextInput
          style={stylesText.searchInput}
          placeholder="Buscar clientes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* ---------------------- FILTROS ---------------------- */}
      <View style={styles.filtersSection}>
        {/* Filtro rápido por ciudad */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
          <TouchableOpacity
            style={[
              styles.statusChip,
              !cityFilter
                ? {
                    backgroundColor: "#3C8BF2",
                    borderColor: "#3C8BF2",
                  }
                : {
                    backgroundColor: "#F5F5F5",
                    borderColor: "#E0E0E0",
                  },
            ]}
            onPress={() => setCityFilter(null)}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: !cityFilter ? "#FFF" : "#3C8BF2",
                },
              ]}
            />
            <Text
              style={[
                styles.statusChipText,
                !cityFilter ? { color: "#FFF" } : { color: "#333" },
              ]}
            >
              Todas las ciudades
            </Text>
          </TouchableOpacity>

          {[...new Set(clients.map(c => c.city))].map(city => (
            <TouchableOpacity
              key={city}
              style={[
                styles.statusChip,
                cityFilter === city
                  ? {
                      backgroundColor: "#3C8BF2",
                      borderColor: "#3C8BF2",
                    }
                  : {
                      backgroundColor: "#F5F5F5",
                      borderColor: "#E0E0E0",
                    },
              ]}
              onPress={() => setCityFilter(city)}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: cityFilter === city ? "#FFF" : "#3C8BF2",
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusChipText,
                  cityFilter === city ? { color: "#FFF" } : { color: "#333" },
                ]}
              >
                {city}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Botón filtros avanzados */}
        <TouchableOpacity
          style={styles.filtersButton}
          onPress={() => setFiltersModalVisible(true)}
        >
          <Filter size={20} color="#fff" />
          <Text style={styles.filtersButtonText}>Filtros avanzados</Text>
        </TouchableOpacity>
      </View>

      {/* ---------------------- LISTA (SECCIONADA) ---------------------- */}
      <SectionList
        sections={groupedData}
        keyExtractor={item => item.id_client.toString()}
        renderItem={renderClient}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
      />

      {/* =============================================================
          ===================== MODAL CLIENTE =======================
          ============================================================= */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={stylesModal.modalOverlay}>
          <View style={stylesModal.modalContent}>
            <View style={stylesModal.modalHeader}>
              <Text style={stylesText.modalTitle}>Detalles del cliente</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* -------- ACCIONES RÁPIDAS GRANDES ---------- */}
            {selectedClient && (
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => callPhone(selectedClient.phone_or_cell)}
                >
                  <Phone size={26} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#25D366' }]}
                  onPress={() => sendWhatsApp(selectedClient.phone_or_cell)}
                >
                  <MessageCircle size={26} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#D93025' }]}
                  onPress={() => sendEmail(selectedClient.email)}
                >
                  <Mail size={26} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* DATOS */}
            {selectedClient && (
              <ScrollView>
                <View style={stylesModal.modalSection}>
                  <Text style={stylesText.modalLabel}>Nombre comercial</Text>
                  <Text style={stylesText.modalValue}>{selectedClient.trade_name}</Text>

                  <Text style={stylesText.modalLabel}>Giro</Text>
                  <Text style={stylesText.modalValue}>{selectedClient.business_type}</Text>

                  <Text style={stylesText.modalLabel}>Contacto</Text>
                  <Text style={stylesText.modalValue}>{selectedClient.contact_name}</Text>

                  <Text style={stylesText.modalLabel}>Dirección</Text>
                  <View style={stylesModal.modalRow}>
                    <MapPin size={18} color="#555" />
                    <Text style={stylesText.modalValue}>
                      {`${selectedClient.street} ${selectedClient.number_}, ${selectedClient.city}`}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* =============================================================
          =================== MODAL FILTROS AVANZADOS ===============
          ============================================================= */}
      <Modal visible={filtersModalVisible} transparent animationType="fade">
        <View style={stylesModal.modalOverlay}>
          <View style={[stylesModal.modalContent, stylesFilters.card]}>
            <View style={stylesModal.modalHeader}>
              <Text style={stylesText.modalTitle}>Filtros avanzados</Text>
              <TouchableOpacity onPress={() => setFiltersModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              {/* ---- Bloque: Giro ---- */}
              <Text style={stylesFilters.sectionTitle}>Giro del negocio</Text>
              <View style={stylesFilters.chipWrapper}>
                {[...new Set(clients.map(c => c.business_type))].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      stylesFilters.chip,
                      businessTypeFilter === type && stylesFilters.chipActive
                    ]}
                    onPress={() => setBusinessTypeFilter(type)}
                  >
                    <Building size={18} color={businessTypeFilter === type ? "#fff" : "#3C8BF2"} />
                    <Text
                      style={[
                        stylesFilters.chipText,
                        businessTypeFilter === type && stylesFilters.chipTextActive
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ---- Bloque: Contacto ---- */}
              <Text style={stylesFilters.sectionTitle}>Contacto</Text>
              <View style={stylesFilters.chipWrapper}>
                {[...new Set(clients.map(c => c.contact_name))].map(contact => (
                  <TouchableOpacity
                    key={contact}
                    style={[
                      stylesFilters.chip,
                      contactFilter === contact && stylesFilters.chipActive
                    ]}
                    onPress={() => setContactFilter(contact)}
                  >
                    <User size={18} color={contactFilter === contact ? "#fff" : "#3C8BF2"} />
                    <Text
                      style={[
                        stylesFilters.chipText,
                        contactFilter === contact && stylesFilters.chipTextActive
                      ]}
                    >
                      {contact}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ---- Bloque: Agrupar ---- */}
              <Text style={stylesFilters.sectionTitle}>Agrupar clientes</Text>
              <View style={stylesFilters.chipWrapper}>
                {[
                  { id: 'none', label: 'Sin agrupación' },
                  { id: 'city', label: 'Ciudad' },
                  { id: 'initial', label: 'Inicial (A-Z)' }
                ].map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      stylesFilters.chip,
                      groupMode === option.id && stylesFilters.chipActive
                    ]}
                    onPress={() => setGroupMode(option.id as any)}
                  >
                    <Filter size={18} color={groupMode === option.id ? "#fff" : "#3C8BF2"} />
                    <Text
                      style={[
                        stylesFilters.chipText,
                        groupMode === option.id && stylesFilters.chipTextActive
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

            </ScrollView>

            {/* ---- Botones ---- */}
            <View style={stylesFilters.footerButtons}>
              <TouchableOpacity
                style={stylesFilters.clearBtn}
                onPress={() => {
                  setBusinessTypeFilter(null);
                  setContactFilter(null);
                  setCityFilter(null);
                  setGroupMode('none');
                }}
              >
                <Text style={stylesFilters.clearBtnText}>Limpiar filtros</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={stylesFilters.applyBtn}
                onPress={() => setFiltersModalVisible(false)}
              >
                <Text style={stylesFilters.applyBtnText}>Aplicar</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}

/* =============================================================
   ======================== ESTILOS EXTRA =======================
   ============================================================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Filters Section
  filtersSection: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  statusFilters: {
    marginBottom: 12,
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

  filtersButton: {
    backgroundColor: '#3C8BF2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  filtersButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },

  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    color: '#444',
  },

  /* Tarjeta cliente */
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  iconCircle: {
    width: 55,
    height: 55,
    backgroundColor: '#3C8BF2',
    borderRadius: 27.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },

  /* Acciones rápidas */
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  actionBtn: {
    width: 60,
    height: 60,
    backgroundColor: '#3C8BF2',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/* =============================================================
   =============== ESTILOS FILTROS → stylesFilters ==============
   ============================================================= */

const stylesFilters = StyleSheet.create({
  card: {
    paddingBottom: 10,
    borderRadius: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    maxHeight: "80%",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 8,
    color: "#333",
  },

  chipWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#3C8BF2",
    margin: 4,
    backgroundColor: "#fff",
  },

  chipActive: {
    backgroundColor: "#3C8BF2",
    borderColor: "#3C8BF2",
  },

  chipText: {
    marginLeft: 6,
    color: "#3C8BF2",
    fontWeight: "600",
  },

  chipTextActive: {
    color: "#fff",
  },

  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingBottom: 10,
  },

  clearBtn: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 14,
  },

  clearBtnText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#444",
  },

  applyBtn: {
    flex: 1,
    backgroundColor: "#3C8BF2",
    padding: 14,
    borderRadius: 14,
  },

  applyBtnText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
