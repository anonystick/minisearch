import { LEAF } from './TreeIterator.js'

export const fuzzySearch = function (node, query, maxDistance) {
  const stack = [{ distance: 0, i: 0, key: '', node }]
  const results = {}
  while (stack.length > 0) {
    const { node, distance, key, i, edit } = stack.pop()
    Object.keys(node).forEach(k => {
      if (k === LEAF) {
        const totDistance = distance + (query.length - i)
        const [, , d] = results[key] || [null, null, Infinity]
        if (totDistance <= maxDistance && totDistance < d) {
          results[key] = [key, node[k], totDistance]
        }
      } else {
        withinDistance(query, k, maxDistance - distance, i, edit).forEach(({ distance: d, i, edit }) => {
          stack.push({ node: node[k], distance: distance + d, key: key + k, i, edit })
        })
      }
    })
  }
  return Object.values(results).sort(([, , a], [, , b]) => a - b)
}

export const withinDistance = function (a, b, maxDistance, i = 0, edit = undefined) {
  const stack = [{ distance: 0, ia: i, ib: 0, edit }]
  const mem = []
  const results = []
  while (stack.length > 0) {
    const { distance, ia, ib, edit } = stack.pop()
    mem[ia] = mem[ia] || []
    if (mem[ia][ib] && mem[ia][ib] <= distance) { continue }
    mem[ia][ib] = distance
    if (ib === b.length) {
      results.push({ distance, i: ia, edit })
      continue
    }
    if (a[ia] === b[ib]) {
      stack.push({ distance, ia: ia + 1, ib: ib + 1 })
    } else {
      if (distance >= maxDistance) { continue }
      if (edit !== ADD) { stack.push({ distance: distance + 1, ia, ib: ib + 1, edit: DELETE }) }
      if (ia < a.length) {
        if (edit !== DELETE) { stack.push({ distance: distance + 1, ia: ia + 1, ib, edit: ADD }) }
        stack.push({ distance: distance + 1, ia: ia + 1, ib: ib + 1, edit: CHANGE })
      }
    }
  }
  return results
}

const CHANGE = 'c'
const ADD = 'a'
const DELETE = 'd'

export default fuzzySearch