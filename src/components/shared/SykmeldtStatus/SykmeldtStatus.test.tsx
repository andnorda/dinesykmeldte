import { render, screen } from '../../../utils/test/testUtils';
import {
    createAktivitetIkkeMuligPeriode,
    createSykmelding,
    createPreviewSykmeldt,
} from '../../../utils/test/dataCreators';
import { dateAdd, dateSub, formatDate, formatDateRange } from '../../../utils/dateUtils';

import SykmeldtStatus from './SykmeldtStatus';

describe('SykmeldtStatus', () => {
    const now = new Date();
    const sykmeldingPast = createSykmelding({
        id: 'sykmelding-past',
        perioder: [
            createAktivitetIkkeMuligPeriode({
                fom: dateSub(now, { days: 30 }),
                tom: dateSub(now, { days: 20 }),
            }),
        ],
    });
    const sykmeldingFuture = createSykmelding({
        id: 'sykmelding-future',
        perioder: [
            createAktivitetIkkeMuligPeriode({
                fom: dateAdd(now, { days: 20 }),
                tom: dateAdd(now, { days: 30 }),
            }),
        ],
    });

    const sykmeldingNow = createSykmelding({
        id: 'sykmelding-now',
        perioder: [
            createAktivitetIkkeMuligPeriode({
                fom: dateSub(now, { days: 5 }),
                tom: dateAdd(now, { days: 5 }),
            }),
        ],
    });

    const sykmeldingNearFuture = createSykmelding({
        id: 'sykmelding-near',
        perioder: [
            createAktivitetIkkeMuligPeriode({
                fom: dateAdd(now, { days: 5 }),
                tom: dateAdd(now, { days: 10 }),
            }),
        ],
    });

    it('should format correctly for past period', async () => {
        const sykmeldt = createPreviewSykmeldt({
            navn: 'Eple Kake',
            sykmeldinger: [createSykmelding({ id: sykmeldingPast.id, lest: true, perioder: sykmeldingPast.perioder })],
        });

        render(<SykmeldtStatus sykmeldt={sykmeldt} includeName />);

        expect(
            await screen.findByText(
                `Eple var sist sykmeldt ${formatDateRange(
                    sykmeldingPast.perioder[0].fom,
                    sykmeldingPast.perioder[0].tom,
                )}`,
            ),
        ).toBeInTheDocument();
    });

    it('should format correctly for future period', async () => {
        const sykmeldt = createPreviewSykmeldt({
            navn: 'Eple Kake',
            sykmeldinger: [
                createSykmelding({ id: sykmeldingFuture.id, lest: true, perioder: sykmeldingFuture.perioder }),
            ],
        });

        render(<SykmeldtStatus sykmeldt={sykmeldt} includeName={false} />);

        expect(
            await screen.findByText(`100% sykmeldt fra ${formatDate(sykmeldingFuture.perioder[0].fom)}`),
        ).toBeInTheDocument();
    });

    it('should format correctly for current period', async () => {
        const sykmeldt = createPreviewSykmeldt({
            navn: 'Eple Kake',
            sykmeldinger: [createSykmelding({ id: sykmeldingNow.id, lest: true, perioder: sykmeldingNow.perioder })],
        });

        render(<SykmeldtStatus sykmeldt={sykmeldt} includeName />);

        expect(
            await screen.findByText(`Eple er 100% sykmeldt til ${formatDate(sykmeldingNow.perioder[0].tom)}`),
        ).toBeInTheDocument();
    });

    it('should format correctly for near future period', async () => {
        const sykmeldt = createPreviewSykmeldt({
            navn: 'Eple Kake',
            sykmeldinger: [
                createSykmelding({ id: sykmeldingPast.id, lest: true, perioder: sykmeldingPast.perioder }),
                createSykmelding({ id: sykmeldingNearFuture.id, lest: true, perioder: sykmeldingNearFuture.perioder }),
                createSykmelding({ id: sykmeldingFuture.id, lest: true, perioder: sykmeldingFuture.perioder }),
            ],
        });

        render(<SykmeldtStatus sykmeldt={sykmeldt} includeName={false} />);

        expect(
            await screen.findByText(`100% sykmeldt fra ${formatDate(sykmeldingNearFuture.perioder[0].fom)}`),
        ).toBeInTheDocument();
    });
});
