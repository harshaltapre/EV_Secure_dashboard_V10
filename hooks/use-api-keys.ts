"use client"

import { useState, useEffect, useCallback } from 'react'

interface APIKeyData {
  id: string
  stationId: string
  stationName: string
  key: string
  status: 'active' | 'inactive' | 'expired'
  createdAt: string
  lastUsed: string | null
  expiresAt: string | null
  permissions: string[]
}

interface APIKeyStats {
  total: number
  active: number
  inactive: number
  expired: number
  stationsWithKeys: number
  stationsWithoutKeys: number
}

export function useAPIKeys() {
  const [apiKeys, setApiKeys] = useState<APIKeyData[]>([])
  const [stats, setStats] = useState<APIKeyStats>({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0,
    stationsWithKeys: 0,
    stationsWithoutKeys: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAPIKeys = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/keys')
      if (!response.ok) {
        throw new Error('Failed to fetch API keys')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setApiKeys(data.keys || [])
        
        // Calculate stats
        const total = data.keys?.length || 0
        const active = data.keys?.filter((key: APIKeyData) => key.status === 'active').length || 0
        const inactive = data.keys?.filter((key: APIKeyData) => key.status === 'inactive').length || 0
        const expired = data.keys?.filter((key: APIKeyData) => key.status === 'expired').length || 0
        
        // Get unique stations with keys
        const stationsWithKeys = new Set(data.keys?.map((key: APIKeyData) => key.stationId)).size
        const stationsWithoutKeys = 6 - stationsWithKeys // Assuming 6 total stations
        
        setStats({
          total,
          active,
          inactive,
          expired,
          stationsWithKeys,
          stationsWithoutKeys
        })
      } else {
        throw new Error(data.error || 'Failed to load API keys')
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createAPIKey = useCallback(async (stationId: string, stationName: string, permissions: string[] = ['read', 'write']) => {
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationId,
          stationName,
          permissions
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create API key')
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh the API keys list
        await fetchAPIKeys()
        return data.key
      } else {
        throw new Error(data.error || 'Failed to create API key')
      }
    } catch (error) {
      console.error('Error creating API key:', error)
      throw error
    }
  }, [fetchAPIKeys])

  const updateAPIKey = useCallback(async (keyId: string, updates: Partial<APIKeyData>) => {
    try {
      const response = await fetch('/api/keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyId,
          ...updates
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update API key')
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh the API keys list
        await fetchAPIKeys()
        return data.key
      } else {
        throw new Error(data.error || 'Failed to update API key')
      }
    } catch (error) {
      console.error('Error updating API key:', error)
      throw error
    }
  }, [fetchAPIKeys])

  const deleteAPIKey = useCallback(async (keyId: string) => {
    try {
      const response = await fetch('/api/keys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyId })
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete API key')
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh the API keys list
        await fetchAPIKeys()
        return true
      } else {
        throw new Error(data.error || 'Failed to delete API key')
      }
    } catch (error) {
      console.error('Error deleting API key:', error)
      throw error
    }
  }, [fetchAPIKeys])

  const getAPIKeyByStation = useCallback((stationId: string) => {
    return apiKeys.find(key => key.stationId === stationId)
  }, [apiKeys])

  const getActiveAPIKeys = useCallback(() => {
    return apiKeys.filter(key => key.status === 'active')
  }, [apiKeys])

  const getInactiveAPIKeys = useCallback(() => {
    return apiKeys.filter(key => key.status === 'inactive')
  }, [apiKeys])

  const getExpiredAPIKeys = useCallback(() => {
    return apiKeys.filter(key => key.status === 'expired')
  }, [apiKeys])

  const hasActiveKey = useCallback((stationId: string) => {
    return apiKeys.some(key => key.stationId === stationId && key.status === 'active')
  }, [apiKeys])

  const refreshAPIKeys = useCallback(() => {
    fetchAPIKeys()
  }, [fetchAPIKeys])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchAPIKeys()
    
    const interval = setInterval(fetchAPIKeys, 30000)
    
    return () => clearInterval(interval)
  }, [fetchAPIKeys])

  return {
    apiKeys,
    stats,
    isLoading,
    error,
    createAPIKey,
    updateAPIKey,
    deleteAPIKey,
    getAPIKeyByStation,
    getActiveAPIKeys,
    getInactiveAPIKeys,
    getExpiredAPIKeys,
    hasActiveKey,
    refreshAPIKeys
  }
}
