import { useEffect, useState } from 'react'
import { usePrevProps } from './usePrevProps'

export const useScale = (value: number): number => {
  const [scale, setScale] = useState(1)
  const previousValue = usePrevProps(value)

  const isNew = previousValue === undefined
  const hasChanged = previousValue !== value
  const isEmpty = value <= 0

  const shouldScale = !isEmpty && (isNew || hasChanged)

  useEffect(() => {
    if (shouldScale) {
      setScale(1.1)
      setTimeout(() => setScale(1), 100)
    }
  }, [shouldScale])

  return scale
}
