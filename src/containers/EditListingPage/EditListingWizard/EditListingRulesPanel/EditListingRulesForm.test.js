import React from 'react';
import '@testing-library/jest-dom';

import { fakeIntl } from '../../../../util/testData';
import { renderWithProviders as render, testingLibrary } from '../../../../util/testHelpers';

import EditListingRulesForm from './EditListingRulesForm';

const { screen, userEvent, fireEvent } = testingLibrary;

const noop = () => null;

describe('EditListingDeliveryForm', () => {
  test('Check that price can be given and submit button activates', () => {
    const saveActionMsg = 'Save rules';
    render(
      <EditListingRulesForm
        intl={fakeIntl}
        dispatch={noop}
        onSubmit={v => v}
        unitType="day"
        saveActionMsg={saveActionMsg}
        updated={false}
        updateInProgress={false}
        disabled={false}
        ready={false}
      />
    );

    // Test that save button is disabled at first
    expect(screen.getByRole('button', { name: saveActionMsg })).toBeDisabled();

    // Fill mandatory attributes
    const price = 'Rules';
    userEvent.type(screen.getByRole('textbox', { name: price }), 'Be nice');

    // Test that save button is enabled
    expect(screen.getByRole('button', { name: saveActionMsg })).toBeEnabled();
  });
});
