import { API_URL } from "./config";


//* Get all clients
export async function getClients() {
  try {
    const res = await fetch(`${API_URL}/clients`);
    if (!res.ok) throw new Error("Error al obtener clientes");
    return await res.json();
  } catch (error) {
    console.error("Error:", error);
    return null;
  } 
}

//* Get one client

export async function getClientById(id: string) {
  try {
    const res = await fetch(`${API_URL}/clients/${id}`);
    if (!res.ok) throw new Error("Error al obtener el cliente");
    return await res.json();
  } catch (error) {
    console.error("Error:", error);
    return null;
  } 
}


// get all service orders
export async function getServiceOrders() {
  try {
    const res = await fetch(`${API_URL}/service-orders`);
    if (!res.ok) throw new Error("Error al obtener órdenes de servicio");
    return await res.json();
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
  
}

//* Get one service order by id
export async function getServiceOrderById(id: string) {
  try {     
    const res = await fetch(`${API_URL}/service-orders/${id}`);
    if (!res.ok) throw new Error("Error al obtener la orden de servicio");
    return await res.json();
  } catch (error) {
    console.error("Error:", error);
    return null;
  } 

}

// get all tasks
export async function getTasks() {
  try {
    const res = await fetch(`${API_URL}/tasks`);
    if (!res.ok) throw new Error("Error al obtener tareas");
    return await res.json();
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

//* Get one task by id  
export async function getTaskById(id: string) {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`);
    if (!res.ok) throw new Error("Error al obtener la tarea");
    return await res.json();
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}


export async function getFullServiceOrders() {
  try {
    const res = await fetch(`${API_URL}/service-orders-full`);
    if (!res.ok) throw new Error("Error al obtener órdenes de servicio completas");
    return await res.json();
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}


// Iniciar orden (start) - El backend espera formato HH:mm:ss
export async function startServiceOrder(id: number, startTime?: string) {
  try {
    // Si no se proporciona startTime, el backend usará la hora actual del servidor
    const body = startTime ? { start_time: startTime } : {};
    
    const res = await fetch(`${API_URL}/service-orders/${id}/start`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "Error al iniciar la orden" }));
      throw new Error(errorData.message || "Error al iniciar la orden");
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error:", error);
    throw error;
  }
}


// Completar orden (complete) - El backend espera formato HH:mm:ss y opcionalmente products
export async function completeServiceOrder(
  id: number, 
  endTime?: string, 
  products?: Array<{ product_id: number; quantity_used: number }>
) {
  try {
    const body: any = {};
    if (endTime) body.end_time = endTime;
    if (products && products.length > 0) body.products = products;
    
    const res = await fetch(`${API_URL}/service-orders/${id}/complete`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "Error al completar la orden" }));
      throw new Error(errorData.message || "Error al completar la orden");
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error:", error);
    throw error;
  }
}

// Cancelar orden - Opcionalmente puede recibir cancel_reason
export async function cancelServiceOrder(id: number, cancelReason?: string) {
  try {
    const body = cancelReason ? { cancel_reason: cancelReason } : {};
    
    const res = await fetch(`${API_URL}/service-orders/${id}/cancel`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "Error al cancelar la orden" }));
      throw new Error(errorData.message || "Error al cancelar la orden");
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error:", error);
    throw error;
  }
}

// Enviar productos usados - El backend espera POST con formato { products: [{ product_id, quantity_used }] }
export async function addUsedProducts(
  id: number, 
  products: Array<{ product_id: number; quantity_used: number }>
) {
  try {
    if (!products || products.length === 0) {
      throw new Error("products debe ser un array no vacío");
    }

    const res = await fetch(`${API_URL}/service-orders/${id}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ products }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "Error al registrar productos usados" }));
      throw new Error(errorData.message || "Error al registrar productos usados");
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error:", error);
    throw error;
  }
}

// Guardar firma del cliente
export async function signServiceOrder(id: number, signature: string) {
  try {
    if (!signature) {
      throw new Error("Se requiere la firma (base64 o path)");
    }

    const res = await fetch(`${API_URL}/service-orders/${id}/sign`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ files: signature }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "Error al guardar la firma" }));
      throw new Error(errorData.message || "Error al guardar la firma");
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error:", error);
    throw error;
  }
}