import React from 'react';
import styles from './MaintenanceTabTypeSelector.scss';
import schemas from 'part:@sanity/base/schema';
import { getConfig } from '../../../utils';
import { Ti18nSchema } from '../../../types';
import { ChevronDown } from '../ChevronDown';

type Props = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const MaintenanceTabTypeSelector: React.FunctionComponent<Props> = ({
  value,
  onChange,
}) => {
  const config = React.useMemo(() => getConfig(), []);
  const i18nSchemas = React.useMemo(() => (
    schemas._original.types.filter(s => !!s.i18n) as Ti18nSchema[]
  ), []);

  return (
    <div className={styles.schemaselect}>
      <select onChange={onChange} value={value}>
        <option selected disabled value="">{config.messages?.translationsMaintenance?.selectSchemaPlaceholder}</option>
        {i18nSchemas.map(s => (
          <option key={s.name} value={s.name}>
            {s.title}
          </option>
        ))}
      </select>
      <ChevronDown />
    </div>
  );
}