import React from 'react'
import { BodyShort, Button, Heading } from '@navikt/ds-react'
import { Print } from '@navikt/ds-icons'
import cn from 'classnames'

import { SykmeldingFragment } from '../../graphql/queries/graphql.generated'
import { formatDate } from '../../utils/dateUtils'
import CheckboxExplanation from '../shared/checkboxexplanation/CheckboxExplanation'
import { ListItem } from '../shared/listItem/ListItem'
import { createPeriodeKey, formatPeriodTextNowOrFuture } from '../../utils/sykmeldingPeriodUtils'
import { BlueInfoSection } from '../shared/BlueInfoSection/BlueInfoSection'
import { addSpaceAfterEverySixthCharacter } from '../../utils/stringUtils'

import MulighetForArbeid from './sykmeldingperiode/MulighetForArbeid'
import SykmeldingPeriode from './sykmeldingperiode/SykmeldingPeriode'
import styles from './SykmeldingPanel.module.css'

interface Props {
    sykmelding: SykmeldingFragment
}

function SykmeldingPanel({ sykmelding }: Props): JSX.Element {
    return (
        <div className={styles.panelRoot}>
            <div className={styles.header}>
                <Heading size="small" level="2" id="sykmeldinger-panel-info-section">
                    Opplysninger fra sykmeldingen
                </Heading>
                <div className={styles.periods}>
                    {sykmelding.perioder.map((it) => (
                        <BodyShort key={it.fom} className={styles.period} size="small">
                            {formatPeriodTextNowOrFuture(it)}
                        </BodyShort>
                    ))}
                </div>
                <div
                    className={cn(styles.sentDateAndPrint, {
                        [styles.onlyPrint]: !sykmelding.sendtTilArbeidsgiverDato,
                    })}
                >
                    {sykmelding.sendtTilArbeidsgiverDato && (
                        <BodyShort className={styles.sendtDate} size="small">
                            {`Sendt til deg ${formatDate(sykmelding.sendtTilArbeidsgiverDato)}`}
                        </BodyShort>
                    )}
                    <Button
                        onClick={() => window.print()}
                        variant="tertiary"
                        className={styles.printButton}
                        icon={<Print title="Lag PDF versjon av sykmeldingen" />}
                    />
                </div>
            </div>
            <BlueInfoSection ariaLabelledBy="sykmeldinger-panel-info-section">
                <ul className={styles.sykmeldingListItemList}>
                    <ListItem
                        title="Sykmeldingen gjelder"
                        text={[sykmelding.navn, addSpaceAfterEverySixthCharacter(sykmelding.fnr)]}
                        headingLevel="3"
                    />
                    <SykmeldingPeriode perioder={sykmelding.perioder} />
                    <ListItem
                        title="Arbeidsgiver som legen har skrevet inn"
                        text={sykmelding.arbeidsgiver.navn ?? 'Ukjent'}
                        headingLevel="3"
                    />
                    <ListItem
                        title="Dato sykmeldingen ble skrevet"
                        text={formatDate(sykmelding.behandletTidspunkt)}
                        headingLevel="3"
                    />
                    <ListItem title="Lege / Sykmelder" text={sykmelding.behandler.navn ?? 'Ukjent'} headingLevel="3" />
                </ul>
            </BlueInfoSection>
            <BlueInfoSection ariaLabelledBy="sykmeldinger-panel-arbeid-section">
                <Heading
                    className={styles.underTitle}
                    size="small"
                    level="2"
                    spacing
                    id="sykmeldinger-panel-arbeid-section"
                >
                    Muligheter for arbeid
                </Heading>
                <ul className={styles.sykmeldingListItemList}>
                    {sykmelding.perioder.map((it) => (
                        <MulighetForArbeid key={createPeriodeKey(it)} periode={it} />
                    ))}
                </ul>
            </BlueInfoSection>
            <BlueInfoSection ariaLabelledBy="sykmeldinger-panel-prognose-section">
                <Heading className={styles.underTitle} id="sykmeldinger-panel-prognose-section" size="small" level="2">
                    Friskmelding/Prognose
                </Heading>
                <ul className={styles.sykmeldingListItemList}>
                    {sykmelding.arbeidsforEtterPeriode != null && (
                        <li>
                            <CheckboxExplanation
                                text={
                                    sykmelding.arbeidsforEtterPeriode
                                        ? 'Pasienten er 100% arbeidsfør etter denne perioden'
                                        : 'Pasienten er ikke arbeidsfør etter denne perioden'
                                }
                            />
                        </li>
                    )}
                    <ListItem
                        title="Eventuelle hensyn som må tas på arbeidsplassen"
                        text={sykmelding.tiltakArbeidsplassen ?? 'Ingen hensyn spesifisert'}
                        headingLevel="3"
                    />
                </ul>
            </BlueInfoSection>
            {sykmelding.innspillArbeidsplassen && (
                <BlueInfoSection ariaLabelledBy="sykmeldinger-panel-melding-tilarbeidsgiver">
                    <Heading
                        className={styles.underTitle}
                        id="sykmeldinger-panel-melding-tilarbeidsgiver"
                        size="small"
                        level="2"
                    >
                        Melding til arbeidsgiver
                    </Heading>
                    <ul className={styles.sykmeldingListItemList}>
                        <ListItem
                            title="Innspill til arbeidsgiver"
                            text={sykmelding.innspillArbeidsplassen}
                            headingLevel="3"
                        />
                    </ul>
                </BlueInfoSection>
            )}
            <BlueInfoSection ariaLabelledBy="sykmeldinger-panel-annet-section">
                <Heading id="sykmeldinger-panel-annet-section" className={styles.underTitle} size="small" level="3">
                    Annet
                </Heading>
                <ul className={styles.sykmeldingListItemList}>
                    <ListItem
                        title="Telefon til lege/sykmelder"
                        text={sykmelding.behandler.telefon ?? 'Ukjent'}
                        headingLevel="3"
                    />
                </ul>
            </BlueInfoSection>
        </div>
    )
}

export default SykmeldingPanel
