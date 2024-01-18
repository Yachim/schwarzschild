import { useEffect, useState } from "react"
import { lightSpeed, gravityConstant } from "./constants"

// multiply conversionFactor to get si
// divide conversionFactor to get geometrized
function useUnits(defaultValue: number, conversionFactor: number, isGeo = false) {
  const defaultSi = isGeo ? defaultValue / conversionFactor : defaultValue
  const defaultGeo = isGeo ? defaultValue : defaultValue * conversionFactor

  const [si, setSi] = useState(defaultSi)
  const [geo, setGeo] = useState(defaultGeo)

  useEffect(() => {
    setSi(geo * conversionFactor)
  }, [geo, conversionFactor])

  useEffect(() => {
    setGeo(si / conversionFactor)
  }, [si, conversionFactor])

  return {
    si, setSi,
    geo, setGeo
  }
}

export const useVelocity = (defaultValue: number, isGeo = false) => useUnits(defaultValue, lightSpeed, isGeo)
export const useAngularVelocity = (defaultValue: number, mass: number, isGeo = false) => useUnits(defaultValue, lightSpeed ** 3 / mass / gravityConstant, isGeo)
export const useFrequency = useAngularVelocity
export const useMass = (defaultValue: number, mass: number, isGeo = false) => useUnits(defaultValue, mass, isGeo)
export const useLength = (defaultValue: number, mass: number, isGeo = false) => useUnits(defaultValue, 1 / lightSpeed ** 2 * mass * gravityConstant, isGeo)
export const useTime = (defaultValue: number, mass: number, isGeo = false) => useUnits(defaultValue, 1 / lightSpeed ** 3 * mass * gravityConstant, isGeo)
