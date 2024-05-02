import React from 'react';
import loadable from '@loadable/component';

import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';

import FallbackPage from './FallbackPage';
import { ASSET_NAME, recommendedSectionId } from './LandingPage.duck';
import { getListingsById } from '../../ducks/marketplaceData.duck';


const PageBuilder = loadable(() =>
import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

const recommendedSectionType = 'recommended';
const userSectionType = 'user';

export const LandingPageComponent = props => {
  const { pageAssetsData, listings, inProgress, error, currentUser } = props;

  // Construct custom page data
  const pageData = pageAssetsData?.[camelize(ASSET_NAME)]?.data;
  const recommendedSectionIdx = pageData?.sections.findIndex(
    s => s.sectionId === recommendedSectionId
  );
  const recommendedSection = pageData?.sections[recommendedSectionIdx];

  const customRecommendedSection = {
    ...recommendedSection,
    sectionId: recommendedSectionId,
    sectionType: recommendedSectionType,
    listings: listings,
  };

  const customCurrentUserSection = {
    sectionType: userSectionType,
    currentUser,
  };

  const customSections = pageData
    ? [
        customCurrentUserSection,
        ...pageData?.sections?.map((s, idx) =>
          idx === recommendedSectionIdx ? customRecommendedSection : s
        ),
      ]
    : null;

  const customPageData = pageData
    ? {
        ...pageData,
        sections: customSections,
      }
    : pageData;

  return (
    <PageBuilder
      pageAssetsData={customPageData}
      options={{
        sectionComponents: {
          // [recommendedSectionType]: { component: SectionRecommendedListings },
          // [userSectionType]: { component: SectionCurrentUser },
        },
      }}
      inProgress={inProgress}
      error={error}
      fallbackPage={<FallbackPage error={error} />}
    />
  );
};

LandingPageComponent.propTypes = {
  pageAssetsData: object,
  inProgress: bool,
  error: propTypes.error,
};

const mapStateToProps = state => {
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
  const { currentPageResultIds } = state.LandingPage;
  const { currentUser } = state.user;
  const listings = getListingsById(state, currentPageResultIds);
  return { pageAssetsData, listings, inProgress, error, currentUser };
};

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const LandingPage = compose(connect(mapStateToProps))(LandingPageComponent);

export default LandingPage;
