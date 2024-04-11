import React from 'react';
import { func, node, shape, string } from 'prop-types';
import { useIntl } from '../../../../util/reactIntl';

import Field, { hasDataInFields } from '../../Field';

import css from './SectionCurrentUser.module.css';
import { propTypes } from '../../../../util/types';

// Section component that's able to show article content
// The article content is mainly supposed to be inside a block
const SectionCurrentUser = props => {
  const { defaultClasses, options, currentUser } = props;

  if (!currentUser) {
    return null;
  }
  const intl = useIntl();

  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const fieldComponents = options?.fieldComponents;
  const fieldOptions = { fieldComponents };

  const titleContent = intl.formatMessage(
    { id: 'LandingPageSectionCurrentUser.title' },
    { firstName: currentUser.attributes.profile.firstName }
  );
  const callToActionContent = intl.formatMessage({
    id: 'LandingPageSectionCurrentUser.callToAction',
  });

  const title = {
    fieldType: 'heading2',
    content: `Welcome, ${currentUser.attributes.profile.firstName}!`,
    // content: intl.formatMessage(
    //   { id: 'LandingPageSectionCurrentUser.title' },
    //   { firstName: currentUser.attributes.profile.firstName }
    // ),
  };

  const callToAction = {
    content: 'View your public user profile',
    // content: intl.formatMessage({
    //   id: 'LandingPageSectionCurrentUser.callToAction',
    // }),
    fieldType: 'internalButtonLink',
    href: `/u/${currentUser.id.uuid}`,
  };

  const hasHeaderFields = hasDataInFields([title, callToAction], fieldOptions);

  return (
    <div className={css.userContainer}>
      {hasHeaderFields ? (
        <header className={defaultClasses.sectionDetails}>
          <Field data={title} className={defaultClasses.title} options={fieldOptions} />
          <Field data={callToAction} className={defaultClasses.ctaButton} options={fieldOptions} />
        </header>
      ) : null}
    </div>
  );
};

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
});

SectionCurrentUser.defaultProps = {
  defaultClasses: null,
  options: null,
  currentUser: null,
};

SectionCurrentUser.propTypes = {
  sectionId: string.isRequired,
  defaultClasses: shape({
    sectionDetails: string,
    title: string,
    description: string,
    ctaButton: string,
  }),
  options: propTypeOption,
  currentUser: propTypes.currentUser,
};

export default SectionCurrentUser;
