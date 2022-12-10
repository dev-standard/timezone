/*
 * @Date: 2022-12-10 11:38:45
 * @Author: liting luz.liting@gmail.com
 * @LastEditors: liting luz.liting@gmail.com
 * @LastEditTime: 2022-12-10 11:57:43
 * @FilePath: /timezone/src/index.js
 */
import fs from 'fs/promises'
import path from 'path'

const jsonEntry = path.resolve(process.cwd(), 'timezone.json')

export let timezone = null

try {
  fs.readFile(jsonEntry).then(data => {
    timezone = JSON.parse(data)
  })
} catch (err) {
  console.error(er)
}
