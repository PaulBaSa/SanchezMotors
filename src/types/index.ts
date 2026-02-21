// =============================================
// Workshop Manager - Data Models
// Based on DynamoDB Single Table Design
// =============================================

export type UserRole = 'admin' | 'mechanic';

export type OrderStatus = 'reception' | 'in_progress' | 'completed' | 'delivered';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type ImageType = 'entry' | 'process';

export type PhotoSlot =
  | 'front'
  | 'rear'
  | 'left'
  | 'right'
  | 'interior_front'
  | 'interior_rear';

export const PHOTO_SLOT_LABELS: Record<PhotoSlot, string> = {
  front: 'Frontal',
  rear: 'Trasera',
  left: 'Lateral Izquierdo',
  right: 'Lateral Derecho',
  interior_front: 'Interior Frontal',
  interior_rear: 'Interior Trasero',
};

export interface VehicleInfo {
  vin: string;
  plates: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  engine: string;
  odometer: string;
}

export interface InspectionPhoto {
  slot: PhotoSlot;
  uri: string;
  note: string;
  timestamp: string;
}

export interface WorkOrder {
  id: string; // Format: YYMMDD-##
  pk: string; // OT#[ID]
  sk: string; // METADATA
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  vehicle: VehicleInfo;
  clientName: string;
  clientPhone: string;
  reasonForVisit: string;
  photos: InspectionPhoto[];
  tasks: WorkTask[];
}

export interface WorkTask {
  id: string;
  pk: string; // OT#[orderID]
  sk: string; // TASK#[ID]
  description: string;
  status: TaskStatus;
  mechanicName: string;
  hoursWorked: number;
  saleCost: number; // Precio de venta (visible para cliente)
  realCost: number; // Costo real (solo admin)
  laborSaleCost: number; // Mano de obra venta
  laborRealCost: number; // Mano de obra real
  evidencePhotos: TaskPhoto[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPhoto {
  id: string;
  uri: string;
  note: string;
  timestamp: string;
}

export interface OrderImage {
  id: string;
  pk: string; // OT#[orderID]
  sk: string; // IMG#[ID]
  s3Link: string;
  localUri: string;
  timestamp: string;
  type: ImageType;
  slot?: PhotoSlot;
}

// Budget / Finance types
export interface BudgetLineItem {
  taskId: string;
  description: string;
  partsSalePrice: number;
  partsRealCost: number;
  laborSalePrice: number;
  laborRealCost: number;
}

export interface BudgetSummary {
  totalSale: number;
  totalRealCost: number;
  margin: number;
  marginPercentage: number;
}

// Navigation & UI types
export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  pin: string;
}
