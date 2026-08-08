export interface DashboardUser {
  id: string;
  phone_number: string;
  email: string;
  full_name: string;
  market_location: string;
  created_at: string;
  reputation_score: number;
  total_transactions: number;
  preferred_language: string;
}

export interface DashboardToday {
  salesCount: number;
  expenseCount: number;
  totalSales: number;
  totalExpenses: number;
  totalProfit: number;
}

export interface DashboardInventory {
  totalItems: number;
  totalQuantity: number;
  inventoryValue: number;
}

export interface DashboardAlertItem {
  // Add fields here when the API returns alert items
  [key: string]: unknown;
}

export interface DashboardAlerts {
  count: number;
  message: string;
  items: DashboardAlertItem[];
}

export interface DashboardMarket {
  message: string;
  type: string;
}

export interface DashboardResponse {
  user: DashboardUser;
  today: DashboardToday;
  inventory: DashboardInventory;
  alerts: DashboardAlerts;
  recent: unknown[];
  market: DashboardMarket;
}