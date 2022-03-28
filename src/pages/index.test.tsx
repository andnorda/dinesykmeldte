import preloadAll from 'jest-next-dynamic';
import userEvent from '@testing-library/user-event';
import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';

import { render, screen, supressVirksomhetPickerActWarning } from '../utils/test/testUtils';
import {
    createAktivitetIkkeMuligPeriode,
    createInitialQuery,
    createSykmelding,
    createPreviewSykmeldt,
    createVirksomhet,
} from '../utils/test/dataCreators';
import {
    MineSykmeldteDocument,
    PreviewSykmeldtFragment,
    VirksomheterDocument,
} from '../graphql/queries/graphql.generated';

import Index from './index.page';

describe('Index page', () => {
    beforeEach(async () => await preloadAll());

    function setup(sykmeldte: PreviewSykmeldtFragment[]): void {
        const initialState = [
            createInitialQuery(MineSykmeldteDocument, { __typename: 'Query', mineSykmeldte: sykmeldte }),
            createInitialQuery(VirksomheterDocument, { __typename: 'Query', virksomheter: [createVirksomhet()] }),
        ];

        render(<Index />, { initialState });
    }

    describe('given more or less than 5 people in org', () => {
        it('should not display filter when there is less than 5 sykmeldte in an org', async () => {
            setup([
                // In org
                createPreviewSykmeldt({ fnr: '1', orgnummer: '123456789' }),
                createPreviewSykmeldt({ fnr: '2', orgnummer: '123456789' }),
                createPreviewSykmeldt({ fnr: '3', orgnummer: '123456789' }),
                createPreviewSykmeldt({ fnr: '4', orgnummer: '123456789' }),
                // Not in org
                createPreviewSykmeldt({ fnr: '5', orgnummer: 'wrong-org' }),
                createPreviewSykmeldt({ fnr: '6', orgnummer: 'wrong-org' }),
            ]);

            expect(screen.queryByRole('textbox', { name: 'Søk på navn' })).not.toBeInTheDocument();
            expect(screen.queryByRole('combobox', { name: 'Vis' })).not.toBeInTheDocument();
            expect(screen.queryByRole('combobox', { name: 'Sorter etter' })).not.toBeInTheDocument();

            await supressVirksomhetPickerActWarning(screen);
        });

        it('should display filters when there are 5 or more in an org', async () => {
            setup([
                // In org
                createPreviewSykmeldt({ fnr: '1', orgnummer: '123456789' }),
                createPreviewSykmeldt({ fnr: '2', orgnummer: '123456789' }),
                createPreviewSykmeldt({ fnr: '3', orgnummer: '123456789' }),
                createPreviewSykmeldt({ fnr: '4', orgnummer: '123456789' }),
                createPreviewSykmeldt({ fnr: '5', orgnummer: '123456789' }),
                // Not in org
                createPreviewSykmeldt({ fnr: '6', orgnummer: 'wrong-org' }),
            ]);

            expect(screen.getByRole('textbox', { name: 'Søk på navn' })).toBeInTheDocument();
            expect(screen.getByRole('combobox', { name: 'Vis' })).toBeInTheDocument();
            expect(screen.getByRole('combobox', { name: 'Sorter etter' })).toBeInTheDocument();

            await supressVirksomhetPickerActWarning(screen);
        });
    });

    describe('when the filter changes', () => {
        describe('specifically names', () => {
            const sykmeldte = [
                createPreviewSykmeldt({ fnr: '1', navn: 'Marcelina Decker' }),
                createPreviewSykmeldt({ fnr: '2', navn: 'Daanyaal Butler' }),
                createPreviewSykmeldt({ fnr: '3', navn: 'Kaitlin Dotson' }),
                createPreviewSykmeldt({ fnr: '4', navn: 'Lacy Carty' }),
                createPreviewSykmeldt({ fnr: '5', navn: 'Kelly Iles' }),
            ];

            it('should filter by name', async () => {
                setup(sykmeldte);

                userEvent.type(screen.getByRole('textbox', { name: 'Søk på navn' }), 'Kaitlin Dotson');

                await waitForElementToBeRemoved(() => screen.queryByText('Daanyaal Butler'));

                expect(
                    screen
                        .getAllByRole('heading')
                        .slice(2)
                        .map((it) => it.textContent),
                ).toEqual(['Kaitlin Dotson']);
            });

            it('should also filter fuzzily', async () => {
                setup(sykmeldte);

                userEvent.type(screen.getByRole('textbox', { name: 'Søk på navn' }), 'Facy Sharty');

                await screen.findByText('Lacy Carty');

                expect(
                    screen
                        .getAllByRole('heading')
                        .slice(2)
                        .map((it) => it.textContent),
                ).toEqual(['Lacy Carty']);
            });

            it('should sort by names when changing sort', async () => {
                setup(sykmeldte);

                userEvent.selectOptions(screen.getByRole('combobox', { name: 'Sorter etter' }), ['Navn']);

                await waitFor(() => expect(screen.getByRole('combobox', { name: 'Sorter etter' })).toHaveValue('name'));

                expect(
                    screen
                        .getAllByRole('heading')
                        .slice(2)
                        .map((it) => it.textContent),
                ).toEqual(['Daanyaal Butler', 'Kaitlin Dotson', 'Kelly Iles', 'Lacy Carty', 'Marcelina Decker']);
            });
        });

        it('should sort by date when changing "Sorter Etter" to date', async () => {
            setup([
                createPreviewSykmeldt({
                    fnr: '1',
                    navn: 'Second',
                    sykmeldinger: [
                        createSykmelding({
                            id: '1',
                            perioder: [createAktivitetIkkeMuligPeriode({ tom: '2020-01-02' })],
                        }),
                    ],
                }),
                createPreviewSykmeldt({
                    fnr: '2',
                    navn: 'Third',
                    sykmeldinger: [
                        createSykmelding({
                            id: '2',
                            perioder: [createAktivitetIkkeMuligPeriode({ tom: '2020-01-03' })],
                        }),
                    ],
                }),
                createPreviewSykmeldt({
                    fnr: '3',
                    navn: 'First',
                    sykmeldinger: [
                        createSykmelding({
                            id: '3',
                            perioder: [createAktivitetIkkeMuligPeriode({ tom: '2020-01-01' })],
                        }),
                    ],
                }),
                createPreviewSykmeldt({
                    fnr: '5',
                    navn: 'Fifth',
                    sykmeldinger: [
                        createSykmelding({
                            id: '4',
                            perioder: [createAktivitetIkkeMuligPeriode({ tom: '2020-01-05' })],
                        }),
                    ],
                }),
                createPreviewSykmeldt({
                    fnr: '4',
                    navn: 'Fourth',
                    sykmeldinger: [
                        createSykmelding({
                            id: '5',
                            perioder: [createAktivitetIkkeMuligPeriode({ tom: '2020-01-04' })],
                        }),
                    ],
                }),
            ]);

            userEvent.selectOptions(screen.getByRole('combobox', { name: 'Sorter etter' }), ['Dato']);

            await waitFor(() => expect(screen.getByRole('combobox', { name: 'Sorter etter' })).toHaveValue('date'));

            await waitFor(() =>
                expect(
                    screen
                        .getAllByRole('heading')
                        .slice(2)
                        .map((it) => it.textContent),
                ).toEqual(['Fifth', 'Fourth', 'Third', 'Second', 'First']),
            );
        });

        describe('spesifically "vis" filter', () => {
            const sykmeldte = [
                createPreviewSykmeldt({ fnr: '1', navn: 'Frisky A.', friskmeldt: true }),
                createPreviewSykmeldt({ fnr: '2', navn: 'Sicky A.', friskmeldt: false }),
                createPreviewSykmeldt({ fnr: '3', navn: 'Sicky B.', friskmeldt: false }),
                createPreviewSykmeldt({ fnr: '5', navn: 'Frisky B.', friskmeldt: true }),
                createPreviewSykmeldt({ fnr: '4', navn: 'Sicky C.', friskmeldt: false }),
            ];

            it('should filter by sykmeldt when changing "Vis" to sykmeldt', async () => {
                setup(sykmeldte);

                userEvent.selectOptions(screen.getByRole('combobox', { name: 'Vis' }), ['Sykmeldte']);

                await waitFor(() => expect(screen.getByRole('combobox', { name: 'Vis' })).toHaveValue('sykmeldte'));

                expect(
                    screen
                        .getAllByRole('heading')
                        .slice(2)
                        .map((it) => it.textContent),
                ).toEqual(['Sicky A.', 'Sicky B.', 'Sicky C.']);
            });

            it('should filter by friskmeldt when changing "Vis" to friskmeldt', async () => {
                setup(sykmeldte);

                userEvent.selectOptions(screen.getByRole('combobox', { name: 'Vis' }), ['Friskmeldte']);

                await waitFor(() => expect(screen.getByRole('combobox', { name: 'Vis' })).toHaveValue('friskmeldte'));

                expect(
                    screen
                        .getAllByRole('heading')
                        .slice(2)
                        .map((it) => it.textContent),
                ).toEqual(['Frisky A.', 'Frisky B.']);
            });
        });
    });
});
