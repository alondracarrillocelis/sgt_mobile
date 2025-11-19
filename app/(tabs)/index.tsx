import { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Dimensions,
  TextInput,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import MapView, { Marker } from "react-native-maps";
import { User, MapPin, Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import { API_URL } from "../api/config";

import stylesHeader from "../styles/header";
import stylesText from "../styles/texts";
import stylesBackground from "../styles/background";
import stylesContainers from "../styles/containers";

const { width, height } = Dimensions.get("window");

/* ---------- locale español para el calendario ---------- */
LocaleConfig.locales["es"] = {
  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  monthNamesShort: [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ],
  dayNames: [
    "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
  ],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
};
LocaleConfig.defaultLocale = "es";

/* ---------- helpers ---------- */
const safeTime = (t: any): string | null => {
  if (!t) return null;
  if (typeof t !== "string") return null;
  const trimmed = t.trim();
  if (trimmed === "00:00:00" || trimmed === "") return null;
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  return null;
};

const toLocalDateKey = (isoOrDateString: string | null): string | null => {
  if (!isoOrDateString) return null;
  try {
    const d = new Date(isoOrDateString);
    if (isNaN(d.getTime())) return null;
    const YYYY = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, "0");
    const DD = String(d.getDate()).padStart(2, "0");
    return `${YYYY}-${MM}-${DD}`;
  } catch {
    return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pendiente":
      return "#FFB300";
    case "en_progreso":
      return "#3C8BF2";
    case "finalizado":
      return "#4CAF50";
    case "cancelado":
      return "#FF6B6B";
    default:
      return "#999";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pendiente":
      return "Pendiente";
    case "en_progreso":
      return "En progreso";
    case "finalizado":
      return "Finalizado";
    case "cancelado":
      return "Cancelado";
    default:
      return status;
  }
};

/* ---------- Geocodificación ---------- */
const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
  if (!address || address.trim() === "") return null;

  try {
    // Usar OpenStreetMap Nominatim (gratuito, sin API key)
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MobileApp/1.0", // Requerido por Nominatim
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

/* ---------- componente ---------- */
export default function DashboardScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [ordersOfDay, setOrdersOfDay] = useState<any[]>([]);
  const [calendarFilter, setCalendarFilter] = useState<
    "all" | "pendiente" | "en_progreso" | "finalizado" | "cancelado"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pendiente" | "en_progreso" | "finalizado" | "cancelado"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orderCoordinates, setOrderCoordinates] = useState<Record<number, { latitude: number; longitude: number }>>({});
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const coordinatesCacheRef = useRef<Record<number, { latitude: number; longitude: number }>>({});

  const [stats, setStats] = useState({
    pendiente: 0,
    en_progreso: 0,
    finalizado: 0,
    cancelado: 0,
    total: 0,
  });

  useEffect(() => {
    loadData();
  }, [calendarFilter]);

  // Filtrar órdenes cuando cambien los filtros
  useEffect(() => {
    applyFilters();
  }, [orders, searchQuery, statusFilter, selectedDate, ordersOfDay]);

  const applyFilters = () => {
    let filtered = selectedDate ? ordersOfDay : orders;

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.state_ === statusFilter);
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.client_name?.toLowerCase().includes(query) ||
          order.service_name?.toLowerCase().includes(query) ||
          order.client_address?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  // Geocodificar direcciones cuando cambien las órdenes
  useEffect(() => {
    if (orders.length === 0) return;

    const geocodeOrders = async () => {
      setGeocodingLoading(true);
      const newCoordinates: Record<number, { latitude: number; longitude: number }> = {};

      // Geocodificar solo las órdenes visibles (las primeras 10 o las del día seleccionado)
      const ordersToGeocode = selectedDate ? ordersOfDay : orders.slice(0, 10);

      // Procesar en lotes para no sobrecargar el servicio
      for (const order of ordersToGeocode) {
        if (!order.client_address) continue;

        // Verificar si ya tenemos coordenadas en cache usando ref
        if (coordinatesCacheRef.current[order.id_service_order]) {
          // Ya existe en cache, usar las coordenadas existentes
          if (!orderCoordinates[order.id_service_order]) {
            newCoordinates[order.id_service_order] = coordinatesCacheRef.current[order.id_service_order];
          }
          continue;
        }

        // Geocodificar la dirección
        const coords = await geocodeAddress(order.client_address);
        if (coords) {
          // Guardar en cache y en el estado
          coordinatesCacheRef.current[order.id_service_order] = coords;
          newCoordinates[order.id_service_order] = coords;
        }

        // Pequeña pausa para no exceder límites de rate de Nominatim (1 req/seg)
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      // Actualizar estado con todas las coordenadas nuevas
      if (Object.keys(newCoordinates).length > 0) {
        setOrderCoordinates((prev) => ({ ...prev, ...newCoordinates }));
      }
      setGeocodingLoading(false);
    };

    geocodeOrders();
  }, [orders.length, selectedDate, ordersOfDay.length]);

  const loadData = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/service-orders-full`);
      if (!res.ok) throw new Error("Error fetching orders");
      const raw = await res.json();

      // Agrupar rows por id_service_order y normalizar
      const grouped = raw.reduce((acc: any[], row: any) => {
        const id = row.id_service_order;
        const existing = acc.find((o) => o.id_service_order === id);

        // preparar producto (si hay)
        const product =
          row.id_product && row.id_product !== null
            ? {
              id_product: row.id_product,
              name: row.product_name,
              quantity: row.quantity_used,
              image_url: row.product_image || null,
            }
            : null;

        if (existing) {
          if (product) existing.products.push(product);
        } else {
          // normalizar estado en minúscula y validar
          const st = (row.state_ || "pendiente").toLowerCase();
          const stateNorm = ["pendiente", "en_progreso", "finalizado", "cancelado"].includes(st)
            ? st
            : "pendiente";

          // normalizar times (tratamos "00:00:00" como null)
          const start_time = safeTime(row.start_time);
          const end_time = safeTime(row.end_time);

          // scheduled_date: preferimos usar la fecha original pero también creamos dateKey en local
          const scheduled_raw = row.scheduled_date || null;
          const scheduled_key = toLocalDateKey(scheduled_raw); // YYYY-MM-DD local

          acc.push({
            id_service_order: id,
            client_name: row.client_name || "",
            client_address:
              `${row.client_street || ""} ${row.client_number || ""}, ${row.client_neighborhood || ""}, ${row.client_city || ""} ${row.client_state || ""} ${row.client_country || ""}`.replace(/\s+/g, " ").trim(),
            client_email: row.client_email || "",
            client_phone: row.client_phone || "",
            service_name: row.service_name || "",
            scheduled_date: scheduled_raw,
            scheduled_key,
            start_time,
            end_time,
            state_: stateNorm,
            activities: row.activities || "",
            products: product ? [product] : [],
          });
        }
        return acc;
      }, []);

      // compute stats and markedDates
      setOrders(grouped);
      computeStats(grouped);

      // Build marks applying current filter
      const filteredForMarks = calendarFilter === "all" ? grouped : grouped.filter((o) => o.state_ === calendarFilter);
      buildCalendarMarks(filteredForMarks);

      // If user had selected a date, update ordersOfDay
      if (selectedDate) {
        const daily = getOrdersForDay(selectedDate, grouped);
        setOrdersOfDay(daily);
      }
    } catch (err) {
      console.error("LoadData error:", err);
      Alert.alert("Error", "No se pudieron cargar las órdenes desde el servidor.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const computeStats = (list: any[]) => {
    const pendiente = list.filter((o) => o.state_ === "pendiente").length;
    const en_progreso = list.filter((o) => o.state_ === "en_progreso").length;
    const finalizado = list.filter((o) => o.state_ === "finalizado").length;
    const cancelado = list.filter((o) => o.state_ === "cancelado").length;
    setStats({ pendiente, en_progreso, finalizado, cancelado, total: list.length });
  };

  const buildCalendarMarks = (list: any[]) => {
    const marks: any = {};

    list.forEach((o) => {
      const key = o.scheduled_key;
      if (!key) return;

      const dotColor = getStatusColor(o.state_);
      
      if (!marks[key]) {
        marks[key] = { dots: [] };
      }

      // Asegurarnos de que dots es un array y tiene la estructura correcta
      if (!Array.isArray(marks[key].dots)) {
        marks[key].dots = [];
      }

      // Verificar si ya existe un dot para este estado
      const exists = marks[key].dots.find((d: any) => d.key === o.state_);
      if (!exists) {
        marks[key].dots.push({ 
          key: o.state_, 
          color: dotColor 
        });
      }
    });

    setMarkedDates(marks);
  };

  const onDayPress = (day: { dateString: string }): void => {
    setSelectedDate(day.dateString);
    const daily = getOrdersForDay(day.dateString, orders);
    setOrdersOfDay(daily);
  };

  const getOrdersForDay = (dateString: string, source: any[]): any[] => {
    return source
      .filter((o) => o.scheduled_key === dateString)
      .sort((a, b) => {
        const at = a.scheduled_date ? new Date(a.scheduled_date).getTime() : 0;
        const bt = b.scheduled_date ? new Date(b.scheduled_date).getTime() : 0;
        return at - bt;
      });
  };

  const openGoogleMaps = (address: string) => {
    if (!address) {
      Alert.alert("Sin dirección", "No hay dirección disponible para esta orden.");
      return;
    }
    const encoded = encodeURIComponent(address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
  };

  const openWaze = (address: string) => {
    if (!address) return;
    const encoded = encodeURIComponent(address);
    Linking.openURL(`https://waze.com/ul?q=${encoded}`);
  };

  const openAppleMaps = (address: string) => {
    if (!address) return;
    const encoded = encodeURIComponent(address);
    Linking.openURL(`maps://?q=${encoded}`);
  };

  const openOrder = (order: any) => {
    if (!order) return;
    try {
      // router.push(`/orders/${order.id_service_order}`);
    } catch (e) {
      Alert.alert("Abrir orden", `Abrir la orden ${order.id_service_order}`);
    }
  };

  const progressPercent = useMemo(() => {
    const total = stats.total || 1;
    return {
      pendiente: Math.round((stats.pendiente / total) * 100),
      en_progreso: Math.round((stats.en_progreso / total) * 100),
      finalizado: Math.round((stats.finalizado / total) * 100),
    };
  }, [stats]);

  // Preparar markedDates para el calendario de forma segura
  const safeMarkedDates = useMemo(() => {
    if (Object.keys(markedDates).length === 0) return {};
    
    const result = { ...markedDates };
    
    // Si hay una fecha seleccionada, agregar la selección
    if (selectedDate) {
      result[selectedDate] = {
        ...result[selectedDate],
        selected: true,
        selectedColor: "#0066CC",
      };
    }
    
    return result;
  }, [markedDates, selectedDate]);

  /* ---------- UI ---------- */
  if (loading) {
    return (
      <View style={[stylesContainers.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <ScrollView
      style={stylesContainers.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <View style={stylesBackground.backgroundBlue} />
      <View style={stylesBackground.backgroundYellow} />

      {/* Header */}
      <View style={stylesHeader.header}>
        <View style={stylesHeader.headerBadge}>
          <Text style={styles.greeting}>Hola, técnico</Text>
          <Text style={stylesText.subtitle}>Resumen y calendario de órdenes</Text>
        </View>

        <TouchableOpacity style={stylesHeader.headerIcon} onPress={() => router.push("/profile")}>
          <User color="#fff" size={28} />
        </TouchableOpacity>
      </View>

      {/* Bento widgets */}
      <View style={localStyles.bentoRow}>
        <TouchableOpacity style={localStyles.bentoCard}>
          <Text style={localStyles.bentoTitle}>Pendientes</Text>
          <Text style={localStyles.bentoNumber}>{stats.pendiente}</Text>
          <View style={localStyles.progressBarBg}>
            <View style={[localStyles.progressFill, { width: `${progressPercent.pendiente}%`, backgroundColor: getStatusColor("pendiente") }]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={localStyles.bentoCard}>
          <Text style={localStyles.bentoTitle}>En progreso</Text>
          <Text style={localStyles.bentoNumber}>{stats.en_progreso}</Text>
          <View style={localStyles.progressBarBg}>
            <View style={[localStyles.progressFill, { width: `${progressPercent.en_progreso}%`, backgroundColor: getStatusColor("en_progreso") }]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={localStyles.bentoCard}>
          <Text style={localStyles.bentoTitle}>Finalizadas</Text>
          <Text style={localStyles.bentoNumber}>{stats.finalizado}</Text>
          <View style={localStyles.progressBarBg}>
            <View style={[localStyles.progressFill, { width: `${progressPercent.finalizado}%`, backgroundColor: getStatusColor("finalizado") }]} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Calendar Card */}
      <View style={styles.calendarCard}>
        <Text style={stylesText.sectionTitle}>Calendario de Órdenes</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12, marginTop: 8 }}>
          <View style={{ flexDirection: "row", paddingHorizontal: 4 }}>
            {["all", "pendiente", "en_progreso", "finalizado", "cancelado"].map((filter) => (
              <TouchableOpacity 
                key={filter}
                style={[
                  localStyles.chip, 
                  calendarFilter === filter ? { backgroundColor: "#3C8BF2" } : { backgroundColor: "#EEE" }
                ]} 
                onPress={() => setCalendarFilter(filter as any)}
              >
                <Text style={[
                  localStyles.chipText, 
                  calendarFilter === filter ? { color: "#FFF" } : { color: "#333" }
                ]}>
                  {filter === "all" ? "Todos" : 
                   filter === "pendiente" ? "Pendiente" :
                   filter === "en_progreso" ? "En progreso" :
                   filter === "finalizado" ? "Finalizado" : "Cancelado"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* CALENDAR CON DATOS SEGUROS */}
        <Calendar
          markingType={"multi-dot"}
          markedDates={safeMarkedDates}
          onDayPress={onDayPress}
          theme={{
            todayTextColor: "#3C8BF2",
            selectedDayBackgroundColor: "#3C8BF2",
            arrowColor: "#3C8BF2",
            monthTextColor: "#000",
            textDayFontWeight: "500",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "500",
          }}
        />
      </View>

      {/* Filters Section */}
      <View style={styles.filtersSection}>
        <Text style={stylesText.filterLabel}>Filtrar</Text>
        
        {/* Search Bar */}
        <View style={stylesContainers.searchContainer}>
          <Search size={20} color="#999" />
          <TextInput
            style={stylesText.searchInput}
            placeholder="Buscar órdenes..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Status Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
          {["all", "pendiente", "en_progreso", "finalizado", "cancelado"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                localStyles.statusChip,
                statusFilter === status
                  ? {
                      backgroundColor: getStatusColor(status === "all" ? "" : status),
                      borderColor: getStatusColor(status === "all" ? "#3C8BF2" : status),
                    }
                  : {
                      backgroundColor: "#F5F5F5",
                      borderColor: "#E0E0E0",
                    },
              ]}
              onPress={() => setStatusFilter(status as any)}
            >
              <View
                style={[
                  localStyles.statusDot,
                  {
                    backgroundColor:
                      status === "all"
                        ? "#3C8BF2"
                        : getStatusColor(status),
                  },
                ]}
              />
              <Text
                style={[
                  localStyles.statusChipText,
                  statusFilter === status ? { color: "#FFF" } : { color: "#333" },
                ]}
              >
                {status === "all"
                  ? "Todas"
                  : status === "pendiente"
                  ? "Pendiente"
                  : status === "en_progreso"
                  ? "En progreso"
                  : status === "finalizado"
                  ? "Finalizado"
                  : "Cancelado"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders list: selected day or upcoming */}
      <View style={styles.section}>
        <Text style={stylesText.sectionTitle}>
          {selectedDate ? `Órdenes - ${selectedDate}` : "Próximas Órdenes"}
        </Text>

        {(filteredOrders.length === 0) ? (
          <Text style={{ color: "#777", marginTop: 8 }}>No hay órdenes para mostrar.</Text>
        ) : (
          filteredOrders.slice(0, 20).map((order) => (
            <TouchableOpacity key={order.id_service_order} style={styles.card} onPress={() => openOrder(order)}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{order.service_name || "Servicio"}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.state_) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(order.state_)}</Text>
                </View>
              </View>

              <Text style={styles.cardSub}>{order.client_name}</Text>
              <Text style={styles.cardSubBlue}>
                {order.client_address ? order.client_address.split(",")[2] || order.client_address : ""}
              </Text>

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8, alignItems: "center" }}>
                <Text style={styles.cardDate}>
                  {order.scheduled_date ? 
                    new Date(order.scheduled_date).toLocaleString("es-MX", { 
                      day: "2-digit", 
                      month: "short", 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    }) : 
                    "Sin fecha"
                  }
                </Text>

                <TouchableOpacity onPress={() => {
                  Alert.alert("Abrir en mapas", "Abrir ubicación en:", [
                    { text: "Google Maps", onPress: () => openGoogleMaps(order.client_address) },
                    { text: "Waze", onPress: () => openWaze(order.client_address) },
                    { text: "Apple Maps", onPress: () => openAppleMaps(order.client_address) },
                    { text: "Cancelar", style: "cancel" },
                  ]);
                }} style={{ padding: 6 }}>
                  <MapPin size={18} color="#0066CC" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Map Section */}
      {/* <View style={styles.mapSection}>
        <View style={styles.mapHeader}>
          <Text style={stylesText.sectionTitle}>Ubicaciones de las Órdenes</Text>
          {geocodingLoading && (
            <View style={styles.geocodingIndicator}>
              <ActivityIndicator size="small" color="#3C8BF2" />
              <Text style={styles.geocodingText}>Ubicando...</Text>
            </View>
          )}
        </View>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 19.4326,
              longitude: -99.1332,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            mapType="standard"
          >
            {(selectedDate ? ordersOfDay : orders.slice(0, 10))
              .filter(
                (order) =>
                  order.client_address && orderCoordinates[order.id_service_order]
              )
              .map((order) => {
                const coords = orderCoordinates[order.id_service_order];
                
                return (
                  <Marker
                    key={order.id_service_order}
                    coordinate={coords}
                    title={order.client_name}
                    description={`${order.service_name} - ${getStatusLabel(order.state_)}`}
                    pinColor={getStatusColor(order.state_)}
                  />
                );
              })}
          </MapView>
        </View>
        {(selectedDate ? ordersOfDay : orders.slice(0, 10)).filter(
          (order) => order.client_address && !orderCoordinates[order.id_service_order]
        ).length > 0 && (
          <Text style={styles.mapNote}>
            Algunas órdenes aún se están ubicando en el mapa...
          </Text>
        )}
      </View> */}
    </ScrollView>
  );
}

/* ---------- estilos locales ---------- */
const localStyles = StyleSheet.create({
  bentoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 18,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 6,
    alignItems: "flex-start",
    elevation: 3,
  },
  bentoTitle: { fontSize: 12, color: "#666", marginBottom: 6 },
  bentoNumber: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  progressBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 6,
    marginRight: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.5,
    shadowColor: "#000",
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
    fontWeight: "600",
  },
});

/* ---------- estilos base ---------- */
const styles = StyleSheet.create({
  greeting: { fontSize: 18, fontWeight: "700", color: "#1A1A1A" },

  section: { paddingHorizontal: 20, marginTop: 18 },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#333", flex: 1 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#FFF", fontSize: 11, fontWeight: "600" },

  cardSub: { fontSize: 13, color: "#666" },
  cardSubBlue: { fontSize: 13, color: "#0066CC", marginBottom: 4 },

  cardDate: { fontSize: 12, color: "#999" },

  // Calendar Card
  calendarCard: {
    backgroundColor: "#FFF",
    borderRadius: 30,
    marginHorizontal: 20,
    marginTop: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },

  // Filters Section
  filtersSection: {
    paddingHorizontal: 20,
    marginTop: 18,
  },
  statusFilters: {
    marginTop: 12,
    marginBottom: 4,
  },

  // Map Section
  mapSection: {
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 40,
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  geocodingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  geocodingText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  mapContainer: {
    height: 350,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapNote: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },
});