"use client"

import { useState, useEffect, useCallback } from 'react'

interface ESP32ConnectionStatus {
  isConnected: boolean
  connectedStations: number
  totalStations: number
  lastUpdate: Date | null
  error: string | null
  isLoading: boolean
}

interface StationData {
  id: string
  name: string
  status: string
  esp32Status: string
  lastSync: string
  isOnline: boolean
}

export function useESP32Connection() {
  const [connectionStatus, setConnectionStatus] = useState<ESP32ConnectionStatus>({
    isConnected: false,
    connectedStations: 0,
    totalStations: 6,
    lastUpdate: null,
    error: null,
    isLoading: true
  })

  const [stations, setStations] = useState<StationData[]>([])

  const fetchConnectionStatus = useCallback(async () => {
    try {
      setConnectionStatus(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await fetch('/api/stations')
      if (!response.ok) {
        throw new Error('Failed to fetch station data')
      }
      
      const data = await response.json()
      
      if (data.success) {
        const connectedStations = data.stations.filter((station: any) => 
          station.esp32Status === "connected"
        ).length
        
        const stationData: StationData[] = data.stations.map((station: any) => ({
          id: station.id,
          name: station.name,
          status: station.status,
          esp32Status: station.esp32Status,
          lastSync: station.lastSync,
          isOnline: station.esp32Status === "connected"
        }))
        
        setStations(stationData)
        setConnectionStatus({
          isConnected: connectedStations > 0,
          connectedStations,
          totalStations: data.totalStations || 6,
          lastUpdate: new Date(),
          error: null,
          isLoading: false
        })
      } else {
        throw new Error(data.error || 'Failed to load station data')
      }
    } catch (error) {
      console.error('Error fetching ESP32 connection status:', error)
      setConnectionStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      }))
    }
  }, [])

  const refreshConnection = useCallback(() => {
    fetchConnectionStatus()
  }, [fetchConnectionStatus])

  const getStationById = useCallback((stationId: string) => {
    return stations.find(station => station.id === stationId)
  }, [stations])

  const getOnlineStations = useCallback(() => {
    return stations.filter(station => station.isOnline)
  }, [stations])

  const getOfflineStations = useCallback(() => {
    return stations.filter(station => !station.isOnline)
  }, [stations])

  // Auto-refresh every 5 seconds
  useEffect(() => {
    fetchConnectionStatus()
    
    const interval = setInterval(fetchConnectionStatus, 5000)
    
    return () => clearInterval(interval)
  }, [fetchConnectionStatus])

  return {
    ...connectionStatus,
    stations,
    refreshConnection,
    getStationById,
    getOnlineStations,
    getOfflineStations
  }
}
