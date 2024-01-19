import { useEffect, useReducer } from "react"
import { lightSpeed, gravityConstant, solarMass } from "./constants"

type ReducerState = {
  si: number
  geo: number
}

type ReducerAction = {
  type: "set_si" | "set_geo"
  payload: number
}

function useUnits(defaultSi: number, conversionFactor: number) {
  const defaultGeo = defaultSi * conversionFactor

  const [{ si, geo }, dispatch] = useReducer((
    state: ReducerState,
    { type, payload }: ReducerAction
  ) => {
    switch (type) {
      case "set_si":
        return {
          si: payload,
          geo: payload / conversionFactor
        } as ReducerState
      case "set_geo":
        return {
          si: payload * conversionFactor,
          geo: payload
        } as ReducerState
      default:
        return state as ReducerState
    }
  }, {
    si: defaultSi,
    geo: defaultGeo
  })

  const setSi = (value: number) => dispatch({ type: "set_si", payload: value })
  const setGeo = (value: number) => dispatch({ type: "set_geo", payload: value })

  useEffect(() => {
    setSi(si)
  }, [conversionFactor])

  return {
    si, setSi,
    geo, setGeo
  }
}

export const velocityConversionFactor = lightSpeed
export const frequencyConversionFactor = (mass: number) => lightSpeed ** 3 / mass / gravityConstant
export const lengthConversionFactor = (mass: number) => 1 / lightSpeed ** 2 * mass * gravityConstant
export const timeConversionFactor = (mass: number) => 1 / lightSpeed ** 3 * mass * gravityConstant

export const useVelocity = (defaultValue: number) => useUnits(defaultValue, velocityConversionFactor)
export const useFrequency = (defaultValue: number, mass: number) => useUnits(defaultValue, frequencyConversionFactor(mass))
export const useLength = (defaultValue: number, mass: number) => useUnits(defaultValue, lengthConversionFactor(mass))
export const useTime = (defaultValue: number, mass: number) => useUnits(defaultValue, timeConversionFactor(mass))

type MassReducerState = {
  si: number
  solar: number
}

type MassReducerAction = {
  type: "set_si" | "set_solar"
  payload: number
}

export function useSolarMass(defaultSolar: number) {
  const defaultSi = defaultSolar * solarMass

  const [{ si, solar }, dispatch] = useReducer((
    state: MassReducerState,
    { type, payload }: MassReducerAction
  ) => {
    switch (type) {
      case "set_si":
        return {
          si: payload,
          solar: payload / solarMass
        } as MassReducerState
      case "set_solar":
        return {
          si: payload * solarMass,
          solar: payload
        } as MassReducerState
      default:
        return state as MassReducerState
    }
  }, {
    si: defaultSi,
    solar: defaultSolar
  })

  const setSi = (value: number) => dispatch({ type: "set_si", payload: value })
  const setSolar = (value: number) => dispatch({ type: "set_solar", payload: value })

  return {
    si, setSi,
    solar, setSolar
  }
}
