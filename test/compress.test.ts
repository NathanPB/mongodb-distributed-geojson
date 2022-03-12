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

import {RemoteDocument} from "../src/remote";
import {Feature, FeatureCollection} from "geojson";
import {compressDocument, CompressedDocument, decompressDocument} from "../src/compress";

describe('#compressDocument', () => {
  it('Should not compress if is feature collection', () => {
    const input: RemoteDocument<FeatureCollection> = {
      _id: 'bondia',
      _hash: '',
      type: 'FeatureCollection',
      features: []
    }

    expect(compressDocument(input)).toEqual(input)
  })

  it('Should compress the geometry if it\'s a feature', () => {
    const input: RemoteDocument<Feature> = {
      _id: 'bondia',
      _hash: '',
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [0, 0] }
    }

    expect(compressDocument(input)).toEqual({
      ...input,
      geometry: '789cab562aa92c4855b2520ac8cfcc2b51d2514acecf2f4ac9cc4b2c492d56b28a36d03188ad0500e2050c10'
    })
  })
});

describe('#decompressDocument', () => {
  it('Should not decompress if is feature collection', () => {
    const input: RemoteDocument<FeatureCollection> = {
      _id: 'bondia',
      _hash: '',
      type: 'FeatureCollection',
      features: []
    }

    expect(decompressDocument(input)).toEqual(input)
  })

  it('Should decompress the geometry if it\'s a feature', () => {
    const input: CompressedDocument = {
      _id: 'bondia',
      _hash: '',
      type: 'Feature',
      properties: {},
      geometry: '789cab562aa92c4855b2520ac8cfcc2b51d2514acecf2f4ac9cc4b2c492d56b28a36d03188ad0500e2050c10' as any // fuck this fuck im out
    }

    expect(decompressDocument(input)).toEqual({
      ...input,
      geometry: { type: 'Point', coordinates: [0, 0] }
    })
  })
});
