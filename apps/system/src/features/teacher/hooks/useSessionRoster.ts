import { useQuery } from '@tanstack/react-query'
import { rosterQuery, sessionNotesQuery } from '../queries'

export const useSessionRoster = (sessionId: string) => useQuery(rosterQuery(sessionId))
export const useSessionNotes = (sessionId: string) => useQuery(sessionNotesQuery(sessionId))
