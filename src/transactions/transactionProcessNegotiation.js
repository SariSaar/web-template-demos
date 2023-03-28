/**
 * Transaction process graph for negotiated bookings:
 *   - negotiation-process
 */

/**
 * Transitions
 *
 * These strings must sync with values defined in Flex API,
 * since transaction objects given by API contain info about last transitions.
 * All the actions in API side happen in transitions,
 * so we need to understand what those strings mean.
 */

export const transitions = {
  // When a customer makes a booking to a listing, a transaction is
  // created with the initial request-payment transition.
  // At this transition a PaymentIntent is created by Marketplace API.
  // After this transition, the actual payment must be made on client-side directly to Stripe.
  REQUEST: 'transition/request',

  // A customer can also initiate a transaction with an inquiry, and
  // then transition that with a request.
  INQUIRE: 'transition/inquire',
  REQUEST_AFTER_INQUIRY: 'transition/request-after-inquiry',

  // In the negotiation flow, a provider first accepts the suggested price and then the customer initiates payment.
  // When the provider accepts or declines a transaction from the
  // SalePage, it is transitioned with the accept or decline transition.
  PROVIDER_ACCEPT: 'transition/provider-accept',
  PROVIDER_DECLINE: 'transition/provider-decline',

  // When the offer is accepted, the customer still needs to explicitly initiate payment
  // with the 'pay' transition, because the Stripe Payment Intent can only be created
  // after the line items have been agreed on
  PAY: 'transition/pay',

  // Stripe SDK might need to ask 3D security from customer, in a separate front-end step.
  // Therefore we need to make another transition to Marketplace API,
  // to tell that the payment is confirmed.
  CONFIRM_PAYMENT: 'transition/confirm-capture-payment',

  // If the payment is not confirmed in the time limit set in transaction process (by default 15min)
  // the transaction will expire automatically.
  EXPIRE_PAYMENT: 'transition/expire-payment',

  // The backend automatically expires the transaction.
  EXPIRE: 'transition/expire',

  // In addition to accepting or declining the customer's offer, the provider can also
  // make a counter offer. This is done with the provider-offer transition.
  PROVIDER_OFFER: 'transition/provider-offer',

  // If the provider has made an offer, the customer can, in turn, either accept, 
  // decline, or make an offer. Each option has a separate transition.
  CUSTOMER_ACCEPT: 'transition/customer-accept',
  CUSTOMER_DECLINE: 'transition/customer-decline',
  CUSTOMER_OFFER: 'transition/customer-offer',

  // Both provider and customer offers decline in a certain time frame, so that the booking
  // eventually gets released to other potential customers
  PROVIDER_OFFER_EXPIRED: 'transition/provider-offer-expired',
  CUSTOMER_OFFER_EXPIRED: 'transition/customer-offer-expired',
  
  // Admin can also cancel the transition.
  CANCEL: 'transition/cancel',

  // The backend will mark the transaction completed.
  COMPLETE: 'transition/complete',

  // Reviews are given through transaction transitions. Review 1 can be
  // by provider or customer, and review 2 will be the other party of
  // the transaction.
  REVIEW_1_BY_PROVIDER: 'transition/review-1-by-provider',
  REVIEW_2_BY_PROVIDER: 'transition/review-2-by-provider',
  REVIEW_1_BY_CUSTOMER: 'transition/review-1-by-customer',
  REVIEW_2_BY_CUSTOMER: 'transition/review-2-by-customer',
  EXPIRE_CUSTOMER_REVIEW_PERIOD: 'transition/expire-customer-review-period',
  EXPIRE_PROVIDER_REVIEW_PERIOD: 'transition/expire-provider-review-period',
  EXPIRE_REVIEW_PERIOD: 'transition/expire-review-period',
};

/**
 * States
 *
 * These constants are only for making it clear how transitions work together.
 * You should not use these constants outside of this file.
 *
 * Note: these states are not in sync with states used transaction process definitions
 *       in Marketplace API. Only last transitions are passed along transaction object.
 */
export const states = {
  INITIAL: 'initial',
  INQUIRY: 'inquiry',
  CUSTOMER_MADE_OFFER: 'customer-made-offer',
  PROVIDER_MADE_OFFER: 'provider-made-offer',

  PENDING_PAYMENT: 'pending-payment',
  PENDING_CONFIRMATION: 'pending-confirmation',
  PAYMENT_EXPIRED: 'payment-expired',
  DECLINED: 'declined',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  CANCELED: 'canceled',
  DELIVERED: 'delivered',
  REVIEWED: 'reviewed',
  REVIEWED_BY_CUSTOMER: 'reviewed-by-customer',
  REVIEWED_BY_PROVIDER: 'reviewed-by-provider',
};

/**
 * Description of transaction process graph
 *
 * You should keep this in sync with transaction process defined in Marketplace API
 *
 * Note: we don't use yet any state machine library,
 *       but this description format is following Xstate (FSM library)
 *       https://xstate.js.org/docs/
 */
export const graph = {
  // id is defined only to support Xstate format.
  // However if you have multiple transaction processes defined,
  // it is best to keep them in sync with transaction process aliases.
  id: 'negotiation-process/release-1',

  // This 'initial' state is a starting point for new transaction
  initial: states.INITIAL,

  // States
  states: {
    [states.INITIAL]: {
      on: {
        [transitions.INQUIRE]: states.INQUIRY,
        [transitions.REQUEST]: states.CUSTOMER_MADE_OFFER,
      },
    },
    [states.INQUIRY]: {
      on: {
        [transitions.REQUEST_AFTER_INQUIRY]: states.CUSTOMER_MADE_OFFER,
      },
    },
    [states.CUSTOMER_MADE_OFFER]: {
      on: {
        [transitions.PROVIDER_ACCEPT]: states.PENDING_PAYMENT,
        [transitions.PROVIDER_OFFER]: states.PROVIDER_MADE_OFFER,
        [transitions.PROVIDER_DECLINE]: states.DECLINED,
        [transitions.CUSTOMER_OFFER_EXPIRED]: states.DECLINED,
      }
    },
    [states.PROVIDER_MADE_OFFER]: {
      on: {
        [transitions.CUSTOMER_ACCEPT]: states.PENDING_PAYMENT,
        [transitions.CUSTOMER_OFFER]: states.CUSTOMER_MADE_OFFER,
        [transitions.CUSTOMER_DECLINE]: states.DECLINED,
        [transitions.PROVIDER_OFFER_EXPIRED]: states.DECLINED,
      }
    },

    [states.PENDING_PAYMENT]: {
      on: {
        [transitions.EXPIRE]: states.DECLINED,
        [transitions.PAY]: states.PENDING_CONFIRMATION,
      },
    },

    [states.PENDING_CONFIRMATION]: {
      on: {
        [transitions.CONFIRM_PAYMENT]: states.ACCEPTED,
        [transitions.EXPIRE_PAYMENT]: states.PAYMENT_EXPIRED,
      }
    },

    [states.PAYMENT_EXPIRED]: {},

    [states.DECLINED]: {},
    [states.EXPIRED]: {},
    [states.ACCEPTED]: {
      on: {
        [transitions.CANCEL]: states.CANCELED,
        [transitions.COMPLETE]: states.DELIVERED,
      },
    },

    [states.CANCELED]: {},
    [states.DELIVERED]: {
      on: {
        [transitions.EXPIRE_REVIEW_PERIOD]: states.REVIEWED,
        [transitions.REVIEW_1_BY_CUSTOMER]: states.REVIEWED_BY_CUSTOMER,
        [transitions.REVIEW_1_BY_PROVIDER]: states.REVIEWED_BY_PROVIDER,
      },
    },

    [states.REVIEWED_BY_CUSTOMER]: {
      on: {
        [transitions.REVIEW_2_BY_PROVIDER]: states.REVIEWED,
        [transitions.EXPIRE_PROVIDER_REVIEW_PERIOD]: states.REVIEWED,
      },
    },
    [states.REVIEWED_BY_PROVIDER]: {
      on: {
        [transitions.REVIEW_2_BY_CUSTOMER]: states.REVIEWED,
        [transitions.EXPIRE_CUSTOMER_REVIEW_PERIOD]: states.REVIEWED,
      },
    },
    [states.REVIEWED]: { type: 'final' },
  },
};

// Check if a transition is the kind that should be rendered
// when showing transition history (e.g. ActivityFeed)
// The first transition and most of the expiration transitions made by system are not relevant
export const isRelevantPastTransition = transition => {
  return [
    transitions.REQUEST_AFTER_INQUIRY,
    transitions.REQUEST,
    transitions.CANCEL,
    transitions.COMPLETE,
    transitions.CONFIRM_PAYMENT,
    transitions.PROVIDER_DECLINE,
    transitions.CUSTOMER_DECLINE,
    transitions.PROVIDER_OFFER,
    transitions.CUSTOMER_OFFER,

    transitions.EXPIRE,
    transitions.REVIEW_1_BY_CUSTOMER,
    transitions.REVIEW_1_BY_PROVIDER,
    transitions.REVIEW_2_BY_CUSTOMER,
    transitions.REVIEW_2_BY_PROVIDER,
  ].includes(transition);
};

// Processes might be different on how reviews are handled.
// Default processes use two-sided diamond shape, where either party can make the review first
export const isCustomerReview = transition => {
  return [transitions.REVIEW_1_BY_CUSTOMER, transitions.REVIEW_2_BY_CUSTOMER].includes(transition);
};

// Processes might be different on how reviews are handled.
// Default processes use two-sided diamond shape, where either party can make the review first
export const isProviderReview = transition => {
  return [transitions.REVIEW_1_BY_PROVIDER, transitions.REVIEW_2_BY_PROVIDER].includes(transition);
};

// Check if the given transition is privileged.
//
// Privileged transitions need to be handled from a secure context,
// i.e. the backend. This helper is used to check if the transition
// should go through the local API endpoints, or if using JS SDK is
// enough.
export const isPrivileged = transition => {
  return [transitions.REQUEST, transitions.REQUEST_AFTER_INQUIRY].includes(
    transition
  );
};

// Check when transaction is completed (booking over)
export const isCompleted = transition => {
  const txCompletedTransitions = [
    transitions.COMPLETE,
    transitions.REVIEW_1_BY_CUSTOMER,
    transitions.REVIEW_1_BY_PROVIDER,
    transitions.REVIEW_2_BY_CUSTOMER,
    transitions.REVIEW_2_BY_PROVIDER,
    transitions.EXPIRE_REVIEW_PERIOD,
    transitions.EXPIRE_CUSTOMER_REVIEW_PERIOD,
    transitions.EXPIRE_PROVIDER_REVIEW_PERIOD,
  ];
  return txCompletedTransitions.includes(transition);
};

// Check when transaction is refunded (booking did not happen)
// In these transitions action/stripe-refund-payment is called
export const isRefunded = transition => {
  const txRefundedTransitions = [
    transitions.EXPIRE_PAYMENT,
    transitions.EXPIRE,
    transitions.CANCEL,
    // TODO: Check usage => does a declined booking w/o Stripe refund require this usage?
    // transitions.PROVIDER_DECLINE,
    // transitions.CUSTOMER_DECLINE,
  ];
  return txRefundedTransitions.includes(transition);
};

export const statesNeedingProviderAttention = [states.CUSTOMER_MADE_OFFER];
export const statesNeedingCustomerAttention = [states.PROVIDER_MADE_OFFER, states.PENDING_PAYMENT];