import { useEffect, useRef } from 'react'
import { track, init } from '@amplitude/analytics-browser'
import { BaseEvent } from '@amplitude/analytics-types'
import { logger } from '@navikt/next-logger'

import { getPublicEnv } from '../utils/env'

import { AmplitudeTaxonomyEvents } from './taxonomyEvents'

const publicEnv = getPublicEnv()

/**
 * The new amplitude client is isomorphic, so we can use it in both the browser and the server.
 */
export function initAmplitude(): void {
    if (typeof window === 'undefined' || publicEnv.amplitudeEnabled !== 'true') return

    init('default', undefined, {
        useBatch: true,
        serverUrl: 'https://amplitude.nav.no/collect-auto',
        ingestionMetadata: {
            // This is a hack to provide collect-auto with the correct environment, won't be used within amplitude
            sourceName: window.location.toString(),
        },
    })
}

export function useLogAmplitudeEvent(event: AmplitudeTaxonomyEvents, extraData?: Record<string, unknown>): void {
    const stableEvent = useRef(event)
    const stableExtraData = useRef(extraData)

    useEffect(() => {
        logAmplitudeEvent(stableEvent.current, stableExtraData.current)
    }, [])
}

export function logAmplitudeEvent(event: AmplitudeTaxonomyEvents, extraData?: Record<string, unknown>): void {
    if (publicEnv.amplitudeEnabled !== 'true') {
        logDebugEvent(event, extraData)
        return
    }

    track(taxonomyToAmplitudeEvent(event), extraData)
}

function taxonomyToAmplitudeEvent(event: AmplitudeTaxonomyEvents): BaseEvent {
    return {
        event_type: event.eventName,
        event_properties: 'data' in event ? event.data : undefined,
    }
}

function logDebugEvent(event: AmplitudeTaxonomyEvents, extraData?: Record<string, unknown>): void {
    const data = { ...('data' in event ? event.data : {}), ...extraData }

    logger.info(`Amplitude debug event: ${event.eventName} ${JSON.stringify(data)}`)
}
