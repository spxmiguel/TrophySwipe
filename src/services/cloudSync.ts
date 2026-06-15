import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/app'
import type { AppState } from '../types/domain'
import { nowIso } from '../utils/date'

function requireDb() {
  if (!db) {
    throw new Error('Firebase nao configurado.')
  }

  return db
}

function stateDoc(uid: string) {
  return doc(requireDb(), 'users', uid, 'trophyswipe', 'state')
}

export async function loadCloudState(uid: string): Promise<AppState | null> {
  const snapshot = await getDoc(stateDoc(uid))
  if (!snapshot.exists()) return null

  return snapshot.data() as AppState
}

export async function saveCloudState(uid: string, state: AppState) {
  const serializableState = JSON.parse(JSON.stringify(state)) as AppState

  await setDoc(stateDoc(uid), {
    ...serializableState,
    lastCloudSyncAt: nowIso(),
  })
}

export async function deleteCloudState(uid: string) {
  await deleteDoc(stateDoc(uid))
}
