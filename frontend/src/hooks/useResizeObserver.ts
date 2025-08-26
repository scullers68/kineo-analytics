import { useState, useEffect, useRef, useCallback } from 'react'

export interface UseResizeObserverResult<T extends Element = Element> {
  ref: React.RefObject<T>
  entry: ResizeObserverEntry | null
  width: number
  height: number
}

export const useResizeObserver = <T extends Element = Element>(): UseResizeObserverResult<T> => {
  const [entry, setEntry] = useState<ResizeObserverEntry | null>(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const ref = useRef<T>(null)
  const observer = useRef<ResizeObserver | null>(null)

  const disconnect = useCallback(() => {
    if (observer.current) {
      observer.current.disconnect()
      observer.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (!ref.current) return

    disconnect()

    observer.current = new ResizeObserver(([entry]) => {
      setEntry(entry)
      setWidth(entry.contentRect.width)
      setHeight(entry.contentRect.height)
    })

    observer.current.observe(ref.current)
  }, [disconnect])

  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  useEffect(() => {
    if (ref.current) {
      connect()
    }
  }, [connect])

  return { ref, entry, width, height }
}

export const useElementSize = <T extends Element = Element>() => {
  const { ref, width, height } = useResizeObserver<T>()
  
  return {
    ref,
    size: { width, height },
    width,
    height
  }
}

export default useResizeObserver