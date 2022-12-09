/*
 * @Date: 2022-12-10 00:12:09
 * @LastEditors: liting gooleblacku@gmail.com
 * @LastEditTime: 2022-12-10 00:36:00
 * @FilePath: /timezone/src/index.js
 */
import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'

const countryCodeEntry = path.resolve(process.cwd(), './src/data/iso3166.tab')
const entry = path.resolve(process.cwd(), './src/data/zone1970.tab')
const output = path.resolve(process.cwd(), 'timezone.json')

let countryCodeEntryData = new Map()

const clearOldData = async () => {
  try {
    await fs.rm(output, { force: true, maxRetries: 3, recursive: true, retryDelay: 100 })
    console.log(chalk.green('rm old timezone.json successful'))
  } catch (err) {
    console.error(err)
  }
}

const getCountryCodeEntryData = async () => {
  try {
    const data = await fs.readFile(countryCodeEntry, 'utf-8')
    const lines = data.split('\n').filter(line => !line.startsWith('#'))
    countryCodeEntryData.clear()
    lines.forEach(line => {
      const [key, contry] = line.split(/\s+/u)
      countryCodeEntryData.set(key, contry)
    })
    console.log(chalk.green('get contry code successful'))
  } catch (err) {
    console.error(err)
  }
}

const refresh = async () => {
  try {
    const data = await fs.readFile(entry, 'utf-8')
    const lines = data.split('\n').filter(line => !line.startsWith('#'))
    const timezoneData = {
      data: [],
      updateTime: Date.now(),
    }
    lines.forEach(line => {
      const [code, coordinates, tz, comments] = line.split('\t')
      timezoneData.data.push({
        code,
        comments: comments ?? '',
        coordinates,
        tz,
        contry: countryCodeEntryData.get(code) ?? '',
      })
    })
    fs.writeFile(output, JSON.stringify(timezoneData), 'utf-8')
  } catch (err) {
    console.error(err)
  }
}

const run = async () => {
  await Promise.all([clearOldData(), getCountryCodeEntryData()])
  refresh()
}

run()
