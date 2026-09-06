import type { InterviewEntry } from '../types'
import { ApiError, request } from './api'

export interface InterviewRepository {
  list(): Promise<InterviewEntry[]>
  get(id: string): Promise<InterviewEntry | null>
  upsert(entry: InterviewEntry): Promise<InterviewEntry>
  remove(id: string): Promise<void>
  clear(): Promise<void>
}

export class HttpRepository implements InterviewRepository {
  async list(): Promise<InterviewEntry[]> {
    return request<InterviewEntry[]>('/api/entries')
  }

  async get(id: string): Promise<InterviewEntry | null> {
    try {
      return await request<InterviewEntry>(`/api/entries/${id}`)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null
      throw e
    }
  }

  async upsert(entry: InterviewEntry): Promise<InterviewEntry> {
    return request<InterviewEntry>(`/api/entries/${entry.id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    })
  }

  async remove(id: string): Promise<void> {
    await request(`/api/entries/${id}`, { method: 'DELETE' })
  }

  async clear(): Promise<void> {
    await request('/api/entries', { method: 'DELETE' })
  }
}

export const repo: InterviewRepository = new HttpRepository()
