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

import {Collection} from 'mongodb';
import {Feature, FeatureCollection} from 'geojson';
import {isFeatureCollection} from './typings';
import {randomUUID} from 'crypto'
import hashGeoJSON from './hash';
import {throwExpr} from '@nathanpb/kext/error';
import {compressDocument} from "./compress";
import {findDocument, insertDocument} from "./mongo-adapter";

export type RemoteDocumentReference = { _id: string, _hash: string, parent?: string }

export type RemoteDocument<T extends Feature | FeatureCollection = Feature | FeatureCollection> = T extends Feature
    ? RemoteDocumentReference & T & { parent?: string }
    : RemoteDocumentReference & Omit<T, 'features'> & { features: RemoteDocumentReference[] }

export type LocalDocument<T extends Feature | FeatureCollection = Feature | FeatureCollection> = T extends Feature
  ? RemoteDocumentReference & T
  : RemoteDocumentReference & Omit<T, 'features'> & { features: LocalDocument[] }

function newReference(data: Feature | FeatureCollection, parent?: string): RemoteDocumentReference {
  const _id = randomUUID() as any
  const _hash = hashGeoJSON({ parent, ...data })
  return { _id, _hash, ...(parent ? { parent } : {}) }
}

export async function loadById(collection: Collection, id: string, hash?: string): Promise<RemoteDocument> {
  return await findDocument(collection, id, hash) ?? throwExpr(`Cannot find remote document of id ${id}`)
}

export async function deepLoadById(collection: Collection, id: string, level: number = Number.MAX_SAFE_INTEGER, hash?: string): Promise<LocalDocument | RemoteDocument> {
  const document = await loadById(collection, id, hash)
  if (document.type === 'Feature' || level <= 0) return document

  return {
    ...document,
    features: await Promise.all(
      document.features.map(
        feat => deepLoadById(collection, feat._id, level-1, feat._hash)
      )
    )
  }
}

export async function insert(collection: Collection, data: Feature | FeatureCollection, parent?: string): Promise<[RemoteDocumentReference, ...RemoteDocumentReference[]]> {
  const ref = newReference(data, parent)

  const deepInsert = isFeatureCollection(data)
    ? await Promise.all(data.features.map(it => insert(collection, it, ref._id)))
    : undefined

  const mountedData = compressDocument({
    ...ref,
    ...data,
    ...deepInsert ? { features: deepInsert.map(it => it[0]) } : { },
  } as any)

  await insertDocument(collection, mountedData)
  return [ref, ...deepInsert?.flat() ?? []]
}
