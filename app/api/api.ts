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