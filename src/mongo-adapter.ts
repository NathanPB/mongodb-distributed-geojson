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

import Cache from 'lru-cache';
import sizeof from 'object-sizeof';
import {Collection} from 'mongodb';
import {_let} from '@nathanpb/kext/scope';
import {CompressedDocument, decompressDocument} from './compress';
import {RemoteDocument} from './remote';

const cache = new Cache<string, RemoteDocument>({
  max: 8192,
  maxSize: 5.12e+08,
  sizeCalculation: (v, k) => sizeof(v) + k.length * 2,
})

export async function findDocument(collection: Collection, id: string, hash?: string): Promise<RemoteDocument | undefined> {
  const cached = hash && cache.get(`${id}|${hash}`)
  if (cached) return cached
  const doc = _let(
    await collection.findOne({ _id: id }) as CompressedDocument | null,
    d => d && decompressDocument(d)
  )

  if (doc) cache.set(`${id}|${doc._hash}`, doc)
  return doc ?? undefined
}

export function insertDocument(collection: Collection, data: CompressedDocument) {
  return collection.insertOne(data as any)
}
