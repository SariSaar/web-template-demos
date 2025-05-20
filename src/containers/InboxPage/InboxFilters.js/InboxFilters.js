import { FieldCheckbox } from '../../../components';
import { SCHEMA_TYPE_BOOLEAN, SCHEMA_TYPE_ENUM, SCHEMA_TYPE_MULTI_ENUM } from '../../../util/types';
import BookingDateRangeFilter from '../../SearchPage/BookingDateRangeFilter/BookingDateRangeFilter';
import FilterForm from '../../SearchPage/FilterForm/FilterForm';
import SelectMultipleFilter from '../../SearchPage/SelectMultipleFilter/SelectMultipleFilter';
import SelectSingleFilter from '../../SearchPage/SelectSingleFilter/SelectSingleFilter';

const InboxFiltersComponent = props => {
  const { config, onHandleChangedValueFn, ...rest } = props;

  const { key, schemaType, label } = config;

  switch (schemaType) {
    case SCHEMA_TYPE_ENUM: {
      const { options } = config;
      return (
        <SelectSingleFilter
          id={key}
          name={key}
          label={label}
          options={options}
          onSubmit={onHandleChangedValueFn}
          queryParamNames={[key]}
          {...rest}
        />
      );
    }
    case SCHEMA_TYPE_MULTI_ENUM: {
      const { options } = config;
      return (
        <SelectMultipleFilter
          options={options}
          label={label}
          id={key}
          name={key}
          onSubmit={onHandleChangedValueFn}
          schemaType={schemaType}
          queryParamNames={[key]}
          {...rest}
        />
      );
    }
    case 'dates': {
      return (
        <div className={rest.className}>
          <BookingDateRangeFilter
            label={`${label} start`}
            key={'bookingStart'}
            id={'bookingStart'}
            name={'bookingStart'}
            queryParamNames={['bookingStart']}
            onSubmit={values => onHandleChangedValueFn(values, 'bookingStart')}
            liveEdit
            {...rest}
          />
          <BookingDateRangeFilter
            label={`${label} end`}
            key={'bookingEnd'}
            id={'bookingEnd'}
            name={'bookingEnd'}
            queryParamNames={['bookingEnd']}
            onSubmit={values => onHandleChangedValueFn(values, 'bookingEnd')}
            liveEdit
            {...rest}
          />
        </div>
      );
    }
    default: {
      return null;
    }
  }
};

export default InboxFiltersComponent;
