/**
 * lib/api.ts — Axios instance with JWT injection and error normalisation
 */
import axios, { type AxiosError } from 'axios'
import { supabase } from './supabase'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Inject Supabase JWT on every request
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normalise error shape to { error, detail } matching the backend contract
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ error?: string; detail?: string }>) => {
    const detail =
      err.response?.data?.detail ??
      err.response?.data?.error ??
      err.message ??
      'Unknown error'
    return Promise.reject(new Error(detail))
  },
)

/** Typed helper — returns response.data directly */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await api.get<T>(path)
  return res.data
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await api.post<T>(path, body)
  return res.data
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await api.put<T>(path, body)
  return res.data
}

export async function apiDelete(path: string): Promise<void> {
  await api.delete(path)
}
