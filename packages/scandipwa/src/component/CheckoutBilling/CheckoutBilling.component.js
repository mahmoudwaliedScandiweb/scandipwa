/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import CheckoutAddressBook from 'Component/CheckoutAddressBook';
import CheckoutPayments from 'Component/CheckoutPayments';
import CheckoutTermsAndConditionsPopup from 'Component/CheckoutTermsAndConditionsPopup';
import Field from 'Component/PureForm/Field';
import FIELD_TYPE from 'Component/PureForm/Field/Field.config';
import Form from 'Component/PureForm/Form';
import { STORE_IN_PICK_UP_METHOD_CODE } from 'Component/StoreInPickUp/StoreInPickUp.config';
import { BILLING_STEP } from 'Route/Checkout/Checkout.config';
import { Addresstype } from 'Type/Account';
import { PaymentMethodsType } from 'Type/Checkout';
import { TotalsType } from 'Type/MiniCart';
import { formatPrice } from 'Util/Price';

import './CheckoutBilling.style';

/** @namespace Component/CheckoutBilling/Component */
export class CheckoutBilling extends PureComponent {
    state = {
        isOrderButtonVisible: true,
        isOrderButtonEnabled: true,
        isTermsAndConditionsAccepted: false
    };

    static propTypes = {
        setLoading: PropTypes.func.isRequired,
        setDetailsStep: PropTypes.func.isRequired,
        isSameAsShipping: PropTypes.bool.isRequired,
        termsAreEnabled: PropTypes.bool.isRequired,
        onSameAsShippingChange: PropTypes.func.isRequired,
        onPaymentMethodSelect: PropTypes.func.isRequired,
        onBillingSuccess: PropTypes.func.isRequired,
        onBillingError: PropTypes.func.isRequired,
        onAddressSelect: PropTypes.func.isRequired,
        showPopup: PropTypes.func.isRequired,
        paymentMethods: PaymentMethodsType.isRequired,
        totals: TotalsType.isRequired,
        cartTotalSubPrice: PropTypes.number.isRequired,
        shippingAddress: Addresstype.isRequired,
        termsAndConditions: PropTypes.arrayOf(PropTypes.shape({
            checkbox_text: PropTypes.string
        })).isRequired,
        selectedShippingMethod: PropTypes.string.isRequired
    };

    componentDidMount() {
        const { termsAreEnabled } = this.props;

        if (!termsAreEnabled) {
            this.setState({ isOrderButtonEnabled: true });
        }
    }

    setOrderButtonVisibility = (isOrderButtonVisible) => {
        this.setState({ isOrderButtonVisible });
    };

    setOrderButtonEnableStatus = (isOrderButtonEnabled) => {
        this.setState({ isOrderButtonEnabled });
    };

    setTACAccepted = () => {
        this.setState(({ isTermsAndConditionsAccepted: oldIsTACAccepted }) => ({
            isTermsAndConditionsAccepted: !oldIsTACAccepted
        }));
    };

    handleShowPopup = (e) => {
        const { showPopup } = this.props;
        e.preventDefault();
        showPopup();
    };

    renderTermsAndConditions() {
        const {
            termsAreEnabled,
            termsAndConditions
        } = this.props;

        const {
            checkbox_text = __('I agree to terms and conditions')
        } = termsAndConditions[0] || {};

        const { isTermsAndConditionsAccepted } = this.state;

        if (!termsAreEnabled) {
            return null;
        }

        return (
            <div
              block="CheckoutBilling"
              elem="TermsAndConditions"
            >
                <Field
                  type={ FIELD_TYPE.checkbox }
                  attr={ {
                      id: 'termsAndConditions',
                      name: 'termsAndConditions',
                      value: 'termsAndConditions',
                      checked: isTermsAndConditionsAccepted
                  } }
                  events={ {
                      onChange: this.setTACAccepted
                  } }
                  mix={ { block: 'CheckoutBilling', elem: 'TermsAndConditions-Checkbox' } }
                />
                <label
                  block="CheckoutBilling"
                  elem="TACLabel"
                  htmlFor="termsAndConditions"
                >
                    { `${checkbox_text } - ` }
                    <button
                      block="CheckoutBilling"
                      elem="TACLink"
                      onClick={ this.handleShowPopup }
                    >
                        { __('read more') }
                    </button>
                </label>
            </div>
        );
    }

    renderOrderTotalExlTax() {
        const {
            cartTotalSubPrice,
            totals: { quote_currency_code }
        } = this.props;

        if (!cartTotalSubPrice) {
            return null;
        }

        const orderTotalExlTax = formatPrice(cartTotalSubPrice, quote_currency_code);

        return (
            <span>
                { `${ __('Excl. tax:') } ${ orderTotalExlTax }` }
            </span>
        );
    }

    renderOrderTotal() {
        const { totals: { grand_total, quote_currency_code } } = this.props;

        const orderTotal = formatPrice(grand_total, quote_currency_code);

        return (
            <dl block="Checkout" elem="OrderTotal">
                <dt>
                    { __('Order total:') }
                </dt>
                <dd>
                    { orderTotal }
                    { this.renderOrderTotalExlTax() }
                </dd>
            </dl>
        );
    }

    renderActions() {
        const {
            isOrderButtonVisible,
            isOrderButtonEnabled,
            isTermsAndConditionsAccepted
        } = this.state;

        const { termsAreEnabled } = this.props;

        if (!isOrderButtonVisible) {
            return null;
        }

        // if terms and conditions are enabled, validate for acceptance
        const isDisabled = termsAreEnabled
            ? !isOrderButtonEnabled || !isTermsAndConditionsAccepted
            : !isOrderButtonEnabled;

        return (
            <div block="Checkout" elem="StickyButtonWrapper">
                { this.renderOrderTotal() }
                <button
                  type="submit"
                  block="Button"
                  disabled={ isDisabled }
                  mix={ { block: 'CheckoutBilling', elem: 'Button' } }
                >
                    { __('Complete order') }
                </button>
            </div>
        );
    }

    renderAddressBook() {
        const {
            onAddressSelect,
            isSameAsShipping,
            totals: { is_virtual }
        } = this.props;

        if (isSameAsShipping && !is_virtual) {
            return null;
        }

        return (
            <CheckoutAddressBook
              onAddressSelect={ onAddressSelect }
              isBilling
              is_virtual
            />
        );
    }

    renderSameAsShippingCheckbox() {
        const {
            isSameAsShipping,
            onSameAsShippingChange,
            totals: { is_virtual },
            selectedShippingMethod
        } = this.props;

        if (is_virtual) {
            return null;
        }

        return (
            <Field
              type={ FIELD_TYPE.checkbox }
              attr={ {
                  id: 'sameAsShippingAddress',
                  name: 'sameAsShippingAddress',
                  value: 'sameAsShippingAddress',
                  checked: isSameAsShipping && selectedShippingMethod !== STORE_IN_PICK_UP_METHOD_CODE
              } }
              events={ {
                  onChange: onSameAsShippingChange
              } }
              mix={ { block: 'CheckoutBilling', elem: 'Checkbox' } }
              label={ __('My billing and shipping are the same') }
              onChange={ onSameAsShippingChange }
              isDisabled={ selectedShippingMethod === STORE_IN_PICK_UP_METHOD_CODE }
            />
        );
    }

    renderHeading() {
        return (
            <h2 block="Checkout" elem="Heading">
                { __('Billing address') }
            </h2>
        );
    }

    renderAddresses() {
        return (
            <>
                { this.renderHeading() }
                { this.renderSameAsShippingCheckbox() }
                { this.renderAddressBook() }
            </>
        );
    }

    renderPayments() {
        const {
            paymentMethods,
            onPaymentMethodSelect,
            setLoading,
            setDetailsStep,
            shippingAddress
        } = this.props;

        if (!paymentMethods.length) {
            return null;
        }

        return (
            <CheckoutPayments
              setLoading={ setLoading }
              setDetailsStep={ setDetailsStep }
              paymentMethods={ paymentMethods }
              onPaymentMethodSelect={ onPaymentMethodSelect }
              setOrderButtonVisibility={ this.setOrderButtonVisibility }
              billingAddress={ shippingAddress }
              setOrderButtonEnableStatus={ this.setOrderButtonEnableStatus }
            />
        );
    }

    renderPopup() {
        return <CheckoutTermsAndConditionsPopup />;
    }

    render() {
        const { onBillingSuccess, onBillingError } = this.props;

        return (
            <Form
              attr={ {
                  id: BILLING_STEP
              } }
              mix={ { block: 'CheckoutBilling' } }
              onError={ onBillingError }
              onSubmit={ onBillingSuccess }
            >
                { this.renderAddresses() }
                { this.renderPayments() }
                { this.renderTermsAndConditions() }
                { this.renderActions() }
                { this.renderPopup() }
            </Form>
        );
    }
}

export default CheckoutBilling;
