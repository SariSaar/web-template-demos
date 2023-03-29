import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { injectIntl } from '../../../util/reactIntl';
import { Form as FinalForm } from 'react-final-form';
import { FieldCurrencyInput, Form, PrimaryButton } from '../../../components';
import css from './TransactionPanel.module.css';
import appSettings from '../../../config/settings';



const NegotiateFormComponent = props => {
  console.log({ props })
  const { showNegotiate, config: { currency } } = props;
  const currencyConfig = appSettings.getCurrencyFormatting(currency);
  
  return showNegotiate ? (<FinalForm
    onSubmit={props.onSubmit}
    render={formProps => {
      const {
        handleSubmit
      } = formProps;

      return (
        <Form className={css.actionButtons} onSubmit={handleSubmit}>
          <FieldCurrencyInput
            name="negotiatedTotal"
            id="negotiatedTotal"
            currencyConfig={currencyConfig}
            label="Suggested total price"
            placeholder="Suggest a total price..."
          />

          <PrimaryButton
            type="submit"
            className={css.negotiate}
          >
            Suggest a new total price
          </PrimaryButton>
        </Form>
      );
    }}
  />) : null;
  };

NegotiateFormComponent.defaultProps = { className: null, rootClassName: null, sendNegotiateError: null };

const { bool, func, string } = PropTypes;

NegotiateFormComponent.propTypes = {
  onSubmit: func.isRequired,
};

const NegotiateForm = compose(injectIntl)(NegotiateFormComponent);
NegotiateForm.displayName = 'NegotiateForm';

export default NegotiateForm;