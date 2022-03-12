/*
 * Copyright 2022 Nathan P. Bombana
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

import hashGeoJSON from "../src/hash";

it('Should perform a simple hash', () => {
  expect(hashGeoJSON({ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 1] }, properties: {} }))
    .toEqual('18d6010709da9ae00cbe9314411bc8ecd6abea9d08a192a9121501b99411c8cc')
})

it('Should exclude _id from hash', () => {
  expect(hashGeoJSON({ _id: 'bondia', type: 'Feature', geometry: { type: 'Point', coordinates: [0, 1] }, properties: {} }))
    .toEqual('18d6010709da9ae00cbe9314411bc8ecd6abea9d08a192a9121501b99411c8cc')
})

it('Should skip _hash from hash', () => {
  expect(hashGeoJSON({ _hash: 'bondia', type: 'Feature', geometry: { type: 'Point', coordinates: [0, 1] }, properties: {} }))
    .toEqual('bondia')
})

it('Should deep hash a FeatureCollection', () => {
  expect(
    hashGeoJSON({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 1] }, properties: {} },
        { type: 'Feature', geometry: { type: 'Point', coordinates: [2, 4] }, properties: {} },
      ]
    })
  ).toEqual('c67ac09a73f33dd232f47df74fa74127341cba9164e57dc1be2cc1f9bc306011')
})

it('Should skip deep hashing for _hash inside FeatureCollection', () => {
  expect(
    hashGeoJSON({
      type: 'FeatureCollection',
      features: [
        { _hash: '18d6010709da9ae00cbe9314411bc8ecd6abea9d08a192a9121501b99411c8cc' },
        { type: 'Feature', geometry: { type: 'Point', coordinates: [2, 4] }, properties: {} },
      ]
    })
  ).toEqual('c67ac09a73f33dd232f47df74fa74127341cba9164e57dc1be2cc1f9bc306011')
})
