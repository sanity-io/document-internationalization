import 'regenerator-runtime';
import * as React from 'react';
import slugify from 'slugify';
import styles from './input.scss';
import PatchEvent, { setIfMissing, unset, set } from '@sanity/form-builder/lib/PatchEvent';
import isEmpty from '@sanity/form-builder/lib/utils/isEmpty';
import Field from '@sanity/form-builder/lib/inputs/ObjectInput/Field';
import { IType, IField, IFieldSet } from '../types/IType';
import { ILanguageObject } from '../types/ILanguageObject';
import { getBaseLanguage, getConfig, getLanguagesFromOption } from '../utils';
import { getCollapsedWithDefaults } from './getCollapsedWithDefault';
import { Path, Marker } from '@sanity/types';
import Fieldset from 'part:@sanity/components/fieldsets/default';

interface IProps {
    type: IType;
    value: Record<string, any>;
    compareValue?: Record<string, unknown>
    onChange?: (...args: any[]) => any
    onFocus: (...args: any[]) => any
    onBlur: (...args: any[]) => any
    focusPath?: Path
    markers?: Marker[]
    level?: number
    readOnly?: boolean
    isRoot?: boolean
    filterField?: (...args: any[]) => any
    presence: any[]
}

interface IState {
    currentLanguage: ILanguageObject | null;
    fetchingLanguages: boolean;
    languages: ILanguageObject[];
}

const createSlug = (input: string) => slugify(input, { replacement: '_' }).replace(/-/g, '_');

class Input extends React.PureComponent<IProps, IState> {
    public static defaultProps = {
        onChange: () => {},
        level: 0,
        focusPath: [],
        isRoot: false,
        filterField: () => true,
    };
    private _firstField?: Field;
    public state: IState = {
        currentLanguage: null,
        fetchingLanguages: false,
        languages: [],
    };

    private get missingTranslations() {
        const { languages } = this.state;
        const { value } = this.props;
        if (languages.length === 0) return [];
        const existingValues = (() => {
            const l = this.getBaseLanguage();
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

    private getBaseLanguage(langs: ILanguageObject[] = []) {
        const { type: { type, options } } = this.props;
        const config = getConfig(type);
        const { languages } = this.state;
        return getBaseLanguage(langs || languages, options.base || config.base);
    }

    private setFirstField = (el: Field) => {
        this._firstField = el;
    }

    private focus() {
        this._firstField?.focus()
    }

    private onSelectLanguage = (lang: ILanguageObject) => {
        this.setState({
            currentLanguage: lang,
        });
    }

    private handleBlur = () => {
        const { value, onChange } = this.props;
        if (isEmpty(value) && onChange) {
            onChange(PatchEvent.from(unset()));
        }
    }

    private handleFieldChange = (fieldEvent: PatchEvent, field: IField) => {
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
            onChange && onChange(event);
        }
    }

    private renderField = (field: IField, level: number, index: number) => {
        const { currentLanguage } = this.state;
        const {
            type,
            value,
            markers,
            readOnly,
            focusPath,
            onFocus,
            onBlur,
            compareValue,
            filterField,
            presence,
        } = this.props;

        if ((filterField && !filterField(type, field)) || field.type.hidden) {
            return null
        }

        if (currentLanguage) {
            const slug = createSlug(currentLanguage.name);
            const fieldValue = value && value[slug] && value[slug][field.name];

            return (
                <Field
                    key={`${currentLanguage}.${field.name}`}
                    field={field}
                    value={fieldValue}
                    onChange={this.handleFieldChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    compareValue={compareValue}
                    markers={markers}
                    focusPath={focusPath}
                    level={level ?? 0}
                    presence={presence}
                    readOnly={readOnly}
                    filterField={filterField}
                    ref={index === 0 ? this.setFirstField : undefined}
                />
            )
        }
        return null;
    }

    private renderFieldset = (fieldset: IFieldSet, fieldsetIndex: number) => {
        const { level, focusPath, presence, onFocus, markers } = this.props
        const columns = fieldset.options && fieldset.options.columns
        const collapsibleOpts = getCollapsedWithDefaults(fieldset.options, level ?? 0)
        const isExpanded = focusPath && focusPath.length > 0 && fieldset.fields.some((field: IField) => focusPath[0] === field.name)

        const fieldNames = fieldset.fields.map((f) => f.name)

        const childPresence =
            presence.length === 0
                ? presence
                : presence.filter((item) => fieldNames.includes(item.path[0]))

        const childMarkers = markers ? (markers.length === 0 ? markers : markers.filter((item) => (
            item.path && item.path[0] ? fieldNames.includes(String(item.path[0])) : false
        ))) : [];

        const isCollapsed = !isExpanded && collapsibleOpts.collapsed
        return (
            <div key={fieldset.name} className={styles.fieldset}>
                <Fieldset
                    legend={fieldset.title}
                    description={fieldset.description}
                    level={(level ?? 0) + 1}
                    columns={columns}
                    isCollapsible={collapsibleOpts.collapsible}
                    isCollapsed={isCollapsed}
                    presence={childPresence}
                    onFocus={onFocus}
                    changeIndicator={false}
                    markers={childMarkers}
                >
                    {fieldset.fields.map((field, fieldIndex) => {
                        return this.renderField(field, (level ?? 0) + 2, fieldsetIndex + fieldIndex)
                    })}
                </Fieldset>
            </div>
        )
    }

    private getRenderedFields = () => {
        const { type, level } = this.props
        if (!type.fieldsets) {
            // this is a fallback for schema types that are not parsed to be objects, but still has jsonType == 'object'
            return (type.fields || []).map((field, i) => this.renderField(field, (level ?? 0) + 1, i))
        }
        return type.fieldsets.map((fieldset, i) => {
            return fieldset.single
                ? this.renderField(fieldset.field, (level ?? 0) + 1, i)
                : this.renderFieldset(fieldset, i)
        })
    }

    private getRenderedObjectInput = () => {
        const { type, level, focusPath, onFocus, presence, markers } = this.props
        const renderedFields = this.getRenderedFields()

        if (level === 0) {
            return (
                <div>
                    <div className={styles.fieldWrapper}>
                        {renderedFields}
                    </div>
                </div>
            )
        }

        const collapsibleOpts = getCollapsedWithDefaults(type.options, level ?? 0)
        const isExpanded = focusPath && focusPath.length > 0
        const columns = type.options && type.options.columns
        const isCollapsed = !isExpanded && collapsibleOpts.collapsed
        return (
            <div>
                <Fieldset
                    level={level}
                    legend={type.title}
                    description={type.description}
                    columns={columns}
                    isCollapsible={collapsibleOpts.collapsible}
                    isCollapsed={isCollapsed}
                    markers={markers}
                    presence={presence}
                    onFocus={onFocus}
                    changeIndicator={false}
                >
                    {renderedFields}
                </Fieldset>
            </div>
        )
    }

    public loadLanguages = async () => {
        const { type: { type, options } } = this.props;
        const config = getConfig(type);
        this.setState({ fetchingLanguages: true });
        const languages: IState['languages'] = await getLanguagesFromOption(options.languages || config.languages);
        this.setState({
            languages,
            currentLanguage: this.getBaseLanguage(languages),
            fetchingLanguages: false,
        });
    }

    public componentDidMount() {
        this.loadLanguages();
    }

    public render() {
        const { currentLanguage, languages, fetchingLanguages } = this.state;
        const { type } = this.props;
        const { fields, options } = type;
        const config = getConfig(type.type);
        const baseLanguage = this.getBaseLanguage();
        const hasLanguages = languages.length > 0;
        const hasMissingTranslations = this.missingTranslations.length > 0;
        const renderedObjectInput = this.getRenderedObjectInput();

        return (
            <>
                {options.css && (
                    <style type="text/css">{options.css(styles)}</style>
                )}
                <div className={styles.root}>
                    {fetchingLanguages ? (
                        <div className={styles.loading}>
                            <p className={styles.message}>{options.messages?.loading || config.messages?.loading}</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.switch}>
                                {languages.map(lang => (
                                    <button
                                        key={lang.name}
                                        className={styles.language}
                                        disabled={lang.name === currentLanguage?.name}
                                        onClick={() => this.onSelectLanguage(lang)}
                                    >
                                        {lang.title}
                                    </button>
                                ))}
                            </div>
                            {(hasLanguages && hasMissingTranslations) && (
                                <div className={styles.missing}>
                                    <p className={styles.entry}>{options?.messages?.missingTranslations || config.messages?.missingTranslations} ({baseLanguage?.title})</p>
                                    <p className={styles.entry}><strong>{this.missingTranslations.map(l => l.title).join(', ')}</strong></p>
                                </div>
                            )}
                            {renderedObjectInput}
                        </>
                    )}
                </div>
            </>
        )
    }
}

export default Input;