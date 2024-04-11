import React from 'react';
import { func, node, shape, string } from 'prop-types';

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

  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const fieldComponents = options?.fieldComponents;
  const fieldOptions = { fieldComponents };

  const title = {
    fieldType: 'heading2',
    content: `Welcome, ${currentUser.attributes.profile.firstName}!`,
  };

  const callToAction = {
    content: 'View your public user profile',
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
  className: null,
  rootClassName: null,
  defaultClasses: null,
  textClassName: null,
  title: null,
  appearance: null,
  callToAction: null,
  blocks: [],
  isInsideContainer: false,
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
