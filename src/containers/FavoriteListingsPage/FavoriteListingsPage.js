import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import { H3, Page, PaginationLinks, UserNav, Footer, LayoutSingleColumn, ListingCard } from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';

import { closeListing, openListing, getOwnListingsById } from './FavoriteListingsPage.duck';
import css from './FavoriteListingsPage.module.css';
import { getListingsById } from '../../ducks/marketplaceData.duck';

export class FavoriteListingsPageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = { listingMenuOpen: null };
    this.onToggleMenu = this.onToggleMenu.bind(this);
  }

  onToggleMenu(listing) {
    this.setState({ listingMenuOpen: listing });
  }

  render() {
    const {
      closingListing,
      closingListingError,
      listings,
      onCloseListing,
      onOpenListing,
      openingListing,
      openingListingError,
      pagination,
      queryInProgress,
      queryListingsError,
      queryParams,
      scrollingDisabled,
      intl,
    } = this.props;

    const hasPaginationInfo = !!pagination && pagination.totalItems != null;
    const listingsAreLoaded = !queryInProgress && hasPaginationInfo;

    const loadingResults = (
      <div className={css.messagePanel}>
        <H3 as="h2" className={css.heading}>
          <FormattedMessage id="FavoriteListingsPage.loadingOwnListings" />
        </H3>
      </div>
    );

    const queryError = (
      <div className={css.messagePanel}>
        <H3 as="h2" className={css.heading}>
          <FormattedMessage id="FavoriteListingsPage.queryError" />
        </H3>
      </div>
    );

    const noResults =
      listingsAreLoaded && pagination.totalItems === 0 ? (
        <H3 as="h1" className={css.heading}>
          <FormattedMessage id="FavoriteListingsPage.noResults" />
        </H3>
      ) : null;

    const heading =
      listingsAreLoaded && pagination.totalItems > 0 ? (
        <H3 as="h1" className={css.heading}>
          <FormattedMessage
            id="FavoriteListingsPage.youHaveListings"
            values={{ count: pagination.totalItems }}
          />
        </H3>
      ) : (
        noResults
      );

    const page = queryParams ? queryParams.page : 1;
    const paginationLinks =
      listingsAreLoaded && pagination && pagination.totalPages > 1 ? (
        <PaginationLinks
          className={css.pagination}
          pageName="FavoriteListingsPage"
          pageSearchParams={{ page }}
          pagination={pagination}
        />
      ) : null;

    const listingMenuOpen = this.state.listingMenuOpen;
    const closingErrorListingId = !!closingListingError && closingListingError.listingId;
    const openingErrorListingId = !!openingListingError && openingListingError.listingId;

    const title = intl.formatMessage({ id: 'FavoriteListingsPage.title' });

    const panelWidth = 62.5;
    // Render hints for responsive image
    const renderSizes = [
      `(max-width: 767px) 100vw`,
      `(max-width: 1920px) ${panelWidth / 2}vw`,
      `${panelWidth / 3}vw`,
    ].join(', ');

    return (
      <Page title={title} scrollingDisabled={scrollingDisabled}>
        <LayoutSingleColumn
          topbar={
            <>
              <TopbarContainer currentPage="FavoriteListingsPage" />
              <UserNav currentPage="FavoriteListingsPage" />
            </>
          }
          footer={<Footer />}
        >
          {queryInProgress ? loadingResults : null}
          {queryListingsError ? queryError : null}
          <div className={css.listingPanel}>
            {heading}
            <div className={css.listingCards}>
              {listings.map(l => (
                <ListingCard
                  className={css.listingCard}
                  key={l.id.uuid}
                  listing={l}
                  isMenuOpen={!!listingMenuOpen && listingMenuOpen.id.uuid === l.id.uuid}
                  actionsInProgressListingId={openingListing || closingListing}
                  onToggleMenu={this.onToggleMenu}
                  onCloseListing={onCloseListing}
                  onOpenListing={onOpenListing}
                  hasOpeningError={openingErrorListingId.uuid === l.id.uuid}
                  hasClosingError={closingErrorListingId.uuid === l.id.uuid}
                  renderSizes={renderSizes}
                />
              ))}
            </div>
            {paginationLinks}
          </div>
        </LayoutSingleColumn>
      </Page>
    );
  }
}

FavoriteListingsPageComponent.defaultProps = {
  listings: [],
  pagination: null,
  queryListingsError: null,
  queryParams: null,
  closingListing: null,
  closingListingError: null,
  openingListing: null,
  openingListingError: null,
};

const { arrayOf, bool, func, object, shape, string } = PropTypes;

FavoriteListingsPageComponent.propTypes = {
  closingListing: shape({ uuid: string.isRequired }),
  closingListingError: shape({
    listingId: propTypes.uuid.isRequired,
    error: propTypes.error.isRequired,
  }),
  listings: arrayOf(propTypes.listing),
  onCloseListing: func.isRequired,
  onOpenListing: func.isRequired,
  openingListing: shape({ uuid: string.isRequired }),
  openingListingError: shape({
    listingId: propTypes.uuid.isRequired,
    error: propTypes.error.isRequired,
  }),
  pagination: propTypes.pagination,
  queryInProgress: bool.isRequired,
  queryListingsError: propTypes.error,
  queryParams: object,
  scrollingDisabled: bool.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const {
    currentPageResultIds,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    openingListing,
    openingListingError,
    closingListing,
    closingListingError,
  } = state.FavoriteListingsPage;
  const listings = getListingsById(state, currentPageResultIds);
  return {
    currentPageResultIds,
    listings,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    scrollingDisabled: isScrollingDisabled(state),
    openingListing,
    openingListingError,
    closingListing,
    closingListingError,
  };
};

const mapDispatchToProps = dispatch => ({
  onCloseListing: listingId => dispatch(closeListing(listingId)),
  onOpenListing: listingId => dispatch(openListing(listingId)),
});

const FavoriteListingsPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(FavoriteListingsPageComponent);

export default FavoriteListingsPage;
