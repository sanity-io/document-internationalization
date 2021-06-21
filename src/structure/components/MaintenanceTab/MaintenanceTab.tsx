import React from 'react';
import styles from './MaintenanceTab.scss';
import classNames from 'classnames';
import { MaintenanceTabTypeSelector } from '../MaintenanceTabTypeSelector';
import { useDocumentsInformation } from '../../hooks';
import { MaintenanceTabResult } from '../MaintenanceTabResult';
import { fixBaseLanguageMismatch, fixIdStructureMismatchDocuments, fixLanguageFields, fixOrphanedDocuments, fixReferenceBehaviorMismatch, fixTranslationRefs } from '../../utils';

export const MaintenanceTab: React.FunctionComponent = () => {
  const [selectedSchema, setSelectedSchema] = React.useState('');
  const {
    pending,
    setPending,
    documents,
    baseDocuments,
    translatedDocuments,
    documentsSummaryInformation,
    fetchInformation,
  } = useDocumentsInformation(selectedSchema);

  const onSchemaTypeChange = React.useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchema(event.currentTarget.value);
  }, [selectedSchema]);

  const onFixIdStructureMismatchDocuments = React.useCallback(async () => {
    setPending(true);
    await fixIdStructureMismatchDocuments(selectedSchema, documents);
    await fetchInformation(selectedSchema);
  }, [selectedSchema, documents, fetchInformation]);

  const onFixMissingLanguageFields = React.useCallback(async () => {
    setPending(true);
    await fixLanguageFields(selectedSchema, documents);
    await fetchInformation(selectedSchema);
  }, [selectedSchema, documents, fetchInformation]);

  const onFixTranslationRefs = React.useCallback(async () => {
    setPending(true);
    await fixTranslationRefs(selectedSchema, baseDocuments, translatedDocuments);
    await fetchInformation(selectedSchema);
  }, [selectedSchema, baseDocuments, translatedDocuments, fetchInformation]);

  const onFixOrphanDocuments = React.useCallback(async () => {
    setPending(true);
    await fixOrphanedDocuments(baseDocuments, translatedDocuments);
    await fetchInformation(selectedSchema);
  }, [selectedSchema, baseDocuments, translatedDocuments, fetchInformation]);

  const onFixReferenceBehaviorMismatch = React.useCallback(async () => {
    setPending(true);
    await fixReferenceBehaviorMismatch(selectedSchema, baseDocuments, translatedDocuments);
    await fetchInformation(selectedSchema);
  }, [selectedSchema, baseDocuments, translatedDocuments]);

  const onFixBaseLanguageMismatch = React.useCallback(async () => {
    setPending(true);
    await fixBaseLanguageMismatch(selectedSchema, baseDocuments);
    await fetchInformation(selectedSchema);
  }, [selectedSchema, baseDocuments, fetchInformation]);

  return (
    <div
      className={classNames({
        [styles.root]: true,
        [styles.disabled]: pending,
      })}
    >
      <MaintenanceTabTypeSelector
        value={selectedSchema}
        onChange={onSchemaTypeChange}
      />
      {(!!selectedSchema) && (
        <div className={styles.dashboard}>
          <MaintenanceTabResult
            pending={pending}
            count={documentsSummaryInformation.idStructureMismatch.length}
            labelName="idStructureMismatch"
            onClick={onFixIdStructureMismatchDocuments}
          />
          <MaintenanceTabResult
            pending={pending}
            count={documentsSummaryInformation.missingLanguageField.length}
            labelName="missingLanguageField"
            onClick={onFixMissingLanguageFields}
          />
          <MaintenanceTabResult
            pending={pending}
            count={documentsSummaryInformation.missingDocumentRefs.length}
            labelName="missingDocumentRefs"
            onClick={onFixTranslationRefs}
          />
          <MaintenanceTabResult
            pending={pending}
            count={documentsSummaryInformation.orphanDocuments.length}
            labelName="orphanDocuments"
            onClick={onFixOrphanDocuments}
          />
          <MaintenanceTabResult
            pending={pending}
            count={documentsSummaryInformation.referenceBehaviorMismatch.length}
            labelName="referenceBehaviorMismatch"
            onClick={onFixReferenceBehaviorMismatch}
          />
          <MaintenanceTabResult
            pending={pending}
            count={documentsSummaryInformation.baseLanguageMismatch.length}
            labelName="baseLanguageMismatch"
            onClick={onFixBaseLanguageMismatch}
          />
        </div>
      )}
    </div>
  )
}