/*
 * @Date: 2022-12-10 17:13:39
 * @Author: liting luz.liting@gmail.com
 * @LastEditors: liting luz.liting@gmail.com
 * @LastEditTime: 2022-12-10 17:20:56
 * @FilePath: /timezone/src/utils/fotmat.js
 */
// date-fns
export const formatLocaleKey = (key) => {
  const [
    lang,
    region,
  ] = key.split('-')

  if (! region)
    return lang

  return lang + region[0].toUpperCase() + region.slice(1)
}
