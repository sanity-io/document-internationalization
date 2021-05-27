import React from 'react';
import styles from './MaintenanceTabResult.scss';
import { TMessagesConfig } from '../../../types';
import { getConfig } from '../../../utils';

type Props = {
  pending?: boolean;
  count: number;
  labelName?: keyof NonNullable<TMessagesConfig['translationsMaintenance']>;
  onClick?: (event: React.SyntheticEvent<HTMLButtonElement, Event>) => void;
}

export const MaintenanceTabResult: React.FunctionComponent<Props> = ({
  pending,
  count,
  labelName,
  children,
  onClick,
}) => {
  const config = getConfig();

  return (
    <div className={styles.entry}>
      <p>{count} {labelName ? config?.messages?.translationsMaintenance?.[labelName] : children}</p>
      {(count > 0) && (
        <button disabled={pending} onClick={onClick}>{config?.messages?.translationsMaintenance?.fix}</button>
      )}
    </div>
  )
}