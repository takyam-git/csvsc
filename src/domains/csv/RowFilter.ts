import type { AnyDateTimeStringType, DateString, TimeString } from '@/types/DateTimeString'
import type { CsvFile, CsvRows } from '@/infrastructures/csv/CsvParser'
import { isDate, isNumber, isRegExp, isString } from 'lodash'
import { isNumeric } from '@/infrastructures/StringUtils'
import Decimal from 'decimal.js'
import type { OpUnitType } from 'dayjs'
import dayjs from 'dayjs'

export enum DataType {
  Numeric = 'numeric',
  Text = 'text',
  Date = 'date',
  Time = 'time',
  DateTime = 'date-time'
}

type DataTypeMapper = {
  [DataType.Numeric]: number
  [DataType.Text]: string | RegExp
  [DataType.Date]: Date | DateString
  [DataType.Time]: Date | TimeString
  [DataType.DateTime]: Date | AnyDateTimeStringType
}
export const isDataType = (value: string | any): value is DataType =>
  Object.values(DataType).includes(value)

export enum CompareType {
  Equal = 'equal',
  NotEqual = 'not-equal',
  GreaterThan = 'greater-than',
  GreaterThanOrEqual = 'grater-than-or-equal',
  LessThan = 'less-than',
  LessThanOrEqual = 'less-than-or-equal'
}
export const isCompareType = (value: string | any): value is CompareType =>
  Object.values(CompareType).includes(value)

type CompareTypeMapper = {
  [DataType.Numeric]: CompareType
  [DataType.Text]: CompareType.Equal | CompareType.NotEqual
  [DataType.Date]: CompareType
  [DataType.Time]: CompareType
  [DataType.DateTime]: CompareType
}

export type FilterCondition<T extends DataType = DataType> = {
  uuid: string
  index: number
  dataType: T
  compareType: CompareTypeMapper[T]
  compareValue: DataTypeMapper[T]
  dateTimeUnit?: OpUnitType
}

const wrapBool = (result: boolean, isEqual: boolean) => (isEqual ? result : !result)

export const filterRows = (csv: CsvFile, conditions: FilterCondition[]): CsvFile => {
  const newRows: CsvRows = conditions.reduce(
    (acc, condition): CsvRows => {
      const compareValue = condition.compareValue
      const isRegExpCompareValue = isRegExp(compareValue)

      const isNumberCompareValue =
        isNumber(compareValue) || (isString(compareValue) && isNumeric(compareValue))
      const decimalCompareValue = isNumberCompareValue ? new Decimal(compareValue) : null

      const rawDateTimeCompareValue =
        [DataType.Date, DataType.Time, DataType.DateTime].includes(condition.dataType) &&
        (isDate(compareValue) || isString(compareValue))
          ? dayjs(compareValue)
          : null
      const dateTimeCompareValue = rawDateTimeCompareValue?.isValid()
        ? rawDateTimeCompareValue
        : null

      const isEqual = condition.compareType === CompareType.Equal
      const isGreaterThan = condition.compareType === CompareType.GreaterThan
      const isGreaterThanOrEqual = condition.compareType === CompareType.GreaterThanOrEqual
      const isLessThan = condition.compareType === CompareType.LessThan
      const isLessThanOrEqual = condition.compareType === CompareType.LessThanOrEqual

      return acc.filter((row): boolean => {
        const value = `${row[condition.index] ?? ''}`.trim()
        if (condition.dataType === DataType.Text) {
          if (isRegExpCompareValue) {
            return wrapBool(compareValue.test(value), isEqual)
          }
          return wrapBool(compareValue === value, isEqual)
        }
        if (condition.dataType === DataType.Numeric) {
          if (!isNumeric(value) || decimalCompareValue === null) {
            return false
          }
          const decimal = new Decimal(value)
          if (isGreaterThan) {
            return decimal.greaterThan(decimalCompareValue)
          }
          if (isGreaterThanOrEqual) {
            return decimal.greaterThanOrEqualTo(decimalCompareValue)
          }
          if (isLessThan) {
            return decimal.lessThan(decimalCompareValue)
          }
          if (isLessThanOrEqual) {
            return decimal.lessThanOrEqualTo(decimalCompareValue)
          }
          return wrapBool(decimalCompareValue.equals(decimal), isEqual)
        }
        if ([DataType.Date, DataType.Time, DataType.DateTime].includes(condition.dataType)) {
          if (!dateTimeCompareValue) {
            return false
          }
          const dateTimeValue = dayjs(value)
          if (!dateTimeValue.isValid()) {
            return false
          }
          if (isGreaterThan) {
            return dateTimeValue.isAfter(dateTimeCompareValue, condition.dateTimeUnit)
          }
          if (isGreaterThanOrEqual) {
            return dateTimeValue.isSameOrAfter(dateTimeCompareValue, condition.dateTimeUnit)
          }
          if (isLessThan) {
            return dateTimeValue.isBefore(dateTimeCompareValue, condition.dateTimeUnit)
          }
          if (isLessThanOrEqual) {
            return dateTimeValue.isSameOrBefore(dateTimeCompareValue, condition.dateTimeUnit)
          }
          return wrapBool(
            dateTimeCompareValue.isSame(dateTimeValue, condition.dateTimeUnit),
            isEqual
          )
        }
        throw new Error('unknown data type')
      })
    },
    [...csv.rows.slice(1)]
  )
  return {
    ...csv,
    rows: [csv.rows[0], ...newRows],
    rowSize: newRows.length + 1
  }
}
