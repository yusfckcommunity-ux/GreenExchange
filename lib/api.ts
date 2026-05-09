const BASE_URL = "https://script.google.com/macros/s/AKfycby643NMmJp8XI4QAftHwtxCr4RPsY1LUt9Q84I2yu3uZxpwOl6LWMlwhEQWEfeam1Hj/exec"

export interface User {
  user_id: string
  username?: string
}

export interface Account {
  cash_balance: number
  blocked_balance: number
}

export interface Symbol {
  symbol: string
  name: string
  last_price: number
}

export interface OrderBookEntry {
  price: number
  qty: number
}

export interface OrderBook {
  buy: OrderBookEntry[]
  sell: OrderBookEntry[]
}

export interface TradeContext {
  last_price: number
  qty?: number
  avg_price?: number
}

export interface Order {
  order_id: string
  symbol: string
  side: 'buy' | 'sell'
  price: number
  quantity: number
  filled: number
  status: string
  blocked_qty?: number
  created_at?: string
}

export interface OrdersResponse {
  success: boolean
  active: Order[]
  history: Order[]
}

export interface Position {
  symbol: string
  total_owned: number
  blocked: number
  available: number
  avg_price: number
  market_price: number
  unrealized_pnl: number
  pnl_percent: number
  arrow?: string
}

export interface PortfolioResponse {
  success: boolean
  data: Position[]
}

export interface PricePoint {
  price: number
  time: string
}

export interface LastPriceResponse {
  success: boolean
  symbol: string
  prices: PricePoint[]
}

export interface SymbolInfo {
  symbol: string
  name: string
  class: string
  is_active: boolean
  last_price: number
  min_qty: number
  description: string
  logo_url: string
  certification: string
  issuer: string
  project_type: string
  region: string
  commissioned_year: number
  credit_unit: string
  total_credit: number
  credit_per_qty: number
  status: string
  images: string[]
}

export interface SymbolInfoResponse {
  success: boolean
  data: SymbolInfo
}

export interface ApiResponse<T = unknown> {
  success: boolean
  error?: string
  data?: T
}

export async function callApi<T = unknown>(action: string, data: Record<string, unknown> = {}): Promise<T | null> {
  try {
    console.log('[v0] Calling API:', action, data)
    
    // Google Apps Script requires special handling for CORS
    // Using no-cors mode won't work because we need the response
    // Instead, we need to use the redirect: 'follow' to handle GAS redirects
    const res = await fetch(`${BASE_URL}?action=${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain', // GAS handles text/plain better for CORS
      },
      body: JSON.stringify(data),
      redirect: 'follow',
    })
    
    console.log('[v0] API Response status:', res.status, res.statusText)
    
    const text = await res.text()
    console.log('[v0] API Response text:', text)
    
    try {
      return JSON.parse(text)
    } catch {
      console.error('[v0] Failed to parse JSON:', text)
      return null
    }
  } catch (error) {
    console.error('[v0] API Error:', error)
    return null
  }
}

export async function login(username: string, password: string): Promise<{ success: boolean; user_id?: string }> {
  const res = await callApi<{ success: boolean; user_id: string }>('login', { username, password })
  return res || { success: false }
}

export async function getAccount(userId: string): Promise<Account | null> {
  return callApi<Account>('get_account', { user_id: userId })
}

export async function getMarket(): Promise<Symbol[] | null> {
  return callApi<Symbol[]>('get_market')
}

export async function getOrderBook(symbol: string): Promise<OrderBook | null> {
  return callApi<OrderBook>('get_orderbook', { symbol })
}

export async function getTradeContext(userId: string, symbol: string): Promise<TradeContext | null> {
  return callApi<TradeContext>('get_trade_context', { user_id: userId, symbol })
}

export async function placeBuyOrder(
  userId: string,
  symbol: string,
  price: number,
  quantity: number
): Promise<{ success: boolean; order_id?: string; error?: string }> {
  const res = await callApi<{ success: boolean; order_id: string; error?: string }>('buy', {
    user_id: userId,
    symbol,
    price,
    quantity,
  })
  return res || { success: false, error: 'Network error' }
}

export async function placeSellOrder(
  userId: string,
  symbol: string,
  price: number,
  quantity: number
): Promise<{ success: boolean; order_id?: string; error?: string }> {
  const res = await callApi<{ success: boolean; order_id: string; error?: string }>('sell', {
    user_id: userId,
    symbol,
    price,
    quantity,
  })
  return res || { success: false, error: 'Network error' }
}

export async function getOrders(userId: string): Promise<OrdersResponse | null> {
  return callApi<OrdersResponse>('get_orders', { user_id: userId })
}

export async function cancelOrder(orderId: string, userId: string): Promise<{ success: boolean }> {
  const res = await callApi<{ success: boolean }>('cancel', { order_id: orderId, user_id: userId })
  return res || { success: false }
}

export async function getPortfolio(userId: string): Promise<PortfolioResponse | null> {
  return callApi<PortfolioResponse>('get_portfolio', { user_id: userId })
}

export async function getLastPrice(symbol: string): Promise<LastPriceResponse | null> {
  return callApi<LastPriceResponse>('get_last_price', { symbol })
}

export async function getSymbolInfo(symbol: string): Promise<SymbolInfoResponse | null> {
  return callApi<SymbolInfoResponse>('get_symbol_info', { symbol })
}

// Issue Submission Types
export interface IssueSubmission {
  user_id: number
  symbol: string
  name: string
  class: string
  is_active: boolean
  last_price: number
  min_qty: number
  description: string
  logo_url: string
  certification: string
  issuer: string
  project_type: string
  region: string
  commissioned_year: number
  credit_unit: string
  total_credit: number
  credit_per_qty: number
  status: string
  image_url_1?: string
  image_url_2?: string
  image_url_3?: string
  image_url_4?: string
  image_url_5?: string
  certificate_url?: string
  map_url?: string
}

export interface SubmitIssueResponse {
  success: boolean
  issue_id?: string
  error?: string
}

export async function submitIssue(data: IssueSubmission): Promise<SubmitIssueResponse> {
  const res = await callApi<SubmitIssueResponse>('submit_issue', data)
  return res || { success: false, error: 'Network error' }
}

// Inbox Types
export type InboxCategory = 
  | 'warning'
  | 'order_notification'
  | 'system_notification'
  | 'cancelation'
  | 'direct_message'
  | 'others'

export interface InboxMessage {
  message_id: string
  category: InboxCategory
  subject: string
  message: string
  time: string
  is_read: number
}

export interface InboxResponse {
  success: boolean
  data: InboxMessage[]
}

export async function getInbox(userId: string): Promise<InboxResponse> {
  const res = await callApi<InboxResponse>('get_inbox', { user_id: userId })
  return res || { success: false, data: [] }
}

export async function markInboxRead(messageId: string): Promise<{ success: boolean }> {
  const res = await callApi<{ success: boolean }>('mark_inbox_read', { message_id: messageId })
  return res || { success: false }
}

// Account Management Types
export interface CreateAccountPayload {
  username: string
  password: string
  cash_balance: number
  full_name: string
  email: string
  phone: string
  avatar_url: string
  status: string
  kyc_status: string
  company_name: string
}

export interface UpdateAccountPayload {
  user_id: string
  full_name?: string
  email?: string
  phone?: string
  avatar_url?: string
  status?: string
  kyc_status?: string
  company_name?: string
}

export interface GoogleLoginPayload {
  google_id: string
  email: string
  full_name: string
  avatar_url: string
}

export interface UserProfile {
  user_id: string
  username: string
  full_name: string
  email: string
  phone: string
  avatar_url: string
  status: string
  kyc_status: string
  company_name: string
  cash_balance: number
  blocked_balance: number
}

export interface AccountResponse {
  success: boolean
  user_id?: string
  error?: string
}

export interface ProfileResponse {
  success: boolean
  data?: UserProfile
  error?: string
}

export async function createAccount(data: CreateAccountPayload): Promise<AccountResponse> {
  const res = await callApi<AccountResponse>('create_account', data)
  return res || { success: false, error: 'Network error' }
}

export async function updateAccount(data: UpdateAccountPayload): Promise<AccountResponse> {
  const res = await callApi<AccountResponse>('update_account', data)
  return res || { success: false, error: 'Network error' }
}

export async function googleLogin(data: GoogleLoginPayload): Promise<{ success: boolean; user_id?: string; is_new?: boolean }> {
  const res = await callApi<{ success: boolean; user_id: string; is_new: boolean }>('google_login', data)
  return res || { success: false }
}

export async function getUserProfile(userId: string): Promise<ProfileResponse> {
  const res = await callApi<ProfileResponse>('get_user_profile', { user_id: userId })
  return res || { success: false, error: 'Network error' }
}
