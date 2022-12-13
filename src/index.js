/*
 * @Date: 2022-12-10 00:12:09
 * @LastEditors: liting luz.liting@gmail.com
 * @LastEditTime: 2022-12-14 00:13:04
 * @FilePath: /timezone/src/index.js
 */
import chalk from 'chalk'
import fs from 'fs/promises'
import glob from 'glob'
import path from 'path'
import { formatInTimeZone, getTimezoneOffset } from 'date-fns-tz/esm'
import { datefnsLocales, formatLocaleKey } from './utils/index.js'
import {sortBy} from 'lodash-es'

const localesEntry = path.join(process.cwd(), '/node_modules/date-fns/esm/locale/')
const countryCodeEntry = path.resolve(process.cwd(), './src/data/iso3166.tab')
const entry = path.resolve(process.cwd(), './src/data/zone1970.tab')
const outputDir = path.join(process.cwd(), './list')

const locales = []
const locationCodeEntryData = new Map()

const clearOldData = async () => {
  try {
    await fs.rm(outputDir, { force: true, maxRetries: 3, recursive: true, retryDelay: 100 })
    console.log(chalk.green('clear old data successful'))
  } catch (err) {
    console.error(err)
  }
}

const getLocales = async () => {
  glob(
    '!(_)*/',
    {
      cwd: localesEntry,
      root: localesEntry,
      nomount: false,
    },
    (err, files) => {
      if (err) {
        console.error(err)

        return
      }

      files.forEach(async file => {
        locales.push({
          locale: formatLocaleKey(file),
          outputFileName: `${file.slice(0, -1)}.json`,
        })
      })
    }
  )
}

const getCountryCodeEntryData = async () => {
  try {
    const data = await fs.readFile(countryCodeEntry, 'utf-8')
    const lines = data.split('\n').filter(line => !line.startsWith('#'))
    locationCodeEntryData.clear()

    lines.forEach(line => {
      const [key, location] = line.split(/\s+/u)
      locationCodeEntryData.set(key, location)
    })
    console.log(chalk.green('get location code successful'))
  } catch (err) {
    console.error(err)
  }
}

const refresh = async () => {
  try {
    const data = await fs.readFile(entry, 'utf-8')
    const lines = data.split('\n').filter(line => !line.startsWith('#'))
    const timezoneLocalesMap = new Map()

    lines.forEach(line => {
      const [codes, coordinates, iana] = line.split('\t')

      codes.split(',').forEach(code => {
        locales.forEach(({ locale }) => {
          if (!timezoneLocalesMap.get(locale)) {
            timezoneLocalesMap.set(locale, {
              list: [],
              incompatible: [],
              updateTime: Date.now(),
            })
          }

          try {
            const format = formatInTimeZone(new Date(), iana, 'O...OOO|OOOO|z..zzz|zzzz', {
              locale: datefnsLocales[locale],
            }).split('|')
            // const format = formatInTimeZone(new Date(), iana, 'O...OOO|OOOO|z..zzz|zzzz').split('|')

            timezoneLocalesMap.get(locale).list.push({
              code,
              coordinates,
              iana,
              location: locationCodeEntryData.get(code) ?? '',
              offset: getTimezoneOffset(iana),
              shortGmt: format[0].split('...')[0],
              longGmt: format[1],
              shortNonLocation: format[2].split('..')[0],
              longNonLocation: format[3],
            })
          } catch (err) {
            // console.error(err)
            timezoneLocalesMap.get(locale).incompatible.push({
              code,
              coordinates,
              iana,
              location: locationCodeEntryData.get(code) ?? '',
              err: JSON.parse(JSON.stringify(err, ['name', 'message'], 2)),
            })
          }
        })
      })
    })
    await fs.mkdir(outputDir)

    locales.forEach(locale => {
      timezoneLocalesMap.get(locale.locale).list = sortBy(timezoneLocalesMap.get(locale.locale).list, ['offset', 'iana', 'contry'])
      timezoneLocalesMap.get(locale.locale).incompatible = sortBy(timezoneLocalesMap.get(locale.locale).incompatible, ['iana', 'contry'])
      fs.writeFile(
        path.resolve(outputDir, locale.outputFileName),
        JSON.stringify(timezoneLocalesMap.get(locale.locale), null, 2),
        'utf-8'
      )
    })
  } catch (err) {
    console.error(err)
  }
}

const run = async () => {
  await Promise.all([clearOldData(), getCountryCodeEntryData(), getLocales()])
  refresh()
}

run()
