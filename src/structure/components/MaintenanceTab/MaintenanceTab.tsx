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
    await fixIdStructureMismatchDocuments(selectedSchema, documents);
    await fetchInformation(selectedSchema);
  }, [selectedSchema, documents, fetchInformation]);

  const onFixMissingLanguageFields = React.useCallback(async () => {
    await fixLanguageFields(selectedSchema, documents);
    await fetchInformation(selectedSchema);
  }, [selectedSchema, documents, fetchInformation]);

  const onFixTranslationRefs = React.useCallback(async () => {
    await fixTranslationRefs(selectedSchema, baseDocuments, translatedDocuments);
    await fetchInformation(selectedSchema);
  }, [selectedSchema, baseDocuments, translatedDocuments, fetchInformation]);

  const onFixOrphanDocuments = React.useCallback(async () => {
    await fixOrphanedDocuments(baseDocuments, translatedDocuments);
    await fetchInformation(selectedSchema);
  }, [selectedSchema, baseDocuments, translatedDocuments, fetchInformation]);

  const onFixReferenceBehaviorMismatch = React.useCallback(async () => {
    await fixReferenceBehaviorMismatch(selectedSchema, baseDocuments, translatedDocuments);
    await fetchInformation(selectedSchema);
  }, [selectedSchema, baseDocuments, translatedDocuments]);

  const onFixBaseLanguageMismatch = React.useCallback(async () => {
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
            count={documentsSummaryInformation.idStructureMismatch.length}
            labelName="idStructureMismatch"
            onClick={onFixIdStructureMismatchDocuments}
          />
          <MaintenanceTabResult
            count={documentsSummaryInformation.missingLanguageField.length}
            labelName="missingLanguageField"
            onClick={onFixMissingLanguageFields}
          />
          <MaintenanceTabResult
            count={documentsSummaryInformation.missingDocumentRefs.length}
            labelName="missingDocumentRefs"
            onClick={onFixTranslationRefs}
          />
          <MaintenanceTabResult
            count={documentsSummaryInformation.orphanDocuments.length}
            labelName="orphanDocuments"
            onClick={onFixOrphanDocuments}
          />
          <MaintenanceTabResult
            count={documentsSummaryInformation.referenceBehaviorMismatch.length}
            labelName="referenceBehaviorMismatch"
            onClick={onFixReferenceBehaviorMismatch}
          />
          <MaintenanceTabResult
            count={documentsSummaryInformation.baseLanguageMismatch.length}
            labelName="baseLanguageMismatch"
            onClick={onFixBaseLanguageMismatch}
          />
        </div>
      )}
    </div>
  )
}