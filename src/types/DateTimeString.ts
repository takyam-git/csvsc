export type IsoDateTimeString = string & { readonly __tag: unique symbol }
export type YyyyMmDdDateString = string & { readonly __tag: unique symbol }
export type MmDdDateString = string & { readonly __tag: unique symbol }
export type YyyyMmDdHhMmSsDateTimeString = string & { readonly __tag: unique symbol }
export type YyyyMmDdHhMmDateTimeString = string & { readonly __tag: unique symbol }
export type HhMmSsTimeString = string & { readonly __tag: unique symbol }
export type HhMmTimeString = string & { readonly __tag: unique symbol }

export type DateTimeString =
  | IsoDateTimeString
  | YyyyMmDdHhMmSsDateTimeString
  | YyyyMmDdHhMmDateTimeString
export type DateString = YyyyMmDdDateString | MmDdDateString
export type TimeString = HhMmSsTimeString | HhMmTimeString

export type AnyDateTimeStringType = DateTimeString | DateString | TimeString

export const isIsoDateTimeString = (value: string): value is IsoDateTimeString =>
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.test(value)

export const isYyyyMmDdDateString = (value: string): value is YyyyMmDdDateString =>
  /^\d{4}[-/](0?\d|1[012])[-/](0?\d|[12]\d|3[01])$/.test(value)

export const isMmDdDateString = (value: string): value is MmDdDateString =>
  /^(0?\d|1[012])[-/](0?\d|[12]\d|3[01])$/.test(value)

export const isYyyyMmDdHhMmSsDateTimeString = (
  value: string
): value is YyyyMmDdHhMmSsDateTimeString =>
  /^\d{4}[-/](0?\d|1[012])[-/](0?\d|[12]\d|3[01]) \d{2}:\d{2}:\d{2}$/.test(value)

export const isYyyyMmDdHhMmDateTimeString = (value: string): value is YyyyMmDdHhMmDateTimeString =>
  /^\d{4}[-/](0?\d|1[012])[-/](0?\d|[12]\d|3[01]) \d{2}:\d{2}$/.test(value)

export const isHhMmSsTimeString = (value: string): value is HhMmSsTimeString =>
  /^\d{2}:\d{2}:\d{2}$/.test(value)

export const isHhMmTimeString = (value: string): value is HhMmTimeString =>
  /^\d{2}:\d{2}$/.test(value)

export const isDateTimeString = (value: string): value is DateTimeString =>
  isIsoDateTimeString(value) ||
  isYyyyMmDdHhMmSsDateTimeString(value) ||
  isYyyyMmDdHhMmDateTimeString(value)

export const isDateString = (value: string): value is DateString =>
  isYyyyMmDdDateString(value) || isMmDdDateString(value)

export const isTimeString = (value: string): value is TimeString =>
  isHhMmSsTimeString(value) || isHhMmTimeString(value)

export const isAnyDateTimeStringType = (value: string): value is AnyDateTimeStringType =>
  isDateTimeString(value) || isDateString(value) || isTimeString(value)
