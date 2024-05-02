import { storableError } from '../../util/errors';
import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { createImageVariantConfig } from '../../util/sdkLoader';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
export const ASSET_NAME = 'landing-page';
export const recommendedSectionId = 'recommended-listings';

// ================ Action types ================ //

export const FETCH_LISTINGS_REQUEST = 'app/LandingPage/FETCH_LISTINGS_REQUEST';
export const FETCH_LISTINGS_SUCCESS = 'app/SearchPage/FETCH_LISTINGS_SUCCESS';
export const FETCH_LISTINGS_ERROR = 'app/SearchPage/FETCH_LISTINGS_ERROR';

// ================ Reducer ================ //
const initialState = {
  fetchInProgress: true,
  currentPageResultIds: [],
  fetchListingsError: null,
};

const landingPageReducer = (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case FETCH_LISTINGS_REQUEST:
      return {
        ...state,
        fetchInProgress: true,
        fetchListingsError: null,
      };
    case FETCH_LISTINGS_SUCCESS:
      return {
        ...state,
        currentPageResultIds: resultIds(payload.data),
        fetchInProgress: false,
      };
    case FETCH_LISTINGS_ERROR:
      // eslint-disable-next-line no-console
      console.error(payload);
      return { ...state, fetchInProgress: false, fetchListingsError: payload };

    default:
      return state;
  }
};

export default landingPageReducer;

const resultIds = data => data.data.map(l => l.id);

// Action creators

export const fetchListingsRequest = searchParams => ({
  type: FETCH_LISTINGS_REQUEST,
  payload: { searchParams },
});

export const fetchListingsSuccess = response => ({
  type: FETCH_LISTINGS_SUCCESS,
  payload: { data: response.data },
});

export const fetchListingsError = e => ({
  type: FETCH_LISTINGS_ERROR,
  error: true,
  payload: e,
});

const getListingParams = (config, listingIds) => {
  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;

  const aspectRatio = aspectHeight / aspectWidth;

  return {
    ids: listingIds,
    include: ['author', 'images'],
    'fields.listing': ['title', 'price', 'publicData.transactionProcessAlias'],
    'fields.user': ['profile.displayName', 'profile.abbreviatedName'],
    'fields.image': [
      'variants.scaled-small',
      'variants.scaled-medium',
      `variants.${variantPrefix}`,
      `variants.${variantPrefix}-2x`,
    ],
    ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
    ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
    'limit.images': 1,
  };
};

const fetchRecommendedListings = (searchParams, config) => (dispatch, getState, sdk) => {
  dispatch(fetchListingsRequest());

  sdk.listings
    .query(searchParams)
    .then(response => {
      const listingFields = config?.listing?.listingFields;
      const sanitizeConfig = { listingFields };

      dispatch(addMarketplaceEntities(response, sanitizeConfig));
      dispatch(fetchListingsSuccess(response));
      return response;
    })
    .catch(e => {
      dispatch(fetchListingsError(storableError(e)));
      throw e;
    });
};

export const loadData = (params, search, config) => dispatch => {
  const pageAsset = { landingPage: `content/pages/${ASSET_NAME}.json` };

  dispatch(fetchPageAssets(pageAsset, true)).then(assetResp => {
    // Get listing ids from custom recommended listings section
    const customSection = assetResp.landingPage?.data?.sections.find(
      s => s.sectionId === recommendedSectionId
    );

    if (customSection) {
      const recommendedListingIds = customSection?.blocks.map(b => b.blockName);
      const listingParams = getListingParams(config, recommendedListingIds);
      dispatch(fetchRecommendedListings(listingParams, config));
    } else {
      console.log('no custom section!')
    }
  });
};
