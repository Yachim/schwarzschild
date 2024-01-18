import { useReducer } from "react"
import { lightSpeed, gravityConstant } from "./constants"

type ReducerState = {
  si: number
  geo: number
}

type ReducerAction = {
  type: "set_si" | "set_geo"
  payload: number
}

// multiply by conversionFactor to get si
// divide by conversionFactor to get geometrized
function useUnits(defaultValue: number, conversionFactor: number, isGeo = false) {
  const defaultSi = isGeo ? defaultValue / conversionFactor : defaultValue
  const defaultGeo = isGeo ? defaultValue : defaultValue * conversionFactor

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

  return {
    si, setSi,
    geo, setGeo
  }
}

export const velocityConversionFactor = lightSpeed
export const frequencyConversionFactor = (mass: number) => lightSpeed ** 3 / mass / gravityConstant
export const lengthConversionFactor = (mass: number) => 1 / lightSpeed ** 2 * mass * gravityConstant
export const timeConversionFactor = (mass: number) => 1 / lightSpeed ** 3 * mass * gravityConstant

export const useVelocity = (defaultValue: number, isGeo = false) => useUnits(defaultValue, velocityConversionFactor, isGeo)
export const useFrequency = (defaultValue: number, mass: number, isGeo = false) => useUnits(defaultValue, frequencyConversionFactor(mass), isGeo)
export const useLength = (defaultValue: number, mass: number, isGeo = false) => useUnits(defaultValue, lengthConversionFactor(mass), isGeo)
export const useTime = (defaultValue: number, mass: number, isGeo = false) => useUnits(defaultValue, timeConversionFactor(mass), isGeo)
