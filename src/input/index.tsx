import 'regenerator-runtime';
import * as React from 'react';
import slugify from 'slugify';
import styles from './input.scss';
import PatchEvent, { setIfMissing, unset, set } from '@sanity/form-builder/lib/PatchEvent';
import Field from '@sanity/form-builder/lib/inputs/ObjectInput/Field';
import { IType } from '../types/IType';
import { ILanguageQuery } from '../types/ILanguageQuery';
import { ILanguageObject } from '../types/ILanguageObject';
import { Tlanguage } from '../types/TLanguage';
import { getBaseLanguage, getSanityClient, getLanguagesFromOption, getConfig } from '../utils';

interface IField {
  name: string;
  type: IType;
}

interface IProps {
  type: IType;
  isRoot?: boolean
  value?: { [key: string]: any };
  markers?: any[];
  readOnly?: boolean;
  focusPath?: any[];
  onChange?: (...args: any[]) => any;
  onFocus: (...args: any[]) => any;
  onBlur: (...args: any[]) => any;
  filterField?: (...args: any[]) => any;
}

interface IState {
  currentLanguage: ILanguageObject | null;
  fetchingLanguages: boolean;
  languages: ILanguageObject[];
}

const createSlug = (input: string) => slugify(input, { replacement: '_' }).replace(/-/g, '_');

class Input extends React.PureComponent<IProps, IState> {
  public state: IState = {
    currentLanguage: null,
    fetchingLanguages: false,
    languages: [],
  }

  private get missingTranslations() {
    const { languages } = this.state;
    const { type: { options }, value } = this.props;
    if (languages.length === 0) return [];
    const existingValues = (() => {
      const l = getBaseLanguage(languages, options.base);
      if (l) {
        const slug = createSlug(l.name);
        const v = (value && value[slug]) || {};
        return Object.keys(v).filter(k => !!v[k]);
      }
      return [];
    })();
    return languages.filter((l, index) => {
      if (index === 0) return false;
      const slug = createSlug(l.name);
      const fieldValue = (value && value[slug]) || {};
      const missingKeys = existingValues.filter(k => !fieldValue[k]);
      return missingKeys.length > 0;
    });
  }

  /**
   * Taken from ObjectInput in native sanity library
   */
  public onFieldChange = (fieldEvent: PatchEvent, field: IField) => {
    const { currentLanguage } = this.state;
    const { type, value = {}, isRoot, onChange } = this.props;
    const { fields } = type;
    if (currentLanguage) {
      const slug = createSlug(currentLanguage.name);
      let event = fieldEvent
        .prefixAll(field.name)
        .prefixAll(slug);
      // add setIfMissing for language
      if (!value[slug]) {
        event = event.prepend(setIfMissing({}, [slug]));
      }
      // remove data
      const currentFields = Object.keys(value[slug] || {});
      fields.forEach((k: IField) => {
        const index = currentFields.indexOf(k.name);
        if (index > -1) currentFields.splice(index, 1);
      });
      if (currentFields.length > 0) {
        currentFields.forEach(key => {
          event = event.prepend(unset([slug, key]));
        });
      }

      if (!isRoot) {
        event = event.prepend(setIfMissing(type.name === 'object' ? {} : { _type: type.name }));
        if (value) {
          const valueTypeName = value && value._type
          const schemaTypeName = type.name
          if (valueTypeName && schemaTypeName === 'object') {
            event = event.prepend(unset(['_type']))
          } else if (schemaTypeName !== 'object' && valueTypeName !== schemaTypeName) {
            event = event.prepend(set(schemaTypeName, ['_type']))
          }
        }
      }
      onChange(event);
    }
  }

  private onSelectLanguage = (lang: ILanguageObject) => {
    this.setState({
      currentLanguage: lang,
    });
  }

  public renderField = (field: IField) => {
    const { currentLanguage } = this.state;
    const { type, value, markers, readOnly, focusPath, onFocus, onBlur, filterField } = this.props
    if (!filterField(type, field) || field.type.hidden || !currentLanguage) return null;
    const slug = createSlug(currentLanguage.name);
    const fieldValue = value && value[slug] && value[slug][field.name]
    return (
      <Field
        key={`${currentLanguage}.${field.name}`}
        field={field}
        value={fieldValue}
        onChange={this.onFieldChange}
        onFocus={onFocus}
        onBlur={onBlur}
        markers={markers}
        focusPath={focusPath}
        level={type.level}
        readOnly={readOnly}
        filterField={filterField}
      />
    )
  }

  public loadLanguages = async () => {
    const { type: { options } } = this.props;
    this.setState({ fetchingLanguages: true });
    const languages: IState['languages'] = await getLanguagesFromOption(options.languages);
    this.setState({
      languages,
      currentLanguage: getBaseLanguage(languages, options.base),
      fetchingLanguages: false,
    });
  }

  public focus() {
  }

  public componentDidMount() {
    this.loadLanguages();
  }

  public render() {
    const config = getConfig();
    const { currentLanguage, languages, fetchingLanguages } = this.state;
    const { type } = this.props;
    const { fields, options } = type;
    const hasLanguages = languages.length > 0;
    const hasMissingTranslations = this.missingTranslations.length > 0;

    return (
      <>
        {options.css && (
          <style type="text/css">{options.css(styles)}</style>
        )}
        <div className={styles.root}>
          {fetchingLanguages ? (
            <div className={styles.loading}>
              <p className={styles.message}>{options.messages?.loading || config.messages.loading}</p>
            </div>
          ) : (
              <>
                <div className={styles.switch}>
                  {languages.map(lang => (
                    <button
                      key={lang.name}
                      className={styles.language}
                      disabled={lang.name === currentLanguage.name}
                      onClick={() => this.onSelectLanguage(lang)}
                    >
                      {lang.title}
                    </button>
                  ))}
                </div>
                {(hasLanguages && hasMissingTranslations) && (
                  <div className={styles.missing}>
                    <p className={styles.entry}>{options?.messages?.missingTranslations || config.messages.missingTranslations} ({getBaseLanguage(languages, options.base).title})</p>
                    <p className={styles.entry}><strong>{this.missingTranslations.map(l => l.title).join(', ')}</strong></p>
                  </div>
                )}
                {fields.map((field) => (
                  this.renderField(field)
                ))}
              </>
            )}
        </div>
      </>
    )
  }
}
export default Input;