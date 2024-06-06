export namespace ThrowUtils {
  export function not_null<T>(val: T): val is NonNullable<T> {
    if (val === null) {
      throw new Error('val is null')
    }
    return true
  }
}