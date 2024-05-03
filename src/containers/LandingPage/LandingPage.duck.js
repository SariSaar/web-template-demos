import { storableError } from '../../util/errors';
import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { createImageVariantConfig } from '../../util/sdkLoader';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
export const ASSET_NAME = 'landing-page';
export const recommendedSectionId = 'recommended-listings';

// ================ Action types ================ //

export const FETCH_ASSETS_SUCCESS = 'app/LandingPage/FETCH_ASSETS_SUCCESS';
export const FETCH_LISTINGS_REQUEST = 'app/LandingPage/FETCH_LISTINGS_REQUEST';
export const FETCH_LISTINGS_SUCCESS = 'app/SearchPage/FETCH_LISTINGS_SUCCESS';
export const FETCH_LISTINGS_ERROR = 'app/SearchPage/FETCH_LISTINGS_ERROR';

// ================ Reducer ================ //
const initialState = {
  fetchInProgress: false,
  currentPageResultIds: [],
  fetchListingsError: null,
  recommendedListingIds: [],
};

const landingPageReducer = (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case FETCH_ASSETS_SUCCESS: 
      console.log('FETCH_ASSETS_SUCCESS');
      return {
        ...state,
        recommendedListingIds: payload,
      }
    case FETCH_LISTINGS_REQUEST:
      console.log('FETCH_LISTINGS_REQUEST');
      return {
        ...state,
        fetchInProgress: true,
        fetchListingsError: null,
      };
      case FETCH_LISTINGS_SUCCESS:
      console.log('FETCH_LISTINGS_SUCCESS')
      return {
        ...state,
        currentPageResultIds: resultIds(payload.data),
        fetchInProgress: false,
      };
      case FETCH_LISTINGS_ERROR:
      console.log('FETCH_LISTINGS_ERROR');
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

export const fetchAssetsSuccess = ids => ({
  type: FETCH_ASSETS_SUCCESS,
  payload: ids,
});

export const fetchListingsRequest = () => ({
  type: FETCH_LISTINGS_REQUEST,
  payload: {},
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

export const fetchRecommendedListings = (config, ids) => (dispatch, getState, sdk) => {
  dispatch(fetchListingsRequest());

  const searchParams = getListingParams(config, ids)
  console.log('fetching listings', { searchParams });

  sdk.listings
    .query(searchParams)
    .then(response => {
      console.log('has response');
      const listingFields = config?.listing?.listingFields;
      const sanitizeConfig = { listingFields };

      dispatch(addMarketplaceEntities(response, sanitizeConfig));
      console.log('dispatched addmarketplaceentities');
      dispatch(fetchListingsSuccess(response));
      console.log('dispatched fetchlistingssuccess');
      return response;
    })
    .catch(e => {
      dispatch(fetchListingsError(storableError(e)));
      throw e;
    });
};

export const loadData = (params, search, config) => (dispatch, getState) => {
  const pageAsset = { landingPage: `content/pages/${ASSET_NAME}.json` };
  const state = getState().LandingPage;
  const { fetchInProgress } = state;
  console.log('loadData', { fetchInProgress }, { state })

  return dispatch(fetchPageAssets(pageAsset, true)).then(assetResp => {
    // Get listing ids from custom recommended listings section
    const customSection = assetResp.landingPage?.data?.sections.find(
      s => s.sectionId === recommendedSectionId
    );

    console.log('loadData', { customSection }, { fetchInProgress })

    if (customSection && !fetchInProgress) {
      const recommendedListingIds = customSection?.blocks.map(b => b.blockName);
      console.log({ recommendedListingIds });
      dispatch(fetchAssetsSuccess(recommendedListingIds))
    }
  });
};
