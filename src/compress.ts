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

import {RemoteDocument} from "./remote";
import {isFeature} from "./typings";
import {Feature, Geometry} from "geojson";
import {decode, encode} from 'geobuf';
import Pbf from "pbf";

// Typescript (or my brain) stopped working in this module, lots of 'any' ahead

export type CompressedDocument = RemoteDocument extends Feature
  ? RemoteDocument & { geometry: string }
  : RemoteDocument

export function compressDocument(data: RemoteDocument) : CompressedDocument {
  return isFeature(data) ? {
    ...data,
    geometry: Buffer.from(encode(data.geometry, new Pbf())).toString('hex') as any
  } : data
}

export function decompressDocument(data: CompressedDocument): RemoteDocument {
  if (!isFeature(data)) return data

  const geometryBlob: string = data.geometry as any
  return {
    ...data,
    geometry: decode(
      new Pbf(
        Buffer.alloc(geometryBlob.length, geometryBlob, 'hex')
      )
    ) as Geometry,
  }
}
